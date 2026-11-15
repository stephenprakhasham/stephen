"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { EnquiryRow } from "@/lib/orders-types";
import { ENQUIRY_STATUSES } from "@/lib/orders-types";
import type { DivisionId } from "@/lib/admin-auth";

export function EnquiryManager({
  division,
  enquiries,
}: {
  division: DivisionId;
  enquiries: EnquiryRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(enquiries);
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  );

  async function updateStatus(id: string, status: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/${division}/enquiries`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusy(false);
    if (!res.ok) { setMsg("Update failed."); return; }
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    router.refresh();
  }

  async function convertToOrder(r: EnquiryRow) {
    if (!confirm(`Create an order from enquiry from ${r.customer_name}?`)) return;
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/${division}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enquiry_id: r.id,
        customer_name: r.customer_name,
        phone: r.phone,
        subtotal: null,
        items: r.product_name ? [{ description: r.product_name, quantity: 1, unit_price: 0 }] : [],
      }),
    });
    setBusy(false);
    if (!res.ok) { const b = await res.json().catch(() => ({})); setMsg(b.error || "Order creation failed."); return; }
    setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: "converted" } : x)));
    setMsg("Order created. Open Orders to add items and confirm pricing.");
    router.refresh();
  }

  return (
    <>
      <div className="admin-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="admin-muted">{filtered.length} shown</span>
      </div>
      {msg && <p className="admin-muted">{msg}</p>}

      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr><th>Received</th><th>Customer</th><th>Phone</th><th>Message</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleString("en-IN")}</td>
                <td>{r.customer_name}</td>
                <td>{r.phone}</td>
                <td className="admin-muted">{r.product_name || r.message.slice(0, 60)}</td>
                <td>
                  <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} disabled={busy}>
                    {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <button className="btn outline" onClick={() => convertToOrder(r)} disabled={busy}>
                    Convert to order
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="admin-muted">No enquiries.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}