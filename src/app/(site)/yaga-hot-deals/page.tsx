import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAGA'S MART | Special Offers",
  description:
    "Explore the latest special offers at YAGA'S MART. Hand-picked products with exciting prices. Order on WhatsApp +91 9787608569.",
  keywords: [
    "YAGA'S MART",
    "special offers",
    "mobile accessories offers",
    "order on whatsapp",
  ],
  openGraph: {
    title: "YAGA'S MART | Special Offers",
    description: "Big excitement. Brilliant prices. Explore our hand-picked collection of must-have gadgets.",
    type: "website",
    url: "https://yaga-group-website.vercel.app/yaga-hot-deals",
    siteName: "YAGA GROUP",
  },
  alternates: {
    canonical: "https://yaga-group-website.vercel.app/yaga-hot-deals",
  },
};

export default function YagaHotDealsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return <YagaHotDealsClient searchParams={searchParams} />;
}

async function YagaHotDealsClient({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const v = "20261127r";
  const src = category
    ? `/yaga-hot-deals-v2.html?v=${v}&category=${encodeURIComponent(category)}`
    : `/yaga-hot-deals-v2.html?v=${v}`;

  return (
    <iframe
      src={src}
      title="YAGA'S MART — Special Offers"
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