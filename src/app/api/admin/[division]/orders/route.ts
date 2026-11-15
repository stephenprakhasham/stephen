import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { listOrders, getOrderItems } from "@/lib/orders";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { writeAudit } from "@/lib/audit";
import { getDefaultWarehouse } from "@/lib/warehouses";
import { reserveStock, createStockMovement } from "@/lib/inventory";

const VALID: DivisionId[] = ["mobiles", "jewellery", "digital"];
const parseDivision = (p: string): DivisionId | null =>
  (VALID as string[]).includes(p) ? (p as DivisionId) : null;
const authError = (e: unknown) =>
  NextResponse.json({ error: (e as Error).message }, { status: e instanceof AuthError ? e.status : 401 });

export async function GET(req: Request, { params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); } catch (e) { return authError(e); }
  const url = new URL(req.url);
  const rows = await listOrders(div, { status: url.searchParams.get("status") ?? undefined });
  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("orders.create"); } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | {
        enquiry_id?: string;
        customer_name?: string;
        phone?: string;
        customer_id?: string | null;
        subtotal?: number;
        total_amount?: number;
        payment_method?: string;
        items?: { description?: string; product_id?: string | null; variant_id?: string | null; category_id?: string | null; quantity?: number; unit_price?: number }[];
      }
    | null;
  if (!body?.customer_name || !body?.phone) {
    return NextResponse.json({ error: "customer_name and phone are required." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      division_id: div,
      enquiry_id: body.enquiry_id ?? null,
      customer_id: body.customer_id ?? null,
      customer_name: body.customer_name,
      phone: body.phone,
      subtotal: body.subtotal ?? null,
      total_amount: body.total_amount ?? body.subtotal ?? null,
      confirmed_total: body.total_amount ?? body.subtotal ?? null,
      payment_method: body.payment_method ?? "manual",
      status: "awaiting_confirmation",
      payment_status: "pending",
      source: body.enquiry_id ? "enquiry" : "manual",
      items: [],
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Insert normalized order items.
  if (body.items?.length) {
    await supabase.from("order_items").insert(
      body.items.map((it) => ({
        order_id: order.id,
        division_id: div,
        product_id: it.product_id ?? null,
        variant_id: it.variant_id ?? null,
        category_id: it.category_id ?? null,
        description: it.description ?? null,
        quantity: it.quantity ?? 1,
        unit_price: it.unit_price ?? 0,
        total_price: (it.quantity ?? 1) * (it.unit_price ?? 0),
      }))
    );

    // Reserve stock for items with variant_id.
    const warehouse = await getDefaultWarehouse(div);
    if (warehouse) {
      for (const it of body.items) {
        if (it.variant_id && it.quantity && it.quantity > 0) {
          try {
            await reserveStock(div, it.variant_id, warehouse.id, it.quantity);
            await createStockMovement({
              division: div,
              productVariantId: it.variant_id,
              warehouseId: warehouse.id,
              movementType: "adjustment",
              quantityChange: -it.quantity,
              referenceType: "order",
              referenceId: order.id,
              notes: `Stock reserved for order #${order.order_number}`,
            });
          } catch (err) {
            console.error(`Failed to reserve stock for variant ${it.variant_id}:`, err);
          }
        }
      }
    }
  }

  // If from an enquiry, mark enquiry converted.
  if (body.enquiry_id) {
    await supabase.from("enquiries").update({ status: "converted" }).eq("id", body.enquiry_id);
  }

  await writeAudit({ action: "create", entityType: "orders", entityId: order.id, divisionId: div, newValues: order });
  return NextResponse.json({ ...order, items: body.items?.length ? await getOrderItems(order.id) : [] });
}