export function PromoTicker() {
  const items = [
    "Free delivery over ₹499",
    "Cash on Delivery available",
    "Order on WhatsApp +91 9787608569",
    "New launches every week",
    "1 Year Warranty",
  ];
  return (
    <div className="promo-ticker" aria-hidden="true">
      <div className="promo-ticker-track">
        {[...items, ...items].map((t, i) => (
          <span key={i}>{t} ·</span>
        ))}
      </div>
    </div>
  );
}