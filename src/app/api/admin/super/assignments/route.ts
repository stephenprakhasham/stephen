import { NextResponse } from "next/server";
import { requireSuperAdmin, AuthError } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase-server";
import { writeAudit } from "@/lib/audit";

export async function POST(req: Request) {
  try {
    await requireSuperAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }

  const body = (await req.json().catch(() => null)) as {
    user_id?: string;
    role_id?: string;
    division_id?: string | null;
    category_id?: string | null;
    expires_at?: string | null;
  } | null;

  if (!body?.user_id || !body?.role_id) {
    return NextResponse.json(
      { error: "user_id and role_id are required." },
      { status: 400 }
    );
  }

  const svc = createSupabaseServiceClient();
  const { data: role } = await svc
    .from("roles")
    .select("id, division_id, key")
    .eq("id", body.role_id)
    .maybeSingle();
  if (!role) {
    return NextResponse.json({ error: "Role not found." }, { status: 404 });
  }

  const divisionId =
    body.division_id ?? (role.division_id as string | null) ?? null;

  const { error } = await svc.from("user_role_assignments").upsert(
    {
      user_id: body.user_id,
      role_id: body.role_id,
      division_id: divisionId,
      category_id: body.category_id ?? null,
      expires_at: body.expires_at ?? null,
    },
    { onConflict: "user_id,role_id,division_id,category_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAudit({
    action: "update",
    entityType: "user_role_assignments",
    entityId: body.user_id,
    divisionId: divisionId,
    newValues: {
      role_id: body.role_id,
      division_id: divisionId,
      category_id: body.category_id ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}