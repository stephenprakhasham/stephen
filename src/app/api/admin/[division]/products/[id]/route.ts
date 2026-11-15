import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { writeAudit } from "@/lib/audit";

const VALID: DivisionId[] = ["mobiles", "jewellery", "digital"];
const parseDivision = (p: string): DivisionId | null =>
  (VALID as string[]).includes(p) ? (p as DivisionId) : null;

function authError(e: unknown) {
  const s = e instanceof AuthError ? e.status : 401;
  return NextResponse.json({ error: (e as Error).message }, { status: s });
}

type Ctx = { params: Promise<{ division: string; id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { division, id } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try {
    await requireDivision(div);
    await requirePermission("catalogue.edit");
  } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("products")
    .select("id, division_id")
    .eq("id", id)
    .maybeSingle();
  if (!existing || existing.division_id !== div) {
    return NextResponse.json({ error: "Product not found in this division." }, { status: 404 });
  }

  const allowed = [
    "category_id", "brand_id", "name", "short_description", "description",
    "retail_price", "wholesale_price", "cost_price", "compare_at_price",
    "tax_rate", "stock_quantity", "image_urls", "status",
  ];
  const update: Record<string, unknown> = {};
  for (const k of allowed) if (k in body) update[k] = body[k];
  if ("status" in body) update.is_published = body.status === "published";

  const { data, error } = await supabase
    .from("products")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAudit({
    action: "update",
    entityType: "products",
    entityId: id,
    divisionId: div,
    oldValues: existing,
    newValues: update,
  });
  return NextResponse.json(data);
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { division, id } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try {
    await requireDivision(div);
    await requirePermission("catalogue.delete");
  } catch (e) { return authError(e); }

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("products")
    .select("id, division_id, name")
    .eq("id", id)
    .maybeSingle();
  if (!existing || existing.division_id !== div) {
    return NextResponse.json({ error: "Product not found in this division." }, { status: 404 });
  }

  // Archive instead of hard delete (preserves history).
  const { error } = await supabase
    .from("products")
    .update({ status: "archived", is_published: false })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAudit({ action: "delete", entityType: "products", entityId: id, divisionId: div, oldValues: existing });
  return NextResponse.json({ ok: true, archived: true });
}