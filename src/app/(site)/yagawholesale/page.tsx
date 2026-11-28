import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YAGA MOBILES WHOLESALE | Bulk Prices for Retailers & Dealers",
  description:
    "Wholesale mobile accessories and phones for retailers and dealers. Tier pricing, low MOQ, fast stock. Enquire on WhatsApp +91 97876 08569.",
  keywords: [
    "yaga wholesale",
    "mobile accessories wholesale",
    "bulk mobile accessories",
    "wholesale charger",
    "wholesale neckband",
    "retailer dealer prices",
  ],
};

export default function YagaWholesalePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  return <YagaWholesaleClient searchParams={searchParams} />;
}

async function YagaWholesaleClient({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const category = params.category;
  const v = "20261127r";
  const base = `/yaga-hot-deals-v2.html?v=${v}&shop=wholesale`;
  const src = category ? `${base}&category=${encodeURIComponent(category)}` : base;

  return (
    <iframe
      src={src}
      title="YAGA MOBILES WHOLESALE"
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