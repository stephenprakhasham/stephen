const ITEMS = [
  { icon: "💵", label: "Cash on Delivery" },
  { icon: "🚚", label: "Free Delivery over ₹499" },
  { icon: "🛡️", label: "1 Year Warranty" },
  { icon: "💬", label: "Order on WhatsApp" },
];

export function TrustStrip() {
  return (
    <div className="trust-strip">
      {ITEMS.map((it) => (
        <div className="trust-item" key={it.label}>
          <span className="ti-icon">{it.icon}</span>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  );
}