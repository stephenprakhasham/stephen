import type { Metadata } from "next";
import Link from "next/link";
import { HOT_DEALS_PRODUCTS, HOT_DEALS_DEADLINE, WHATSAPP_NUMBER } from "@/lib/hot-deals";
import { HotDealsGrid, Countdown } from "@/components/storefront/HotDealsGrid";

const SITE_URL = "https://yaga-group-website.vercel.app";

export const metadata: Metadata = {
  title: "YAGA HOT DEALS | Limited Time Offers on Mobile Accessories",
  description:
    "YAGA HOT DEALS - special offer prices on mobile accessories. Order directly on WhatsApp +91 9787608569. Limited stock, limited time.",
  keywords: [
    "YAGA HOT DEALS",
    "YAGA MOBILES",
    "mobile accessories offers",
    "neckband offer",
    "earbuds deal",
    "charging cable offer",
    "power bank deal",
    "order on whatsapp",
  ],
  openGraph: {
    title: "YAGA HOT DEALS",
    description: "Limited-time offers on mobile accessories. Order now on WhatsApp +91 9787608569.",
    type: "website",
    url: `${SITE_URL}/yaga-hot-deals`,
    siteName: "YAGA GROUP",
  },
  twitter: {
    card: "summary_large_image",
    title: "YAGA HOT DEALS",
    description: "Limited-time offers. Order now on WhatsApp +91 9787608569.",
  },
  alternates: {
    canonical: `${SITE_URL}/yaga-hot-deals`,
  },
};

export default function YagaHotDealsPage() {
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hello YAGA MOBILES! I would like to know about the YAGA HOT DEALS offers."
  )}`;

  return (
    <main>
      <section className="pagehero hotdeals-hero">
        <div className="container">
          <div className="eyebrow">YAGA MOBILES / Limited Time Offers</div>
          <h1>
            YAGA HOT DEALS <span className="hotdeals-fire">🔥</span>
          </h1>
          <p className="muted">
            Special prices on mobile accessories. Grab the deal before stock runs out.
          </p>
          <div className="hotdeals-countdown-wrap">
            <span className="hotdeals-countdown-label">Offer ends in</span>
            <Countdown deadline={HOT_DEALS_DEADLINE} />
          </div>
          <div className="hero-actions">
            <a className="btn gold" href={wa} target="_blank" rel="noopener noreferrer">
              Order on WhatsApp ↗
            </a>
            <Link className="btn outline" href="/mobiles">
              Browse Mobiles
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#f8f7f4" }}>
        <div className="container">
          <div className="sectionhead" style={{ marginBottom: 32 }}>
            <div>
              <div className="eyebrow">Available Deals</div>
              <h2>This week&apos;s hot deals</h2>
              <p className="muted" style={{ margin: "8px 0 0", fontSize: 14 }}>
                Click ORDER NOW ON WHATSAPP to confirm availability with our team.
              </p>
            </div>
            <span className="pill" style={{ background: "#fdecea", color: "#b3261e", fontSize: 11 }}>
              Limited Stock
            </span>
          </div>
          <HotDealsGrid products={HOT_DEALS_PRODUCTS} />
        </div>
      </section>

      <section className="section hotdeals-cta">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>Can&apos;t find what you need?</h2>
          <p className="muted" style={{ maxWidth: 560, margin: "0 auto 20px" }}>
            Send us a message on WhatsApp and our team will help you find the right accessory.
          </p>
          <a className="btn gold" href={wa} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp +91 9787608569
          </a>
        </div>
      </section>
    </main>
  );
}