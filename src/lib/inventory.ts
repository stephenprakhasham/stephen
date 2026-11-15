import type { DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type {
  InventoryRow,
  StockMovementRow,
  StockMovementType,
} from "@/lib/inventory-types";

export type { InventoryRow, StockMovementRow, StockMovementType };
export { STOCK_MOVEMENT_TYPES } from "@/lib/inventory-types";

export async function listInventory(
  division: DivisionId,
  opts: { variantId?: string; lowStock?: boolean; limit?: number } = {}
): Promise<InventoryRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("inventory")
    .select("*")
    .eq("division_id", division);

  if (opts.variantId) query = query.eq("product_variant_id", opts.variantId);
  if (opts.lowStock) query = query.filter("quantity_available", "<=", "reorder_point");

  const { data } = await query
    .order("product_variant_id")
    .limit(opts.limit ?? 200);

  return (data ?? []) as InventoryRow[];
}

export async function getInventoryByVariant(
  division: DivisionId,
  variantId: string,
  warehouseId?: string
): Promise<InventoryRow | null> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("inventory")
    .select("*")
    .eq("division_id", division)
    .eq("product_variant_id", variantId);

  if (warehouseId) query = query.eq("warehouse_id", warehouseId);

  const { data } = await query.maybeSingle();
  return (data as InventoryRow) ?? null;
}

export async function createStockMovement(input: {
  division: DivisionId;
  productVariantId: string;
  warehouseId: string;
  movementType: StockMovementType;
  quantityChange: number;
  referenceType?: string;
  referenceId?: string;
  unitCost?: number;
  notes?: string;
  createdBy?: string;
}): Promise<StockMovementRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("stock_movements")
    .insert({
      division_id: input.division,
      product_variant_id: input.productVariantId,
      warehouse_id: input.warehouseId,
      movement_type: input.movementType,
      quantity_change: input.quantityChange,
      reference_type: input.referenceType ?? null,
      reference_id: input.referenceId ?? null,
      unit_cost: input.unitCost ?? null,
      notes: input.notes ?? null,
      created_by: input.createdBy ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Stock movement failed: ${error.message}`);
  return data as StockMovementRow;
}

export async function adjustStock(input: {
  division: DivisionId;
  productVariantId: string;
  warehouseId: string;
  newQuantity: number;
  notes?: string;
  createdBy?: string;
}): Promise<{ previous: number; current: InventoryRow }> {
  const supabase = await createSupabaseServerClient();

  const { data: existing } = await supabase
    .from("inventory")
    .select("*")
    .eq("division_id", input.division)
    .eq("product_variant_id", input.productVariantId)
    .eq("warehouse_id", input.warehouseId)
    .maybeSingle();

  if (!existing) {
    throw new Error("Inventory row not found for variant/warehouse.");
  }

  const diff = input.newQuantity - existing.quantity_on_hand;

  const { data: updated, error } = await supabase
    .from("inventory")
    .update({
      quantity_on_hand: input.newQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) throw new Error(`Stock adjustment failed: ${error.message}`);

  await createStockMovement({
    division: input.division,
    productVariantId: input.productVariantId,
    warehouseId: input.warehouseId,
    movementType: "adjustment",
    quantityChange: diff,
    referenceType: "adjustment",
    notes: input.notes ?? `Adjusted from ${existing.quantity_on_hand} to ${input.newQuantity}`,
    createdBy: input.createdBy,
  });

  return { previous: existing.quantity_on_hand, current: updated as InventoryRow };
}

export async function reserveStock(
  division: DivisionId,
  variantId: string,
  warehouseId: string,
  quantity: number
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: row, error } = await supabase
    .from("inventory")
    .select("id, quantity_available, quantity_reserved")
    .eq("division_id", division)
    .eq("product_variant_id", variantId)
    .eq("warehouse_id", warehouseId)
    .maybeSingle();

  if (error || !row) {
    throw new Error(`No inventory record for variant ${variantId} in warehouse ${warehouseId}.`);
  }

  if (row.quantity_available < quantity) {
    throw new Error(`Insufficient stock: available ${row.quantity_available}, requested ${quantity}.`);
  }

  await supabase
    .from("inventory")
    .update({
      quantity_reserved: row.quantity_reserved + quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
}

export async function releaseStock(
  division: DivisionId,
  variantId: string,
  warehouseId: string,
  quantity: number
): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { data: row } = await supabase
    .from("inventory")
    .select("id, quantity_reserved")
    .eq("division_id", division)
    .eq("product_variant_id", variantId)
    .eq("warehouse_id", warehouseId)
    .maybeSingle();

  if (!row) return;

  const newReserved = Math.max(0, row.quantity_reserved - quantity);
  await supabase
    .from("inventory")
    .update({
      quantity_reserved: newReserved,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);
}

export async function getLowStock(division: DivisionId): Promise<InventoryRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inventory")
    .select("*")
    .eq("division_id", division)
    .filter("quantity_available", "<=", "reorder_point")
    .order("quantity_available", { ascending: true })
    .limit(100);
  return (data ?? []) as InventoryRow[];
}