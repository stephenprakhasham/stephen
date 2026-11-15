import { NextResponse } from "next/server";
import { requireDivision, requirePermission, AuthError, type DivisionId } from "@/lib/admin-auth";
import { listEnquiries, ENQUIRY_STATUSES } from "@/lib/orders";
import { createSupabaseServerClient } from "@/lib/supabase-server";
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
  const rows = await listEnquiries(div, { status: url.searchParams.get("status") ?? undefined });
  return NextResponse.json(rows);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ division: string }> }) {
  const { division } = await params;
  const div = parseDivision(division);
  if (!div) return NextResponse.json({ error: "Invalid division." }, { status: 400 });
  try { await requireDivision(div); await requirePermission("enquiries.edit"); } catch (e) { return authError(e); }

  const body = (await req.json().catch(() => null)) as
    | { id?: string; status?: string; assigned_to?: string | null; internal_notes?: string; note?: string }
    | null;
  if (!body?.id) return NextResponse.json({ error: "id is required." }, { status: 400 });
  if (body.status && !(ENQUIRY_STATUSES as readonly string[]).includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const update: Record<string, unknown> = {};
  if (body.status) update.status = body.status;
  if ("assigned_to" in body) update.assigned_to = body.assigned_to;
  if (body.internal_notes !== undefined) update.internal_notes = body.internal_notes;
  const { data, error } = await supabase.from("enquiries").update(update).eq("id", body.id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body.note) {
    await supabase.from("enquiry_notes").insert({
      enquiry_id: body.id,
      division_id: div,
      note: body.note,
    });
  }

  await writeAudit({ action: "update", entityType: "enquiries", entityId: body.id, divisionId: div, newValues: update });
  return NextResponse.json(data);
}