import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { listPurchaseOrders, createPurchaseOrder, updatePOStatus } from "@/lib/purchase-orders";
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
  const rows = await listPurchaseOrders(div, {
    status: url.searchParams.get("status") ?? undefined,
    vendorId: url.searchParams.get("vendorId") ?? undefined,
    limit: Number(url.searchParams.get("limit")) || 100,
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
        vendor_id?: string;
        warehouse_id?: string;
        expected_date?: string;
        notes?: string;
        lines?: { product_variant_id?: string; quantity_ordered?: number; unit_price?: number }[];
      }
    | null;
  if (!body?.vendor_id || !body?.lines?.length) {
    return NextResponse.json({ error: "vendor_id and at least one line are required." }, { status: 400 });
  }

  try {
    const po = await createPurchaseOrder({
      division: div,
      vendorId: body.vendor_id,
      warehouseId: body.warehouse_id,
      expectedDate: body.expected_date,
      notes: body.notes,
      lines: body.lines.map((l) => ({
        productVariantId: l.product_variant_id ?? "",
        quantityOrdered: l.quantity_ordered ?? 1,
        unitPrice: l.unit_price ?? 0,
      })),
    });
    await writeAudit({ action: "create", entityType: "purchase_orders", entityId: po.id, divisionId: div, newValues: po });
    return NextResponse.json(po);
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
    | { id?: string; status?: string; notes?: string }
    | null;
  if (!body?.id || !body?.status) {
    return NextResponse.json({ error: "id and status are required." }, { status: 400 });
  }

  try {
    const po = await updatePOStatus(div, body.id, body.status as any, body.notes);
    await writeAudit({ action: "update", entityType: "purchase_orders", entityId: po.id, divisionId: div, newValues: { status: body.status } });
    return NextResponse.json(po);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}