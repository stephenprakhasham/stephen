"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DivisionId } from "@/lib/admin-auth";
import type { PurchaseOrderRow, PurchaseOrderLineRow, VendorRow } from "@/lib/inventory-types";
import type { ProductRow } from "@/lib/catalogue";
import { PO_STATUSES } from "@/lib/inventory-types";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  division: DivisionId;
  orders: PurchaseOrderRow[];
  vendors: VendorRow[];
  products: ProductRow[];
  linesMap: Record<string, PurchaseOrderLineRow[]>;
}

const STATUS_COLOR: Record<string, string> = {
  draft: "#6c757d",
  submitted: "#0d6efd",
  partial: "#fd7e14",
  received: "#198754",
  cancelled: "#dc3545",
};

export function PurchaseOrderManager({
  division,
  orders,
  vendors,
  products,
  linesMap,
}: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [lines, setLines] = useState([{ product_variant_id: "", quantity_ordered: 1, unit_price: 0 }]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [receiving, setReceiving] = useState<{ poId: string; lineId: string; qty: string } | null>(null);

  const vendorMap = new Map(vendors.map((v) => [v.id, v]));
  const productMap = new Map(products.map((p) => [p.id, p]));

  function addLine() {
    setLines([...lines, { product_variant_id: "", quantity_ordered: 1, unit_price: 0 }]);
  }

  function updateLine(idx: number, field: string, value: unknown) {
    const next = [...lines];
    (next[idx] as any)[field] = value;
    setLines(next);
  }

  function removeLine(idx: number) {
    if (lines.length > 1) setLines(lines.filter((_, i) => i !== idx));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!vendorId || !lines[0]?.product_variant_id) {
      setMessage("Vendor and at least one product are required.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/${division}/purchase-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_id: vendorId,
          lines: lines.map((l) => ({
            product_variant_id: l.product_variant_id,
            quantity_ordered: l.quantity_ordered,
            unit_price: l.unit_price,
          })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage("Purchase order created.");
      setShowForm(false);
      setVendorId("");
      setLines([{ product_variant_id: "", quantity_ordered: 1, unit_price: 0 }]);
      router.refresh();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleReceive(e: React.FormEvent) {
    e.preventDefault();
    if (!receiving) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/${division}/purchase-orders/${receiving.poId}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line_id: receiving.lineId,
          quantity: Number(receiving.qty),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage("Goods received.");
      setReceiving(null);
      router.refresh();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setShowForm(!showForm)} className="btn">
          {showForm ? "Cancel" : "+ New Purchase Order"}
        </button>
      </div>

      {message && (
        <div className="alert" style={{ marginBottom: "1rem", padding: "0.75rem", background: message.includes("error") || message.includes("failed") ? "#f8d7da" : "#d4edda", borderRadius: "4px" }}>
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: "#f9f9f9", padding: "1.5rem", marginBottom: "1.5rem", borderRadius: "8px" }}>
          <h2>New Purchase Order</h2>
          <label>Vendor:
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} required style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}>
              <option value="">Select vendor...</option>
              {vendors.map((v) => <option key={v.id} value={v.id}>{v.company_name}</option>)}
            </select>
          </label>
          <h3>Line Items</h3>
          {lines.map((l, idx) => (
            <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
              <select
                value={l.product_variant_id}
                onChange={(e) => updateLine(idx, "product_variant_id", e.target.value)}
                style={{ flex: 2, padding: "0.5rem" }}
                required
              >
                <option value="">Select variant...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input
                type="number"
                placeholder="Qty"
                value={l.quantity_ordered}
                onChange={(e) => updateLine(idx, "quantity_ordered", Number(e.target.value))}
                min={1}
                style={{ width: "80px", padding: "0.5rem" }}
              />
              <input
                type="number"
                placeholder="Unit Price"
                value={l.unit_price}
                onChange={(e) => updateLine(idx, "unit_price", Number(e.target.value))}
                min={0}
                style={{ width: "100px", padding: "0.5rem" }}
              />
              {lines.length > 1 && (
                <button type="button" onClick={() => removeLine(idx)} style={{ padding: "0.5rem", color: "red" }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addLine} className="btn outline" style={{ marginBottom: "1rem" }}>+ Add Line</button>
          <button type="submit" disabled={saving} className="btn">
            {saving ? <><Spinner size={16} /> Saving...</> : "Create PO"}
          </button>
        </form>
      )}

      {receiving && (
        <div className="modal" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleReceive} style={{ background: "white", padding: "2rem", borderRadius: "8px", maxWidth: "400px", width: "100%" }}>
            <h2>Receive Goods</h2>
            <label>Quantity to Receive:
              <input type="number" value={receiving.qty} onChange={(e) => setReceiving({ ...receiving, qty: e.target.value })} required style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }} />
            </label>
            <button type="submit" disabled={saving} className="btn">
              {saving ? <><Spinner size={16} /> Saving...</> : "Receive"}
            </button>
            <button type="button" onClick={() => setReceiving(null)} className="btn outline" style={{ marginLeft: "0.5rem" }}>Cancel</button>
          </form>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>PO Number</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Vendor</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Status</th>
            <th style={{ textAlign: "right", padding: "0.75rem" }}>Total</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Lines</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((po) => {
            const poLines = linesMap[po.id] ?? [];
            return (
              <>
                <tr key={po.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem 0.75rem", fontWeight: "bold" }}>{po.po_number}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{vendorMap.get(po.vendor_id)?.company_name ?? "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                    <span style={{ color: STATUS_COLOR[po.status], fontWeight: "bold" }}>{po.status}</span>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>₹{po.total_amount.toLocaleString()}</td>
                  <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>{poLines.length}</td>
                </tr>
                {poLines.map((line) => {
                  const variant = productMap.get(line.product_variant_id);
                  return (
                    <tr key={line.id} style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "0.25rem 0.75rem", paddingLeft: "2rem" }} colSpan={4}>
                        {variant?.name ?? line.product_variant_id} — {line.quantity_received}/{line.quantity_ordered} received
                      </td>
                      <td style={{ padding: "0.25rem 0.75rem", textAlign: "center" }}>
                        {po.status !== "cancelled" && line.quantity_received < line.quantity_ordered && (
                          <button
                            onClick={() => setReceiving({ poId: po.id, lineId: line.id, qty: String(line.quantity_ordered - line.quantity_received) })}
                            className="btn outline"
                            style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                          >
                            Receive
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && (
        <p style={{ padding: "2rem", textAlign: "center", color: "#999" }}>No purchase orders.</p>
      )}
    </>
  );
}