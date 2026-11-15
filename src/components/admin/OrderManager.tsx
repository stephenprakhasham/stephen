"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderRow, OrderItemRow } from "@/lib/orders-types";
import { ORDER_STATUSES } from "@/lib/orders-types";
import type { DivisionId } from "@/lib/admin-auth";

export function OrderManager({ division, orders }: { division: DivisionId; orders: OrderRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(orders);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ order: OrderRow; items: OrderItemRow[]; history: unknown[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function open(id: string) {
    setSelected(id);
    setMsg("");
    const res = await fetch(`/api/admin/${division}/orders/${id}`, { cache: "no-store" });
    if (res.ok) setDetail(await res.json());
    else setMsg("Failed to load order.");
  }

  async function setStatus(order: OrderRow, status: string) {
    let reason: string | undefined;
    if (status === "cancelled" || status === "refunded") {
      reason = prompt("Reason for cancellation/refund (required):") || undefined;
      if (!reason) return;
    }
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/${division}/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    setBusy(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setMsg(b.error || "Update failed.");
      return;
    }
    const updated = await res.json();
    setRows((rs) => rs.map((r) => (r.id === order.id ? { ...r, status: updated.status } : r)));
    setDetail((d) => (d ? { ...d, order: updated } : d));
    setMsg("Status updated.");
    router.refresh();
  }

  async function setPayment(order: OrderRow, payment_status: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/${division}/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status }),
    });
    setBusy(false);
    if (res.ok) { setMsg("Payment status updated."); router.refresh(); }
    else setMsg("Payment update failed.");
  }

  return (
    <div className="admin-orders">
      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr><th>Order #</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Payment</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} className={selected === o.id ? "admin-row-selected" : ""}>
                <td>#{o.order_number}</td>
                <td>{o.customer_name}</td>
                <td>{o.phone}</td>
                <td>{o.total_amount != null ? `₹${o.total_amount}` : "—"}</td>
                <td><span className={`pill pill-${o.status}`}>{o.status}</span></td>
                <td><span className={`pill pill-${o.payment_status}`}>{o.payment_status}</span></td>
                <td><button className="btn outline" onClick={() => open(o.id)}>View</button></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="admin-muted">No orders. Convert an enquiry to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {detail && (
        <section className="admin-section admin-form-card">
          <div className="admin-page-head">
            <div>
              <p className="admin-eyebrow">Order detail</p>
              <h2>#{detail.order.order_number}</h2>
            </div>
            <button className="btn outline" onClick={() => { setSelected(null); setDetail(null); }}>Close</button>
          </div>

          <div className="admin-kpis">
            <div className="admin-kpi"><span>Total</span><strong>{detail.order.total_amount != null ? `₹${detail.order.total_amount}` : "—"}</strong></div>
            <div className="admin-kpi"><span>Payment</span><strong>{detail.order.payment_status}</strong></div>
            <div className="admin-kpi"><span>Fulfilment</span><strong>{detail.order.fulfilment_status}</strong></div>
          </div>

          <div className="admin-toolbar">
            <label className="field" style={{ margin: 0 }}>
              <span>Order status</span>
              <select value={detail.order.status} onChange={(e) => setStatus(detail.order, e.target.value)} disabled={busy}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="field" style={{ margin: 0 }}>
              <span>Payment</span>
              <select value={detail.order.payment_status} onChange={(e) => setPayment(detail.order, e.target.value)} disabled={busy}>
                {["pending", "paid", "refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
          {msg && <p className="admin-muted">{msg}</p>}

          <h3 style={{ marginTop: 18 }}>Items</h3>
          <div className="admin-table-wrap">
            <table className="table">
              <thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
              <tbody>
                {detail.items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.description || it.product_id?.slice(0, 8) || "—"}</td>
                    <td>{it.quantity}</td>
                    <td>₹{it.unit_price}</td>
                    <td>₹{it.total_price}</td>
                  </tr>
                ))}
                {detail.items.length === 0 && <tr><td colSpan={4} className="admin-muted">No line items yet.</td></tr>}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginTop: 18 }}>Status history</h3>
          <div className="admin-table-wrap">
            <table className="table">
              <thead><tr><th>When</th><th>From</th><th>To</th></tr></thead>
              <tbody>
                {detail.history.map((h: any) => (
                  <tr key={h.id}>
                    <td>{new Date(h.created_at).toLocaleString("en-IN")}</td>
                    <td>{h.from_status || "—"}</td>
                    <td>{h.to_status}</td>
                  </tr>
                ))}
                {detail.history.length === 0 && <tr><td colSpan={3} className="admin-muted">No history.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}