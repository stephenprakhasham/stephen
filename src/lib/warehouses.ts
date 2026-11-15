import type { DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { WarehouseRow } from "@/lib/inventory-types";

export type { WarehouseRow };

export async function listWarehouses(division: DivisionId): Promise<WarehouseRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("warehouses")
    .select("*")
    .eq("division_id", division)
    .order("code");
  return (data ?? []) as WarehouseRow[];
}

export async function getWarehouse(division: DivisionId, id: string): Promise<WarehouseRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("warehouses")
    .select("*")
    .eq("division_id", division)
    .eq("id", id)
    .maybeSingle();
  return (data as WarehouseRow) ?? null;
}

export async function createWarehouse(input: {
  division: DivisionId;
  name: string;
  code: string;
  address?: Record<string, unknown>;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}): Promise<WarehouseRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("warehouses")
    .insert({
      division_id: input.division,
      name: input.name,
      code: input.code,
      address: input.address ?? null,
      contact_name: input.contactName ?? null,
      contact_phone: input.contactPhone ?? null,
      contact_email: input.contactEmail ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as WarehouseRow;
}

export async function updateWarehouse(
  division: DivisionId,
  id: string,
  patch: Partial<{
    name: string;
    address: Record<string, unknown>;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    isActive: boolean;
  }>
): Promise<WarehouseRow> {
  const supabase = await createSupabaseServerClient();
  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.address !== undefined) update.address = patch.address;
  if (patch.contactName !== undefined) update.contact_name = patch.contactName;
  if (patch.contactPhone !== undefined) update.contact_phone = patch.contactPhone;
  if (patch.contactEmail !== undefined) update.contact_email = patch.contactEmail;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;

  const { data, error } = await supabase
    .from("warehouses")
    .update(update)
    .eq("division_id", division)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as WarehouseRow;
}

export async function getDefaultWarehouse(division: DivisionId): Promise<WarehouseRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("warehouses")
    .select("*")
    .eq("division_id", division)
    .eq("is_active", true)
    .order("code")
    .limit(1)
    .maybeSingle();
  return (data as WarehouseRow) ?? null;
}