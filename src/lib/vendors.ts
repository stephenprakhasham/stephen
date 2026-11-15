import type { DivisionId } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { VendorRow } from "@/lib/inventory-types";

export type { VendorRow };

export async function listVendors(
  division: DivisionId,
  opts: { activeOnly?: boolean } = {}
): Promise<VendorRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("vendors")
    .select("*")
    .eq("division_id", division);
  if (opts.activeOnly) query = query.eq("is_active", true);
  const { data } = await query.order("company_name");
  return (data ?? []) as VendorRow[];
}

export async function getVendor(division: DivisionId, id: string): Promise<VendorRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("vendors")
    .select("*")
    .eq("division_id", division)
    .eq("id", id)
    .maybeSingle();
  return (data as VendorRow) ?? null;
}

export async function createVendor(input: {
  division: DivisionId;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  paymentTerms?: string;
  notes?: string;
}): Promise<VendorRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("vendors")
    .insert({
      division_id: input.division,
      company_name: input.companyName,
      contact_name: input.contactName ?? null,
      email: input.email ?? null,
      phone: input.phone ?? null,
      address: input.address ?? null,
      gst_number: input.gstNumber ?? null,
      payment_terms: input.paymentTerms ?? "net30",
      notes: input.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as VendorRow;
}

export async function updateVendor(
  division: DivisionId,
  id: string,
  patch: Partial<{
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    address: string;
    gstNumber: string;
    paymentTerms: string;
    notes: string;
    isActive: boolean;
  }>
): Promise<VendorRow> {
  const supabase = await createSupabaseServerClient();
  const update: Record<string, unknown> = {};
  if (patch.companyName !== undefined) update.company_name = patch.companyName;
  if (patch.contactName !== undefined) update.contact_name = patch.contactName;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.address !== undefined) update.address = patch.address;
  if (patch.gstNumber !== undefined) update.gst_number = patch.gstNumber;
  if (patch.paymentTerms !== undefined) update.payment_terms = patch.paymentTerms;
  if (patch.notes !== undefined) update.notes = patch.notes;
  if (patch.isActive !== undefined) update.is_active = patch.isActive;

  const { data, error } = await supabase
    .from("vendors")
    .update(update)
    .eq("division_id", division)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data as VendorRow;
}