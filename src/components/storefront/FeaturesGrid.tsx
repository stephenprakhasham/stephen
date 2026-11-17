import { WHATSAPP_NUMBER } from "@/lib/hot-deals";

export function FeaturesGrid() {
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello! I need help with an order."
  )}`;

  return (
    <div className="cxu-sg">
      <div>
        <b>Cash on delivery</b>
        <span>Pay when it arrives</span>
      </div>
      <div>
        <b>100% original</b>
        <span>Official warranty</span>
      </div>
      <div>
        <b>Free delivery</b>
        <span>On orders over ₹499</span>
      </div>
      <a href={wa} target="_blank" rel="noopener noreferrer">
        <b>Need help?</b>
        <span>Chat on WhatsApp</span>
      </a>
    </div>
  );
}