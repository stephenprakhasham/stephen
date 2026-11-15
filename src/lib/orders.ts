import type { DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { EnquiryRow, OrderRow, OrderItemRow } from "@/lib/orders-types";

export type { EnquiryRow, OrderRow, OrderItemRow };
export { ENQUIRY_STATUSES, ORDER_STATUSES } from "@/lib/orders-types";

export async function listEnquiries(
  division: DivisionId,
  opts: { status?: string; limit?: number } = {}
) {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from("enquiries").select("*").eq("division_id", division);
  if (opts.status) q = q.eq("status", opts.status);
  const { data } = await q.order("created_at", { ascending: false }).limit(opts.limit ?? 100);
  return (data ?? []) as EnquiryRow[];
}

export async function listCustomers(division: DivisionId) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("division_id", division)
    .order("created_at", { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function listOrders(
  division: DivisionId,
  opts: { status?: string; limit?: number } = {}
) {
  const supabase = await createSupabaseServerClient();
  let q = supabase.from("orders").select("*").eq("division_id", division);
  if (opts.status) q = q.eq("status", opts.status);
  const { data } = await q.order("created_at", { ascending: false }).limit(opts.limit ?? 100);
  return (data ?? []) as OrderRow[];
}

export async function getOrderItems(orderId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
  return (data ?? []) as OrderItemRow[];
}

export async function getOrderStatusHistory(orderId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("order_status_history")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  return data ?? [];
}