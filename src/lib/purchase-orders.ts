import type { DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type {
  PurchaseOrderRow,
  PurchaseOrderLineRow,
  POStatus,
} from "@/lib/inventory-types";

export type { PurchaseOrderRow, PurchaseOrderLineRow, POStatus };
export { PO_STATUSES } from "@/lib/inventory-types";

export async function listPurchaseOrders(
  division: DivisionId,
  opts: { status?: string; vendorId?: string; limit?: number } = {}
): Promise<PurchaseOrderRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("purchase_orders")
    .select("*")
    .eq("division_id", division);
  if (opts.status) query = query.eq("status", opts.status);
  if (opts.vendorId) query = query.eq("vendor_id", opts.vendorId);
  const { data } = await query
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 100);
  return (data ?? []) as PurchaseOrderRow[];
}

export async function getPurchaseOrder(
  division: DivisionId,
  id: string
): Promise<PurchaseOrderRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("purchase_orders")
    .select("*")
    .eq("division_id", division)
    .eq("id", id)
    .maybeSingle();
  return (data as PurchaseOrderRow) ?? null;
}

export async function getPurchaseOrderLines(
  purchaseOrderId: string
): Promise<PurchaseOrderLineRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("purchase_order_lines")
    .select("*")
    .eq("purchase_order_id", purchaseOrderId);
  return (data ?? []) as PurchaseOrderLineRow[];
}

export async function createPurchaseOrder(input: {
  division: DivisionId;
  vendorId: string;
  warehouseId?: string;
  expectedDate?: string;
  notes?: string;
  lines: {
    productVariantId: string;
    quantityOrdered: number;
    unitPrice: number;
  }[];
}): Promise<PurchaseOrderRow> {
  const supabase = await createSupabaseServerClient();

  // Get next PO number from helper.
  const { data: poNumber } = await supabase.rpc("next_po_number", { div: input.division });
  const poNo = poNumber as string;

  const subtotal = input.lines.reduce(
    (sum, l) => sum + l.quantityOrdered * l.unitPrice,
    0
  );

  const { data: po, error } = await supabase
    .from("purchase_orders")
    .insert({
      division_id: input.division,
      vendor_id: input.vendorId,
      po_number: poNo,
      status: "draft",
      order_date: new Date().toISOString().slice(0, 10),
      expected_date: input.expectedDate ?? null,
      subtotal,
      tax_amount: 0,
      total_amount: subtotal,
      currency: "INR",
      notes: input.notes ?? null,
      warehouse_id: input.warehouseId ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);

  if (input.lines.length) {
    const { error: lineError } = await supabase.from("purchase_order_lines").insert(
      input.lines.map((l) => ({
        purchase_order_id: po.id,
        division_id: input.division,
        product_variant_id: l.productVariantId,
        quantity_ordered: l.quantityOrdered,
        quantity_received: 0,
        unit_price: l.unitPrice,
      }))
    );
    if (lineError) throw new Error(`PO line insert failed: ${lineError.message}`);
  }

  return po as PurchaseOrderRow;
}

export async function updatePOStatus(
  division: DivisionId,
  id: string,
  status: POStatus,
  notes?: string
): Promise<PurchaseOrderRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .update({
      status,
      notes: notes ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("division_id", division)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as PurchaseOrderRow;
}

export async function receivePOLine(input: {
  division: DivisionId;
  lineId: string;
  quantityToReceive: number;
  receivedBy?: string;
}): Promise<PurchaseOrderLineRow> {
  const supabase = await createSupabaseServerClient();

  // Fetch the line to validate.
  const { data: line } = await supabase
    .from("purchase_order_lines")
    .select("*")
    .eq("id", input.lineId)
    .maybeSingle();

  if (!line) throw new Error("PO line not found.");
  if (line.quantity_received + input.quantityToReceive > line.quantity_ordered) {
    throw new Error(
      `Cannot receive ${input.quantityToReceive}: ordered ${line.quantity_ordered}, already received ${line.quantity_received}.`
    );
  }

  const { data: updated, error } = await supabase
    .from("purchase_order_lines")
    .update({
      quantity_received: line.quantity_received + input.quantityToReceive,
      received_at: new Date().toISOString(),
      received_by: input.receivedBy ?? null,
    })
    .eq("id", input.lineId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  // Create stock movement for the received quantity.
  const { data: po } = await supabase
    .from("purchase_orders")
    .select("warehouse_id, division_id")
    .eq("id", line.purchase_order_id)
    .maybeSingle();

  const warehouseId = po?.warehouse_id ?? null;
  if (warehouseId) {
    await supabase.from("stock_movements").insert({
      division_id: input.division,
      product_variant_id: line.product_variant_id,
      warehouse_id: warehouseId,
      movement_type: "purchase_receipt",
      quantity_change: input.quantityToReceive,
      reference_type: "purchase_order_line",
      reference_id: input.lineId,
      unit_cost: line.unit_price,
      created_by: input.receivedBy ?? null,
    });
  }

  return updated as PurchaseOrderLineRow;
}

export async function autoUpdatePOStatus(
  division: DivisionId,
  purchaseOrderId: string
): Promise<PurchaseOrderRow | null> {
  const supabase = await createSupabaseServerClient();

  // Check if all lines are fully received.
  const lines = await getPurchaseOrderLines(purchaseOrderId);
  const allReceived = lines.every((l) => l.quantity_received >= l.quantity_ordered);
  const anyReceived = lines.some((l) => l.quantity_received > 0);

  let newStatus: POStatus = "draft";
  if (allReceived) newStatus = "received";
  else if (anyReceived) newStatus = "partial";

  const { data: current } = await supabase
    .from("purchase_orders")
    .select("status")
    .eq("id", purchaseOrderId)
    .maybeSingle();

  if (!current || current.status === newStatus) return null;

  return updatePOStatus(division, purchaseOrderId, newStatus);
}