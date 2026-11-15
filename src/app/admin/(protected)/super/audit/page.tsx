import { requireSuperAdmin } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface AuditRow {
  id: string;
  created_at: string;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  division_id: string | null;
}

export default async function SuperAuditPage() {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("audit_logs")
    .select(
      "id, created_at, actor_email, action, entity_type, entity_id, division_id"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (data ?? []) as AuditRow[];

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Super Admin</p>
          <h1>Audit Logs</h1>
        </div>
        <span className="pill">{rows.length} recent</span>
      </div>

      {rows.length === 0 ? (
        <p className="admin-muted">
          No audit records yet. Sensitive actions will appear here.
        </p>
      ) : (
        <div className="admin-table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Division</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.created_at).toLocaleString("en-IN")}</td>
                  <td>{r.actor_email || "—"}</td>
                  <td>{r.action}</td>
                  <td>
                    {r.entity_type}
                    {r.entity_id ? ` · ${r.entity_id.slice(0, 8)}` : ""}
                  </td>
                  <td>{r.division_id || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}