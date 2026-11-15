import type { DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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