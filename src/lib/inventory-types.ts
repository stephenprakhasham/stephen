import type { DivisionId } from "@/lib/admin-auth";

export type CustomerTier = "retail" | "bronze" | "silver" | "gold" | "platinum";

export const CUSTOMER_TIERS = [
  "retail",
  "bronze",
  "silver",
  "gold",
  "platinum",
] as const;

export type StockMovementType =
  | "purchase_receipt"
  | "sale"
  | "return"
  | "adjustment"
  | "transfer_out"
  | "transfer_in";

export const STOCK_MOVEMENT_TYPES = [
  "purchase_receipt",
  "sale",
  "return",
  "adjustment",
  "transfer_out",
  "transfer_in",
] as const;

export type POStatus =
  | "draft"
  | "submitted"
  | "partial"
  | "received"
  | "cancelled";

export const PO_STATUSES = [
  "draft",
  "submitted",
  "partial",
  "received",
  "cancelled",
] as const;

export interface WarehouseRow {
  id: string;
  division_id: DivisionId;
  name: string;
  code: string;
  address: Record<string, unknown> | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryRow {
  id: string;
  division_id: DivisionId;
  product_variant_id: string;
  warehouse_id: string;
  quantity_on_hand: number;
  quantity_reserved: number;
  quantity_available: number;
  safety_stock: number;
  reorder_point: number;
  unit_cost: number | null;
  created_at: string;
  updated_at: string;
}

export interface StockMovementRow {
  id: string;
  division_id: DivisionId;
  product_variant_id: string;
  warehouse_id: string;
  movement_type: StockMovementType;
  quantity_change: number;
  reference_type: string | null;
  reference_id: string | null;
  unit_cost: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface VendorRow {
  id: string;
  division_id: DivisionId;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gst_number: string | null;
  payment_terms: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderRow {
  id: string;
  division_id: DivisionId;
  vendor_id: string;
  po_number: string;
  status: POStatus;
  order_date: string;
  expected_date: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  notes: string | null;
  warehouse_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderLineRow {
  id: string;
  purchase_order_id: string;
  division_id: DivisionId;
  product_variant_id: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  line_total: number;
  received_at: string | null;
  received_by: string | null;
  created_at: string;
}

export interface WholesalePriceRow {
  id: string;
  division_id: DivisionId;
  product_variant_id: string;
  tier: CustomerTier;
  min_quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}