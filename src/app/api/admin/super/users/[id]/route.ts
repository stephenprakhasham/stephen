import { NextResponse } from "next/server";
import { requireSuperAdmin, AuthError } from "@/lib/admin-auth";
import { deleteAdminUser, updateAdminUser } from "@/lib/admin-data";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  try {
    await deleteAdminUser(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 400;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireSuperAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        full_name?: string | null;
        role?: string;
        division_id?: string | null;
      }
    | null;

  if (!body) {
    return NextResponse.json(
      { error: "A JSON body is required." },
      { status: 400 }
    );
  }

  try {
    await updateAdminUser(id, {
      fullName: body.full_name,
      role: body.role,
      divisionId: body.division_id,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 400;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}