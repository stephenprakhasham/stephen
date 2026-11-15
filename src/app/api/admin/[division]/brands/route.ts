import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { listBrands, slugify } from "@/lib/catalogue";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { writeAudit } from "@/lib/audit";

const VALID: DivisionId[] = ["mobiles", "jewellery", "digital"];
const parseDivision = (p: string): DivisionId | null =>
  (VALID as string[]).includes(p) ? (p as DivisionId) : null;

function authError(e: unknown) {
  const s = e instanceof AuthError ? e.status : 401;
  return NextResponse.json({ error: (e as Error).message }, { status: s });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ division: string }> }
) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); } catch (e) { return authError(e); }
  return NextResponse.json(await listBrands(div));
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
  } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | { name?: string; description?: string; website?: string }
    | null;
  if (!body?.name) return NextResponse.json({ error: "name is required." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("brands")
    .insert({
      division_id: div,
      name: body.name,
      slug: slugify(body.name),
      description: body.description ?? null,
      website: body.website ?? null,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAudit({ action: "create", entityType: "brands", entityId: data.id, divisionId: div, newValues: data });
  return NextResponse.json(data);
}