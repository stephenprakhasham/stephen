"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DivisionId } from "@/lib/admin-auth";
import type { WholesalePriceRow, CustomerTier } from "@/lib/inventory-types";
import { CUSTOMER_TIERS } from "@/lib/inventory-types";
import type { ProductRow } from "@/lib/catalogue";

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  tier: string;
  wholesale: boolean;
  email: string | null;
}

interface Props {
  division: DivisionId;
  prices: WholesalePriceRow[];
  customers: CustomerRow[];
  products: ProductRow[];
}

const TIER_LABEL: Record<string, string> = {
  retail: "Retail",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
};

export function WholesaleManager({ division, prices, customers, products }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [variantId, setVariantId] = useState("");
  const [tier, setTier] = useState<CustomerTier>("bronze");
  const [minQty, setMinQty] = useState("1");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const productMap = new Map(products.map((p) => [p.id, p]));

  async function handleUpsert(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/${division}/wholesale`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_variant_id: variantId,
          tier,
          min_quantity: Number(minQty),
          price: Number(price),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage("Wholesale price saved.");
      setShowForm(false);
      setVariantId("");
      setMinQty("1");
      setPrice("");
      router.refresh();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const wholesaleCustomers = customers.filter((c) => c.wholesale);

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setShowForm(!showForm)} className="btn">
          {showForm ? "Cancel" : "+ Add Price Tier"}
        </button>
      </div>

      {message && (
        <div className="alert" style={{ marginBottom: "1rem", padding: "0.75rem", background: message.includes("error") || message.includes("failed") ? "#f8d7da" : "#d4edda", borderRadius: "4px" }}>
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleUpsert} style={{ background: "#f9f9f9", padding: "1.5rem", marginBottom: "1.5rem", borderRadius: "8px" }}>
          <h2>Wholesale Price</h2>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
            <label>Variant:
              <select value={variantId} onChange={(e) => setVariantId(e.target.value)} required style={{ width: "100%", padding: "0.5rem" }}>
                <option value="">Select variant...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>Tier:
              <select value={tier} onChange={(e) => setTier(e.target.value as CustomerTier)} required style={{ width: "100%", padding: "0.5rem" }}>
                {CUSTOMER_TIERS.map((t) => <option key={t} value={t}>{TIER_LABEL[t]}</option>)}
              </select>
            </label>
            <label>Min Quantity:
              <input type="number" value={minQty} onChange={(e) => setMinQty(e.target.value)} min={1} required style={{ width: "100%", padding: "0.5rem" }} />
            </label>
            <label>Price (₹):
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min={0} required style={{ width: "100%", padding: "0.5rem" }} />
            </label>
          </div>
          <button type="submit" disabled={saving} className="btn" style={{ marginTop: "1rem" }}>
            {saving ? "Saving..." : "Save Price"}
          </button>
        </form>
      )}

      <h3>Wholesale Price Tiers</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
        <thead>
          <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Product</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Tier</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Min Qty</th>
            <th style={{ textAlign: "right", padding: "0.75rem" }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((row) => {
            const product = productMap.get(row.product_variant_id);
            return (
              <tr key={row.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "0.5rem 0.75rem" }}>{product?.name ?? row.product_variant_id}</td>
                <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                  <span className="pill">{TIER_LABEL[row.tier]}</span>
                </td>
                <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>{row.min_quantity}</td>
                <td style={{ padding: "0.5rem 0.75rem", textAlign: "right" }}>₹{row.price.toLocaleString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {prices.length === 0 && (
        <p style={{ padding: "1rem", textAlign: "center", color: "#999" }}>No wholesale prices configured.</p>
      )}

      <h3>Wholesale Customers</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Name</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Phone</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Tier</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Wholesale</th>
          </tr>
        </thead>
        <tbody>
          {wholesaleCustomers.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.5rem 0.75rem" }}>{c.name}</td>
              <td style={{ padding: "0.5rem 0.75rem" }}>{c.phone}</td>
              <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                <span className="pill">{TIER_LABEL[c.tier] ?? c.tier}</span>
              </td>
              <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                {c.wholesale ? <span className="pill green">Yes</span> : <span className="pill gray">No</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {wholesaleCustomers.length === 0 && (
        <p style={{ padding: "1rem", textAlign: "center", color: "#999" }}>No wholesale customers.</p>
      )}
    </>
  );
}