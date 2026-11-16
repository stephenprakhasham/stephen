"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DivisionId } from "@/lib/admin-auth";
import type { InventoryRow, WarehouseRow } from "@/lib/inventory-types";
import type { ProductRow } from "@/lib/catalogue";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  division: DivisionId;
  inventory: InventoryRow[];
  warehouses: WarehouseRow[];
  products: ProductRow[];
  lowStock: InventoryRow[];
}

const TIER_LABEL: Record<string, string> = {
  retail: "Retail",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

export function InventoryManager({
  division,
  inventory,
  warehouses,
  products,
  lowStock,
}: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [adjusting, setAdjusting] = useState<InventoryRow | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const warehouseMap = new Map(warehouses.map((w) => [w.id, w]));
  const productMap = new Map(products.map((p) => [p.id, p]));

  const visibleRows = inventory.filter((row) => {
    if (showLowOnly && !lowStock.find((l) => l.id === row.id)) return false;
    if (!filter) return true;
    const variant = productMap.get(row.product_variant_id);
    const q = filter.toLowerCase();
    return (
      variant?.name.toLowerCase().includes(q) ||
      variant?.sku?.toLowerCase().includes(q) ||
      row.product_variant_id.toLowerCase().includes(q)
    );
  });

  async function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!adjusting) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/${division}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_variant_id: adjusting.product_variant_id,
          warehouse_id: adjusting.warehouse_id,
          quantity: Number(adjustQty),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage("Stock adjusted successfully.");
      setAdjusting(null);
      setAdjustQty("");
      router.refresh();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="toolbar" style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Filter by product or SKU..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "0.5rem", flex: 1, maxWidth: "300px" }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={showLowOnly}
            onChange={(e) => setShowLowOnly(e.target.checked)}
          />
          Low stock only
        </label>
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: "1rem", padding: "0.75rem", background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "4px" }}>
          {lowStock.length} item(s) at or below reorder point.
        </div>
      )}

      {message && (
        <div className="alert" style={{ marginBottom: "1rem", padding: "0.75rem", background: message.includes("error") || message.includes("failed") ? "#f8d7da" : "#d4edda", borderRadius: "4px" }}>
          {message}
        </div>
      )}

      {adjusting && (
        <div className="modal" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <form onSubmit={handleAdjust} style={{ background: "white", padding: "2rem", borderRadius: "8px", maxWidth: "400px", width: "100%" }}>
            <h2>Adjust Stock</h2>
            <p style={{ marginBottom: "1rem" }}>
              {productMap.get(adjusting.product_variant_id)?.name ?? adjusting.product_variant_id}
            </p>
            <label>
              New Quantity:
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                required
                style={{ width: "100%", padding: "0.5rem", marginBottom: "1rem" }}
              />
            </label>
            <button type="submit" disabled={saving} className="btn">
              {saving ? <><Spinner size={16} /> Saving...</> : "Adjust"}
            </button>
            <button type="button" onClick={() => { setAdjusting(null); setAdjustQty(""); }} className="btn outline" style={{ marginLeft: "0.5rem" }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Product</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>SKU</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Warehouse</th>
            <th style={{ textAlign: "right", padding: "0.75rem" }}>On Hand</th>
            <th style={{ textAlign: "right", padding: "0.75rem" }}>Reserved</th>
            <th style={{ textAlign: "right", padding: "0.75rem" }}>Available</th>
            <th style={{ textAlign: "right", padding: "0.75rem" }}>Reorder At</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((row) => {
            const variant = productMap.get(row.product_variant_id);
            const wh = warehouseMap.get(row.warehouse_id);
            const isLow = row.quantity_available <= row.reorder_point;
            return (
              <tr key={row.id} style={{ borderBottom: "1px solid #eee", background: isLow ? "#fff8e1" : "transparent" }}>
                <td style={{ padding: "0.5rem 0.75rem" }}>{variant?.name ?? "Unknown"}</td>
                <td style={{ padding: "0.5rem 0.75rem" }}>{variant?.sku ?? "—"}</td>
                <td style={{ padding: "0.5rem 0.75rem" }}>{wh?.name ?? row.warehouse_id}</td>
                <td style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>{row.quantity_on_hand}</td>
                <td style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>{row.quantity_reserved}</td>
                <td style={{ padding: "0.5rem 0.75rem", textAlign: "right", fontWeight: isLow ? "bold" : "normal" }}>{row.quantity_available}</td>
                <td style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>{row.reorder_point}</td>
                <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                  <button
                    onClick={() => { setAdjusting(row); setAdjustQty(String(row.quantity_on_hand)); }}
                    className="btn outline"
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                  >
                    Adjust
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {visibleRows.length === 0 && (
        <p style={{ padding: "2rem", textAlign: "center", color: "#999" }}>No inventory rows found.</p>
      )}
    </>
  );
}