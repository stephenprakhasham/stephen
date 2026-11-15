import { NextResponse } from "next/server";
import { requireSuperAdmin, AuthError } from "@/lib/admin-auth";
import { createAdminUser } from "@/lib/admin-data";

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        email?: string;
        password?: string;
        full_name?: string;
        role?: string;
        role_id?: string | null;
        division_id?: string | null;
      }
    | null;

  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { error: "email and password are required." },
      { status: 400 }
    );
  }

  try {
    const { user, divisionGranted, roleAssigned } = await createAdminUser({
      email: body.email,
      password: body.password,
      fullName: body.full_name,
      role: body.role,
      roleId: body.role_id ?? null,
      divisionId: body.division_id ?? null,
    });
    return NextResponse.json(
      { ok: true, user, divisionGranted, roleAssigned },
      { status: 201 }
    );
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 400;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }
}