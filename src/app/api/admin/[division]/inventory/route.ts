import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { listInventory, adjustStock, getLowStock } from "@/lib/inventory";
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
  if (url.searchParams.get("lowStock") === "true") {
    const rows = await getLowStock(div);
    return NextResponse.json(rows);
  }
  const rows = await listInventory(div, {
    variantId: url.searchParams.get("variantId") ?? undefined,
    lowStock: url.searchParams.get("lowStock") === "true",
    limit: Number(url.searchParams.get("limit")) || 200,
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("inventory.adjust"); } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | {
        product_variant_id?: string;
        warehouse_id?: string;
        quantity?: number;
        notes?: string;
      }
    | null;
  if (!body?.product_variant_id || !body?.warehouse_id || body?.quantity === undefined) {
    return NextResponse.json({ error: "product_variant_id, warehouse_id, and quantity are required." }, { status: 400 });
  }

  try {
    const result = await adjustStock({
      division: div,
      productVariantId: body.product_variant_id,
      warehouseId: body.warehouse_id,
      newQuantity: body.quantity,
      notes: body.notes,
      createdBy: undefined,
    });
    await writeAudit({ action: "update", entityType: "inventory", divisionId: div, newValues: result });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}