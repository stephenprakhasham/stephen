"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

export default function CartPage() {
  const { items, subtotal, setQuantity, remove, ready } = useCart();

  if (!ready) return <main className="container"><p className="muted">Loading cart…</p></main>;

  return (
    <main className="container" style={{ padding: "32px 0", minHeight: 400 }}>
      <h1>Your Cart</h1>
      {items.length === 0 ? (
        <div className="notice" style={{ marginTop: 16 }}>
          Your cart is empty. <Link href="/mobiles">Browse mobiles</Link> or{" "}
          <Link href="/jewellery">jewellery</Link>.
        </div>
      ) : (
        <>
          <div style={{ marginTop: 16 }}>
            {items.map((i) => (
              <div
                key={i.productId}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid #ece8df",
                }}
              >
                {i.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.image} alt={i.name} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }} />
                )}
                <div style={{ flex: 1 }}>
                  <Link href={`/${i.division}/products/${i.slug}`} style={{ fontWeight: 600 }}>
                    {i.name}
                  </Link>
                  <div className="muted" style={{ fontSize: 13 }}>₹{i.price} each</div>
                </div>
                <input
                  type="number"
                  min={1}
                  value={i.quantity}
                  onChange={(e) => setQuantity(i.productId, Number(e.target.value) || 1)}
                  style={{ width: 64, padding: "6px 8px" }}
                />
                <div style={{ width: 90, textAlign: "right", fontWeight: 600 }}>
                  ₹{i.price * i.quantity}
                </div>
                <button
                  className="btn outline"
                  style={{ padding: "6px 10px", fontSize: 12, color: "#a11", borderColor: "#e3b6b6" }}
                  onClick={() => remove(i.productId)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span className="muted">Subtotal</span>
              <div style={{ fontSize: 22, fontWeight: 700 }}>₹{subtotal}</div>
            </div>
            <Link className="btn gold" href="/checkout">Proceed to checkout →</Link>
          </div>
        </>
      )}
    </main>
  );
}