import { NextResponse } from "next/server";
import {
  requireDivision,
  requirePermission,
  AuthError,
  type DivisionId,
} from "@/lib/admin-auth";
import { listCategories, slugify } from "@/lib/catalogue";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { writeAudit } from "@/lib/audit";

const VALID: DivisionId[] = ["mobiles", "jewellery", "digital"];

function parseDivision(p: string): DivisionId | null {
  return (VALID as string[]).includes(p) ? (p as DivisionId) : null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ division: string }> }
) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try {
    await requireDivision(div);
  } catch (e) {
    const s = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: (e as Error).message }, { status: s });
  }
  const rows = await listCategories(div);
  return NextResponse.json(rows);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ division: string }> }
) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try {
    await requireDivision(div);
    await requirePermission("catalogue.create");
  } catch (e) {
    const s = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: (e as Error).message }, { status: s });
  }

  const body = (await req.json().catch(() => null)) as
    | { name?: string; parent_id?: string | null; description?: string; sort_order?: number }
    | null;
  if (!body?.name) {
    return NextResponse.json({ error: "name is required." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      division_id: div,
      name: body.name,
      slug: slugify(body.name),
      parent_id: body.parent_id ?? null,
      description: body.description ?? null,
      sort_order: body.sort_order ?? 0,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAudit({
    action: "create",
    entityType: "categories",
    entityId: data.id,
    divisionId: div,
    newValues: data,
  });
  return NextResponse.json(data);
}