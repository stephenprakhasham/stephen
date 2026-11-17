import type { DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient, createPublicSupabaseClient } from "@/lib/supabase-server";

export interface CategoryRow {
  id: string;
  division_id: DivisionId;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
}

export interface BrandRow {
  id: string;
  division_id: DivisionId;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface AttributeDefinitionRow {
  id: string;
  division_id: DivisionId;
  category_id: string | null;
  key: string;
  label: string;
  field_type: string;
  required: boolean;
  searchable: boolean;
  public_display: boolean;
  variant_defining: boolean;
  unit: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ProductRow {
  id: string;
  division_id: DivisionId;
  category_id: string | null;
  brand_id: string | null;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  retail_price: number | null;
  wholesale_price: number | null;
  cost_price: number | null;
  compare_at_price: number | null;
  tax_rate: number | null;
  stock_quantity: number;
  image_urls: string[];
  status: string;
  is_published: boolean;
}

export async function listCategories(division: DivisionId) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("division_id", division)
    .order("sort_order")
    .order("name");
  return (data ?? []) as CategoryRow[];
}

export async function listBrands(division: DivisionId) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("brands")
    .select("*")
    .eq("division_id", division)
    .order("sort_order")
    .order("name");
  return (data ?? []) as BrandRow[];
}

export async function listAttributeDefinitions(
  division: DivisionId,
  categoryId?: string
) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("product_attribute_definitions")
    .select("*")
    .eq("division_id", division);
  if (categoryId) query = query.eq("category_id", categoryId);
  const { data } = await query.order("sort_order");
  return (data ?? []) as AttributeDefinitionRow[];
}

export async function listProducts(
  division: DivisionId,
  opts: { status?: string; categoryId?: string; search?: string; limit?: number } = {}
) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("division_id", division);
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.categoryId) query = query.eq("category_id", opts.categoryId);
  if (opts.search) query = query.ilike("name", `%${opts.search}%`);
  const { data } = await query
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 100);
  return (data ?? []) as ProductRow[];
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export interface PublicProductImage {
  id: string;
  url: string;
  alt: string | null;
  is_main: boolean;
  sort_order: number;
  is_360: boolean;
}

export interface PublicVariant {
  id: string;
  sku: string | null;
  title: string | null;
  retail_price: number | null;
  stock_quantity: number;
  image_url: string | null;
}

export interface PublicProductDetail {
  id: string;
  division_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  retail_price: number | null;
  compare_at_price: number | null;
  image_urls: string[];
  material_finish: string | null;
  size_or_variant: string | null;
  category_name: string | null;
  images: PublicProductImage[];
  variants: PublicVariant[];
}

export async function getPublicProductBySlug(
  division: string,
  slug: string
): Promise<PublicProductDetail | null> {
  const supabase = createPublicSupabaseClient();
  const { data: product } = await supabase
    .from("catalogue_products")
    .select(
      "id, division_id, name, slug, short_description, description, retail_price, compare_at_price, image_urls, material_finish, size_or_variant, category_id"
    )
    .eq("division_id", division)
    .eq("slug", slug)
    .maybeSingle();
  if (!product) return null;

  // Fetch category name if category_id exists
  let categoryName: string | null = null;
  if (product.category_id) {
    const { data: category } = await supabase
      .from("categories")
      .select("name")
      .eq("id", product.category_id)
      .single();
    categoryName = category?.name ?? null;
  }

  const { data: images } = await supabase
    .from("product_images")
    .select("id, url, alt, is_main, sort_order, is_360")
    .eq("product_id", product.id)
    .order("sort_order");

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, sku, title, retail_price, stock_quantity, image_url")
    .eq("product_id", product.id)
    .eq("is_active", true)
    .order("created_at");

  return {
    ...(product as Omit<PublicProductDetail, "images" | "variants" | "category_name">),
    category_name: categoryName,
    images: (images ?? []) as PublicProductImage[],
    variants: (variants ?? []) as PublicVariant[],
  };
}

export interface CatalogueListProduct {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  retail_price: number | null;
  compare_at_price: number | null;
  image_url: string | null;
  images: { id: string; url: string; alt: string | null; is_main: boolean; is_360: boolean; sort_order: number }[];
  category_name: string | null;
  material_finish: string | null;
  division: string;
}

export async function getPublicProductsForDivision(
  division: string,
  limit = 24
): Promise<CatalogueListProduct[]> {
  const supabase = createPublicSupabaseClient();

  let query = supabase
    .from("catalogue_products")
    .select(
      "id, division_id, category_id, brand_id, name, slug, short_description, description, retail_price, compare_at_price, image_urls, material_finish, size_or_variant, status"
    )
    .eq("division_id", division);

  const { data: products, error } = await query
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !products || products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const categoryIds = [...new Set(products.map((p) => p.category_id).filter(Boolean))] as string[];

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

  return products.map((p) => {
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
    };
  });
}