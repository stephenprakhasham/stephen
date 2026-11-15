import Link from "next/link";
import { getAuthContext, isSuperAdmin, canAccessDivision } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const ctx = await getAuthContext();
  const supabase = await createSupabaseServerClient();

  const [enquiryCount, orderCount] = await Promise.all([
    supabase.from("enquiries").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
  ]);

  const divisions = (["mobiles", "jewellery", "digital"] as const).filter(
    (d) => isSuperAdmin(ctx) || canAccessDivision(ctx, d)
  );

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="admin-kpis">
        <div className="admin-kpi">
          <span>Enquiries</span>
          <strong>{enquiryCount.count ?? 0}</strong>
        </div>
        <div className="admin-kpi">
          <span>Orders</span>
          <strong>{orderCount.count ?? 0}</strong>
        </div>
        <div className="admin-kpi">
          <span>Divisions in scope</span>
          <strong>{divisions.length}</strong>
        </div>
      </div>

      {divisions.length > 0 && (
        <section className="admin-section">
          <h2>Division workspaces</h2>
          <div className="admin-card-grid">
            {divisions.map((d) => (
              <Link key={d} href={`/admin/${d}`} className="admin-card">
                <span className="admin-card-tag">{d}</span>
                <strong>{d === "mobiles"
                  ? "YAGA MOBILES"
                  : d === "jewellery"
                  ? "YAGA GOLD & FASHION"
                  : "YAGA DIGITAL NEXUS"}</strong>
                <span className="admin-card-link">Open workspace →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="admin-section">
        <h2>Getting started</h2>
        <p className="admin-muted">
          Phase 1 (foundation &amp; security) is in place. Catalogue,
          orders, inventory and reporting modules arrive in later phases.
          Use <strong>Users &amp; Roles</strong> to assign division and
          category access.
        </p>
      </section>
    </div>
  );
}