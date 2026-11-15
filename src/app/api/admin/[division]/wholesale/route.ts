import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { listWholesalePrices, upsertWholesalePrice, deleteWholesalePrice, CUSTOMER_TIERS } from "@/lib/wholesale";
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
  const rows = await listWholesalePrices(div, {
    variantId: url.searchParams.get("variantId") ?? undefined,
    tier: (url.searchParams.get("tier") as any) ?? undefined,
  });
  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("catalogue.pricing"); } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | {
        product_variant_id?: string;
        tier?: string;
        min_quantity?: number;
        price?: number;
      }
    | null;
  if (!body?.product_variant_id || !body?.tier || !body?.min_quantity || body?.price === undefined) {
    return NextResponse.json({ error: "product_variant_id, tier, min_quantity, and price are required." }, { status: 400 });
  }
  if (!(CUSTOMER_TIERS as readonly string[]).includes(body.tier)) {
    return NextResponse.json({ error: "Invalid tier." }, { status: 400 });
  }

  try {
    const row = await upsertWholesalePrice({
      division: div,
      productVariantId: body.product_variant_id,
      tier: body.tier as any,
      minQuantity: body.min_quantity,
      price: body.price,
    });
    await writeAudit({ action: "upsert", entityType: "wholesale_prices", entityId: row.id, divisionId: div, newValues: row });
    return NextResponse.json(row);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("catalogue.pricing"); } catch (e) { return authError(e); }

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  try {
    await deleteWholesalePrice(div, id);
    await writeAudit({ action: "delete", entityType: "wholesale_prices", entityId: id, divisionId: div });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}