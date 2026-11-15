import { NextResponse } from "next/server";
import { requireSuperAdmin, AuthError } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { writeAudit } from "@/lib/audit";

export async function PUT(req: Request) {
  try {
    await requireSuperAdmin();
  } catch (e) {
    const status = e instanceof AuthError ? e.status : 401;
    return NextResponse.json({ error: (e as Error).message }, { status });
  }

  const body = (await req.json().catch(() => null)) as {
    key?: string;
    value?: unknown;
  } | null;

  if (!body?.key || body.value === undefined) {
    return NextResponse.json(
      { error: "key and value are required." },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("system_settings")
    .upsert(
      { key: body.key, value: body.value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await writeAudit({
    action: "update",
    entityType: "system_settings",
    entityId: null,
    newValues: { key: body.key, value: body.value },
  });

  return NextResponse.json({ ok: true });
}