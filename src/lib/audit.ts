import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase-server";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "export"
  | "approve"
  | "reject"
  | "publish"
  | "unpublish";

interface AuditEntry {
  actorUserId?: string | null;
  actorEmail?: string | null;
  action: AuditAction | string;
  entityType: string;
  entityId?: string | null;
  divisionId?: string | null;
  oldValues?: unknown;
  newValues?: unknown;
  reason?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Append an audit record. Prefers the caller-scoped client (super_admin may
 * insert via the audit_logs_admin_insert RLS policy); falls back to the
 * service-role client when configured. Never throws into the caller's flow:
 * auditing must not break a request, but failures are logged to the console.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  const row = {
    actor_user_id: entry.actorUserId ?? null,
    actor_email: entry.actorEmail ?? null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    division_id: entry.divisionId ?? null,
    old_values: entry.oldValues ?? null,
    new_values: entry.newValues ?? null,
    reason: entry.reason ?? null,
    metadata: entry.metadata ?? null,
  };

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const svc = createSupabaseServiceClient();
      await svc.from("audit_logs").insert(row);
      return;
    }
    const supabase = await createSupabaseServerClient();
    await supabase.from("audit_logs").insert(row);
  } catch (error) {
    console.error("[audit] failed to write audit log", error);
  }
}