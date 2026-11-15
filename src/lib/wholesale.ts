import type { DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type {
  WholesalePriceRow,
  CustomerTier,
} from "@/lib/inventory-types";

export type { WholesalePriceRow, CustomerTier };
export { CUSTOMER_TIERS } from "@/lib/inventory-types";

export async function listWholesalePrices(
  division: DivisionId,
  opts: { variantId?: string; tier?: CustomerTier } = {}
): Promise<WholesalePriceRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("wholesale_prices")
    .select("*")
    .eq("division_id", division);
  if (opts.variantId) query = query.eq("product_variant_id", opts.variantId);
  if (opts.tier) query = query.eq("tier", opts.tier);
  const { data } = await query.order("min_quantity");
  return (data ?? []) as WholesalePriceRow[];
}

export async function getWholesalePrice(
  division: DivisionId,
  variantId: string,
  tier: CustomerTier,
  quantity: number
): Promise<number | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("wholesale_prices")
    .select("*")
    .eq("division_id", division)
    .eq("product_variant_id", variantId)
    .eq("tier", tier)
    .lte("min_quantity", quantity)
    .order("min_quantity", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return (data as WholesalePriceRow).price;
}

export async function upsertWholesalePrice(input: {
  division: DivisionId;
  productVariantId: string;
  tier: CustomerTier;
  minQuantity: number;
  price: number;
}): Promise<WholesalePriceRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("wholesale_prices")
    .upsert(
      {
        division_id: input.division,
        product_variant_id: input.productVariantId,
        tier: input.tier,
        min_quantity: input.minQuantity,
        price: input.price,
      },
      { onConflict: "product_variant_id,tier,min_quantity" }
    )
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as WholesalePriceRow;
}

export async function deleteWholesalePrice(
  division: DivisionId,
  id: string
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("wholesale_prices")
    .delete()
    .eq("division_id", division)
    .eq("id", id);
}

export async function validateMOQ(
  division: DivisionId,
  variantId: string,
  tier: CustomerTier,
  quantity: number
): Promise<{ valid: boolean; requiredMin: number; price: number | null }> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("wholesale_prices")
    .select("min_quantity, price")
    .eq("division_id", division)
    .eq("product_variant_id", variantId)
    .eq("tier", tier)
    .order("min_quantity")
    .limit(1)
    .maybeSingle();

  if (!data) {
    return { valid: true, requiredMin: 0, price: null };
  }

  const minQty = (data as { min_quantity: number }).min_quantity;
  const price = (data as { price: number }).price;

  return {
    valid: quantity >= minQty,
    requiredMin: minQty,
    price: quantity >= minQty ? price : null,
  };
}