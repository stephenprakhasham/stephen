import { createSupabaseServiceClient } from "@/lib/supabase-server";

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
 * Append an audit record. Uses the service-role client so it works even when
 * the actor lacks direct insert permission on audit_logs (append-only design).
 * Never throws into the caller's flow: auditing must not break a request,
 * but failures are logged to the server console.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  try {
    const svc = createSupabaseServiceClient();
    await svc.from("audit_logs").insert({
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
    });
  } catch (error) {
    console.error("[audit] failed to write audit log", error);
  }
}