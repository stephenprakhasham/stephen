import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const VALID = ["mobiles", "jewellery", "digital"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const division = url.searchParams.get("division");
  const categoryId = url.searchParams.get("categoryId");
  const search = url.searchParams.get("search");
  const slug = url.searchParams.get("slug");
  const limit = Math.min(Number(url.searchParams.get("limit")) || 60, 100);

  if (division && !VALID.includes(division)) {
    return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  // Fetch products
  let query = supabase
    .from("catalogue_products")
    .select(
      "id, division_id, category_id, brand_id, name, slug, short_description, description, retail_price, compare_at_price, image_urls, material_finish, size_or_variant, status"
    );
  if (division) query = query.eq("division_id", division);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (search) query = query.ilike("name", `%${search}%`);
  if (slug) query = query.eq("slug", slug);

  const { data: products, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!products || products.length === 0) return NextResponse.json([]);

  const productIds = products.map((p) => p.id);
  const categoryIds = [...new Set(products.map((p) => p.category_id).filter(Boolean))] as string[];

  // Fetch categories and images in parallel
  const [categoriesResult, imagesResult] = await Promise.all([
    categoryIds.length > 0
      ? supabase.from("categories").select("id, name").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("product_images")
      .select("id, product_id, url, alt, is_main, is_360, sort_order")
      .in("product_id", productIds)
      .order("sort_order"),
  ]);

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesResult.data ?? []) {
    categoryMap.set(cat.id, cat.name);
  }

  const imagesByProduct = new Map<string, { id: string; url: string; alt: string | null; is_main: boolean; is_360: boolean; sort_order: number }[]>();
  for (const img of imagesResult.data ?? []) {
    if (!imagesByProduct.has(img.product_id)) {
      imagesByProduct.set(img.product_id, []);
    }
    imagesByProduct.get(img.product_id)!.push({
      id: img.id,
      url: img.url,
      alt: img.alt,
      is_main: img.is_main,
      is_360: img.is_360 ?? false,
      sort_order: img.sort_order,
    });
  }

  // Fallback to image_urls column if no product_images entry
  for (const p of products) {
    if (p.image_urls?.length && !imagesByProduct.has(p.id)) {
      imagesByProduct.set(p.id, p.image_urls.map((url: string, idx: number) => ({
        id: `fallback-${idx}`,
        url,
        alt: null,
        is_main: idx === 0,
        is_360: false,
        sort_order: idx,
      })));
    }
  }

  const result = products.map((p) => {
    const productImages = imagesByProduct.get(p.id) ?? [];
    const mainImage = productImages.find((img) => img.is_main)?.url ?? productImages[0]?.url ?? null;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      short_description: p.short_description,
      description: p.description,
      retail_price: p.retail_price,
      compare_at_price: p.compare_at_price,
      image_url: mainImage,
      images: productImages.filter((img) => !img.is_360),
      category_name: p.category_id ? categoryMap.get(p.category_id) ?? null : null,
      material_finish: p.material_finish,
      division: p.division_id,
      divisionName: p.division_id.charAt(0).toUpperCase() + p.division_id.slice(1),
    };
  });

  return NextResponse.json(result);
}