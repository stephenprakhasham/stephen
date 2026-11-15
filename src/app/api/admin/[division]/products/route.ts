import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { listProducts, slugify } from "@/lib/catalogue";
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
  const rows = await listProducts(div, {
    status: url.searchParams.get("status") ?? undefined,
    categoryId: url.searchParams.get("categoryId") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    limit: Number(url.searchParams.get("limit")) || 100,
  });
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
  } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | {
        name?: string;
        category_id?: string | null;
        brand_id?: string | null;
        sku?: string;
        short_description?: string;
        description?: string;
        retail_price?: number;
        wholesale_price?: number;
        cost_price?: number;
        compare_at_price?: number;
        tax_rate?: number;
        stock_quantity?: number;
        image_urls?: string[];
        status?: string;
      }
    | null;
  if (!body?.name) return NextResponse.json({ error: "name is required." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      division_id: div,
      category_id: body.category_id ?? null,
      brand_id: body.brand_id ?? null,
      name: body.name,
      slug: slugify(body.name),
      sku: body.sku ?? null,
      short_description: body.short_description ?? null,
      description: body.description ?? null,
      retail_price: body.retail_price ?? null,
      wholesale_price: body.wholesale_price ?? null,
      cost_price: body.cost_price ?? null,
      compare_at_price: body.compare_at_price ?? null,
      tax_rate: body.tax_rate ?? 0,
      stock_quantity: body.stock_quantity ?? 0,
      image_urls: body.image_urls ?? [],
      status: body.status ?? "draft",
      is_published: (body.status ?? "draft") === "published",
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await writeAudit({ action: "create", entityType: "products", entityId: data.id, divisionId: div, newValues: data });
  return NextResponse.json(data);
}