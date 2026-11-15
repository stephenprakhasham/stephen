import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { getOrderItems, getOrderStatusHistory } from "@/lib/orders";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { writeAudit } from "@/lib/audit";
import { releaseStock, createStockMovement } from "@/lib/inventory";
import { getDefaultWarehouse } from "@/lib/warehouses";

const VALID: DivisionId[] = ["mobiles", "jewellery", "digital"];
const parseDivision = (p: string): DivisionId | null =>
  (VALID as string[]).includes(p) ? (p as DivisionId) : null;
const authError = (e: unknown) =>
  NextResponse.json({ error: (e as Error).message }, { status: e instanceof AuthError ? e.status : 401 });

type Ctx = { params: Promise<{ division: string; id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { division, id } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); } catch (e) { return authError(e); }

  const supabase = await createSupabaseServerClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order || order.division_id !== div) {
    return NextResponse.json({ error: "Order not found in this division." }, { status: 404 });
  }
  const [items, history] = await Promise.all([getOrderItems(id), getOrderStatusHistory(id)]);
  return NextResponse.json({ order, items, history });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { division, id } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("orders.status"); } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | { status?: string; payment_status?: string; payment_method?: string; total_amount?: number; internal_notes?: string; reason?: string }
    | null;
  if (!body) return NextResponse.json({ error: "Invalid body." }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase.from("orders").select("id, division_id, status").eq("id", id).maybeSingle();
  if (!existing || existing.division_id !== div) {
    return NextResponse.json({ error: "Order not found in this division." }, { status: 404 });
  }

  const update: Record<string, unknown> = {};
  if (body.status) update.status = body.status;
  if (body.payment_status) update.payment_status = body.payment_status;
  if (body.payment_method) update.payment_method = body.payment_method;
  if (body.total_amount !== undefined) update.total_amount = body.total_amount;
  if (body.internal_notes !== undefined) update.internal_notes = body.internal_notes;

  // Cancellation/refund reason is stored in internal_notes by the trigger check.
  if (body.status === "cancelled" || body.status === "refunded") {
    if (!body.internal_notes && !body.reason) {
      return NextResponse.json({ error: "A reason is required to cancel or refund." }, { status: 400 });
    }
    update.internal_notes = body.internal_notes || body.reason;
  }

  const { data, error } = await supabase.from("orders").update(update).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Handle stock release on cancellation/refund.
  if (body.status === "cancelled" || body.status === "refunded") {
    const items = await getOrderItems(id);
    const warehouse = await getDefaultWarehouse(div);
    if (warehouse) {
      for (const item of items) {
        if (item.variant_id && item.quantity && item.quantity > 0) {
          try {
            await releaseStock(div, item.variant_id, warehouse.id, item.quantity);
            await createStockMovement({
              division: div,
              productVariantId: item.variant_id,
              warehouseId: warehouse.id,
              movementType: "adjustment",
              quantityChange: item.quantity,
              referenceType: "order",
              referenceId: id,
              notes: `Stock released for cancelled/refunded order #${data.order_number}`,
            });
          } catch (err) {
            console.error(`Failed to release stock for variant ${item.variant_id}:`, err);
          }
        }
      }
    }
  }

  // Handle stock decrement on delivery/fulfilment.
  if (body.status === "delivered" || body.status === "fulfilled") {
    const items = await getOrderItems(id);
    const warehouse = await getDefaultWarehouse(div);
    if (warehouse) {
      for (const item of items) {
        if (item.variant_id && item.quantity && item.quantity > 0) {
          try {
            await createStockMovement({
              division: div,
              productVariantId: item.variant_id,
              warehouseId: warehouse.id,
              movementType: "sale",
              quantityChange: -item.quantity,
              referenceType: "order",
              referenceId: id,
              unitCost: item.unit_price,
              notes: `Stock sold for order #${data.order_number}`,
            });
          } catch (err) {
            console.error(`Failed to record sale for variant ${item.variant_id}:`, err);
          }
        }
      }
    }
  }

  await writeAudit({ action: "update", entityType: "orders", entityId: id, divisionId: div, oldValues: existing, newValues: update });
  return NextResponse.json(data);
}