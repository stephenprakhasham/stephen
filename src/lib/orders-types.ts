import type { DivisionId } from "@/lib/admin-auth";

export interface EnquiryRow {
  id: string;
  division_id: DivisionId;
  customer_name: string;
  phone: string;
  email: string | null;
  location: string | null;
  message: string;
  product_name: string | null;
  source: string;
  campaign: string | null;
  status: string;
  assigned_to: string | null;
  follow_up_at: string | null;
  customer_id: string | null;
  created_at: string;
}

export interface OrderRow {
  id: string;
  order_number: number;
  division_id: DivisionId;
  enquiry_id: string | null;
  customer_name: string;
  phone: string;
  customer_id: string | null;
  confirmed_total: number | null;
  total_amount: number | null;
  status: string;
  payment_status: string;
  fulfilment_status: string;
  payment_method: string | null;
  internal_notes: string | null;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  category_id: string | null;
  description: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export const ENQUIRY_STATUSES = [
  "new", "assigned", "contacted", "follow_up", "quotation_sent",
  "converted", "not_interested", "closed",
] as const;

export const ORDER_STATUSES = [
  "draft", "awaiting_confirmation", "confirmed", "processing", "packed",
  "ready_to_dispatch", "dispatched", "delivered", "cancelled", "returned", "refunded",
] as const;