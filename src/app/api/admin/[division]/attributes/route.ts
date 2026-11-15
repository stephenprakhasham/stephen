import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { listAttributeDefinitions } from "@/lib/catalogue";
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
  req: Request,
  { params }: { params: Promise<{ division: string }> }
) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); } catch (e) { return authError(e); }

  const url = new URL(req.url);
  const categoryId = url.searchParams.get("categoryId") ?? undefined;
  return NextResponse.json(await listAttributeDefinitions(div, categoryId));
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
    | {
        category_id?: string | null;
        key?: string;
        label?: string;
        field_type?: string;
        required?: boolean;
        searchable?: boolean;
        public_display?: boolean;
        variant_defining?: boolean;
        unit?: string;
        sort_order?: number;
      }
    | null;
  if (!body?.label || !body?.key) {
    return NextResponse.json({ error: "label and key are required." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_attribute_definitions")
    .insert({
      division_id: div,
      category_id: body.category_id ?? null,
      key: body.key,
      label: body.label,
      field_type: body.field_type ?? "text",
      required: body.required ?? false,
      searchable: body.searchable ?? false,
      public_display: body.public_display ?? true,
      variant_defining: body.variant_defining ?? false,
      unit: body.unit ?? null,
      sort_order: body.sort_order ?? 0,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAudit({ action: "create", entityType: "product_attribute_definitions", entityId: data.id, divisionId: div, newValues: data });
  return NextResponse.json(data);
}