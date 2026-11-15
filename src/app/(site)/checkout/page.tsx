"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

const DIVISIONS = ["mobiles", "jewellery", "digital"] as const;

export default function CheckoutPage() {
  const { items, subtotal, clear, ready } = useCart();
  const [step, setStep] = useState(1);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    division: "mobiles" as string,
  });

  function set(k: string, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function placeOrder() {
    setPlacing(true);
    setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        division: form.division,
        customer_name: form.name,
        phone: form.phone,
        email: form.email || null,
        address: form.address || null,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    });
    const body = await res.json().catch(() => ({}));
    setPlacing(false);
    if (!res.ok) {
      setError(body.error || "Failed to place order.");
      return;
    }
    setOrderNumber(String(body.order_number));
    clear();
  }

  if (!ready) return <main className="container"><p className="muted">Loading…</p></main>;

  if (orderNumber) {
    return (
      <main className="container" style={{ padding: "48px 0", textAlign: "center" }}>
        <h1>Order placed ✓</h1>
        <p className="muted" style={{ fontSize: 18 }}>
          Your order number is <strong>#{orderNumber}</strong>.
        </p>
        <p className="muted">
          We will call you on {form.phone} to confirm your Cash on Delivery order.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center" }}>
          <Link className="btn gold" href={`/${form.division}`}>Continue shopping</Link>
          <Link className="btn outline" href="/">Home</Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container" style={{ padding: "48px 0" }}>
        <h1>Checkout</h1>
        <div className="notice" style={{ marginTop: 16 }}>
          Your cart is empty. <Link href="/mobiles">Browse products</Link>.
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "32px 0" }}>
      <h1>Checkout</h1>
      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        {["Details", "Payment", "Review"].map((label, i) => (
          <span
            key={label}
            className="pill"
            style={{
              background: step === i + 1 ? "#b18b50" : "#f1eee7",
              color: step === i + 1 ? "#111" : "#555",
            }}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {error && <p className="admin-auth-error">{error}</p>}

      {step === 1 && (
        <section className="admin-form-card" style={{ padding: 20, borderRadius: 12, border: "1px solid #ece8df" }}>
          <h2>Delivery details</h2>
          <div className="admin-form-grid">
            <label className="field"><span>Full name</span>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} required /></label>
            <label className="field"><span>Phone</span>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} required /></label>
            <label className="field"><span>Email (optional)</span>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></label>
            <label className="field"><span>Division</span>
              <select value={form.division} onChange={(e) => set("division", e.target.value)}>
                {DIVISIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select></label>
            <label className="field admin-form-wide"><span>Delivery address</span>
              <textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} /></label>
          </div>
          <div className="admin-form-actions">
            <button
              className="btn gold"
              disabled={!form.name || !form.phone}
              onClick={() => setStep(2)}
            >
              Continue to payment
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="admin-form-card" style={{ padding: 20, borderRadius: 12, border: "1px solid #ece8df" }}>
          <h2>Payment</h2>
          <p className="muted">Cash on Delivery — pay when your order arrives.</p>
          <div style={{ padding: 12, border: "2px solid #b18b50", borderRadius: 8, marginTop: 12 }}>
            <strong>Cash on Delivery</strong>
            <p className="muted" style={{ fontSize: 13 }}>Pay ₹{subtotal} in cash to the delivery agent.</p>
          </div>
          <div className="admin-form-actions">
            <button className="btn outline" onClick={() => setStep(1)}>Back</button>
            <button className="btn gold" onClick={() => setStep(3)}>Review order</button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="admin-form-card" style={{ padding: 20, borderRadius: 12, border: "1px solid #ece8df" }}>
          <h2>Review & place order</h2>
          <div style={{ margin: "12px 0" }}>
            {items.map((i) => (
              <div key={i.productId} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0ece4" }}>
                <span>{i.name} × {i.quantity}</span>
                <span>₹{i.price * i.quantity}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, margin: "12px 0" }}>
            <span>Total (COD)</span>
            <span>₹{subtotal}</span>
          </div>
          <p className="muted" style={{ fontSize: 13 }}>
            Deliver to: {form.name}, {form.phone} — {form.address || "address on file"}
          </p>
          <div className="admin-form-actions">
            <button className="btn outline" onClick={() => setStep(2)} disabled={placing}>Back</button>
            <button className="btn gold" onClick={placeOrder} disabled={placing}>
              {placing ? "Placing order…" : "Place order"}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}