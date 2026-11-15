import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const VALID = ["mobiles", "jewellery", "digital"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const division = url.searchParams.get("division");
  const categoryId = url.searchParams.get("categoryId");
  const search = url.searchParams.get("search");
  const limit = Math.min(Number(url.searchParams.get("limit")) || 60, 100);

  if (division && !VALID.includes(division)) {
    return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("catalogue_products")
    .select(
      "id, division_id, category_id, brand_id, name, slug, short_description, description, retail_price, compare_at_price, image_urls, material_finish, size_or_variant, status"
    );
  if (division) query = query.eq("division_id", division);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data ?? []);
}