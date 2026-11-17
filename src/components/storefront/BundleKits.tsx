import { BUNDLE_KITS } from "@/lib/mobiles";
import { WHATSAPP_NUMBER } from "@/lib/hot-deals";

export function BundleKits() {
  return (
    <div className="bundle-grid">
      {BUNDLE_KITS.map((kit) => {
        const save = kit.originalPrice - kit.price;
        const msg = `Hello YAGA MOBILES! I want to order the ${kit.name}.\n\nItems: ${kit.items}\nBundle Price: ₹${kit.price} (MRP ₹${kit.originalPrice})\nYou Save: ₹${save}\n\nPlease confirm availability.`;
        return (
          <div className="bundle-card" key={kit.name}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>{kit.emoji}</div>
            <h3>{kit.name}</h3>
            <p className="bundle-items">{kit.items}</p>
            <div className="bundle-price">
              ₹{kit.price.toLocaleString("en-IN")}
              <s>₹{kit.originalPrice.toLocaleString("en-IN")}</s>
            </div>
            <a
              className="btn gold"
              style={{ width: "100%" }}
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Order Kit on WhatsApp
            </a>
          </div>
        );
      })}
    </div>
  );
}