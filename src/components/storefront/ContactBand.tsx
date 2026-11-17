import { WHATSAPP_NUMBER } from "@/lib/hot-deals";
import { GENERAL_GREETING } from "@/lib/whatsapp";

export function ContactBand() {
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `${GENERAL_GREETING}\n\nPlease share your latest offers and deals.`
  )}`;
  const call = `tel:+91${WHATSAPP_NUMBER}`;

  return (
    <section className="cta-band" id="whatsapp">
      <div className="container cta-in">
        <div className="wa-ico" aria-hidden="true">
          <svg viewBox="0 0 48 48">
            <path d="M8 10h32a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H22l-9 8v-8H8a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2z" />
          </svg>
        </div>
        <h2>Contact us on WhatsApp</h2>
        <p>Get in touch with us instantly via WhatsApp</p>
        <div className="ctas">
          <a className="btn-ink" href={wa} target="_blank" rel="noopener noreferrer">
            Send message →
          </a>
          <a className="btn-ol" href={call}>
            Call now
          </a>
        </div>
      </div>
    </section>
  );
}