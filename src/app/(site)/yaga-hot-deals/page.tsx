import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAGA'S MART | Mega Offers",
  description:
    "Explore the latest mega offers at YAGA'S MART. Eight hand-picked products with exciting prices. Order on WhatsApp +91 9787608569.",
  keywords: [
    "YAGA'S MART",
    "mega offers",
    "mobile accessories offers",
    "remote control helicopter",
    "smart watch offers",
    "order on whatsapp",
  ],
  openGraph: {
    title: "YAGA'S MART | Mega Offers",
    description: "Big excitement. Brilliant prices. Explore our hand-picked collection of must-have gadgets.",
    type: "website",
    url: "https://yaga-group-website.vercel.app/yaga-hot-deals",
    siteName: "YAGA GROUP",
  },
  alternates: {
    canonical: "https://yaga-group-website.vercel.app/yaga-hot-deals",
  },
};

export default function YagaHotDealsPage() {
  return (
    <iframe
      src="/yaga-hot-deals.html"
      title="YAGA'S MART — Mega Offers"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
        zIndex: 9999,
        background: "#07080d",
      }}
    />
  );
}