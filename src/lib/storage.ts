import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

export const PRODUCT_MEDIA_BUCKET = "product-media";

export interface ProductImageRow {
  id: string;
  product_id: string;
  division_id: string;
  url: string;
  alt: string | null;
  is_main: boolean;
  sort_order: number;
  is_360: boolean;
  created_at: string;
}

/**
 * Upload an image file to the product-media bucket and return its public URL.
 * Server-side helper: uses the caller session (admin authenticated).
 */
export async function uploadProductImage(
  division: string,
  productId: string,
  file: File
): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${division}/${productId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete an image from storage by its public URL path.
 */
export async function deleteProductImage(url: string): Promise<void> {
  const marker = `/${PRODUCT_MEDIA_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const path = decodeURIComponent(url.slice(idx + marker.length));

  const supabase = await createSupabaseServerClient();
  await supabase.storage.from(PRODUCT_MEDIA_BUCKET).remove([path]);
}

/**
 * List product images ordered by sort_order.
 */
export async function listProductImages(productId: string): Promise<ProductImageRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order");
  return data ?? [];
}

/**
 * Add a product image row.
 */
export async function addProductImage(
  division: string,
  productId: string,
  url: string,
  alt: string | null,
  isMain: boolean,
  sortOrder: number,
  is360: boolean = false
): Promise<ProductImageRow> {
  const supabase = await createSupabaseServerClient();
  if (isMain && !is360) {
    await supabase
      .from("product_images")
      .update({ is_main: false })
      .eq("product_id", productId);
  }
  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      division_id: division,
      url,
      alt,
      is_main: isMain && !is360,
      sort_order: sortOrder,
      is_360: is360,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update an existing product image row.
 */
export async function updateProductImage(
  productId: string,
  imageId: string,
  patch: { alt?: string | null; is_main?: boolean; sort_order?: number; is_360?: boolean }
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (patch.is_main) {
    await supabase
      .from("product_images")
      .update({ is_main: false })
      .eq("product_id", productId);
  }
  const { error } = await supabase
    .from("product_images")
    .update(patch)
    .eq("id", imageId);
  if (error) throw new Error(error.message);
}

/**
 * Delete a product image row and its storage object.
 */
export async function removeProductImage(imageId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("product_images")
    .select("url")
    .eq("id", imageId)
    .maybeSingle();
  if (data?.url) {
    await deleteProductImage(data.url);
  }
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);
  if (error) throw new Error(error.message);
}