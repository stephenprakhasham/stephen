import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { listWarehouses, createWarehouse, updateWarehouse, getDefaultWarehouse } from "@/lib/warehouses";
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
  if (url.searchParams.get("default") === "true") {
    const wh = await getDefaultWarehouse(div);
    return NextResponse.json(wh);
  }
  const rows = await listWarehouses(div);
  return NextResponse.json(rows);
}

export async function POST(req: Request, { params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("inventory.update"); } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | {
        name?: string;
        code?: string;
        address?: Record<string, unknown>;
        contactName?: string;
        contactPhone?: string;
        contactEmail?: string;
      }
    | null;
  if (!body?.name || !body?.code) {
    return NextResponse.json({ error: "name and code are required." }, { status: 400 });
  }

  try {
    const wh = await createWarehouse({
      division: div,
      name: body.name,
      code: body.code,
      address: body.address,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
    });
    await writeAudit({ action: "create", entityType: "warehouses", entityId: wh.id, divisionId: div, newValues: wh });
    return NextResponse.json(wh);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("inventory.update"); } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | {
        id?: string;
        name?: string;
        address?: Record<string, unknown>;
        contactName?: string;
        contactPhone?: string;
        contactEmail?: string;
        isActive?: boolean;
      }
    | null;
  if (!body?.id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  try {
    const wh = await updateWarehouse(div, body.id, {
      name: body.name,
      address: body.address,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail,
      isActive: body.isActive,
    });
    await writeAudit({ action: "update", entityType: "warehouses", entityId: wh.id, divisionId: div, newValues: wh });
    return NextResponse.json(wh);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}