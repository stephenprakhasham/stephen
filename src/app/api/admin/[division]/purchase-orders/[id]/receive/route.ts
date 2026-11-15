import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { receivePOLine, autoUpdatePOStatus } from "@/lib/purchase-orders";
import { writeAudit } from "@/lib/audit";

const VALID: DivisionId[] = ["mobiles", "jewellery", "digital"];
const parseDivision = (p: string): DivisionId | null =>
  (VALID as string[]).includes(p) ? (p as DivisionId) : null;
const authError = (e: unknown) =>
  NextResponse.json({ error: (e as Error).message }, { status: e instanceof AuthError ? e.status : 401 });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ division: string; id: string }> }
) {
  const { division, id } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("purchase.receive"); } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | { line_id?: string; quantity?: number }
    | null;
  if (!body?.line_id || !body?.quantity || body.quantity <= 0) {
    return NextResponse.json({ error: "line_id and positive quantity are required." }, { status: 400 });
  }

  try {
    const line = await receivePOLine({
      division: div,
      lineId: body.line_id,
      quantityToReceive: body.quantity,
      receivedBy: undefined,
    });
    const updatedPO = await autoUpdatePOStatus(div, id);
    await writeAudit({ action: "update", entityType: "purchase_orders", entityId: id, divisionId: div, newValues: { receivedLine: line, poStatus: updatedPO?.status ?? null } });
    return NextResponse.json({ line, purchase_order: updatedPO });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}