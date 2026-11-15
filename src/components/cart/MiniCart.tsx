"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartContext";

export function MiniCart() {
  const { count, subtotal, ready } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="navcta"
        onClick={() => setOpen((o) => !o)}
        style={{ position: "relative" }}
        aria-label="Cart"
      >
        Cart
        {ready && count > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "#b18b50",
              color: "#111",
              borderRadius: 999,
              minWidth: 18,
              height: 18,
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="minicart"
          style={{
            position: "fixed",
            top: 76,
            right: 20,
            width: 320,
            background: "#fff",
            border: "1px solid #ece8df",
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,.12)",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <strong>Your cart</strong>
            <button
              onClick={() => setOpen(false)}
              style={{ background: "none", border: 0, cursor: "pointer", fontSize: 18 }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <MiniCartItems />
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <strong>₹{subtotal}</strong>
          </div>
          <Link
            href="/cart"
            className="btn gold"
            style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
            onClick={() => setOpen(false)}
          >
            View cart
          </Link>
        </div>
      )}
    </>
  );
}

function MiniCartItems() {
  const { items, remove, ready } = useCart();
  if (!ready) return <p className="muted">Loading…</p>;
  if (items.length === 0) return <p className="muted">Your cart is empty.</p>;
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: 240, overflowY: "auto" }}>
      {items.map((i) => (
        <li key={i.productId} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {i.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={i.image} alt={i.name} style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{i.name}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              ₹{i.price} × {i.quantity}
            </div>
          </div>
          <button
            onClick={() => remove(i.productId)}
            style={{ background: "none", border: 0, color: "#a11", cursor: "pointer", fontSize: 12 }}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}