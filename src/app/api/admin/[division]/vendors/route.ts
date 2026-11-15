import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { listVendors, createVendor, updateVendor } from "@/lib/vendors";
import { writeAudit } from "@/lib/audit";

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
  const rows = await listVendors(div, {
    activeOnly: url.searchParams.get("active") === "true",
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("purchase.create"); } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | {
        company_name?: string;
        contact_name?: string;
        email?: string;
        phone?: string;
        address?: string;
        gst_number?: string;
        payment_terms?: string;
        notes?: string;
      }
    | null;
  if (!body?.company_name) {
    return NextResponse.json({ error: "company_name is required." }, { status: 400 });
  }

  try {
    const vendor = await createVendor({
      division: div,
      companyName: body.company_name,
      contactName: body.contact_name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      gstNumber: body.gst_number,
      paymentTerms: body.payment_terms,
      notes: body.notes,
    });
    await writeAudit({ action: "create", entityType: "vendors", entityId: vendor.id, divisionId: div, newValues: vendor });
    return NextResponse.json(vendor);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("purchase.create"); } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | {
        id?: string;
        company_name?: string;
        contact_name?: string;
        email?: string;
        phone?: string;
        address?: string;
        gst_number?: string;
        payment_terms?: string;
        notes?: string;
        is_active?: boolean;
      }
    | null;
  if (!body?.id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  try {
    const vendor = await updateVendor(div, body.id, {
      companyName: body.company_name,
      contactName: body.contact_name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      gstNumber: body.gst_number,
      paymentTerms: body.payment_terms,
      notes: body.notes,
      isActive: body.is_active,
    });
    await writeAudit({ action: "update", entityType: "vendors", entityId: vendor.id, divisionId: div, newValues: vendor });
    return NextResponse.json(vendor);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}