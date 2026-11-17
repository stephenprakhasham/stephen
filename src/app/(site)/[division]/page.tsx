import Link from "next/link";
import { notFound } from "next/navigation";
import { divisionInfo, digitalServices } from "@/lib/data";
import { whatsappUrl } from "@/lib/whatsapp";
import { getPublicProductsForDivision } from "@/lib/catalogue";
import { WHATSAPP_NUMBER } from "@/lib/hot-deals";
import EnquiryForm from "@/components/EnquiryForm";
import { ProductGrid } from "@/components/storefront/ProductGrid";
import { ProductCard } from "@/components/storefront/ProductCard";
import { MobilesProductCard } from "@/components/storefront/MobilesProductCard";
import { PromoTicker } from "@/components/storefront/PromoTicker";
import { TrustStrip } from "@/components/storefront/TrustStrip";
import { CategoryTiles } from "@/components/storefront/CategoryTiles";
import { FeaturedRow } from "@/components/storefront/FeaturedRow";
import { BundleKits } from "@/components/storefront/BundleKits";
import { HowToOrder } from "@/components/storefront/HowToOrder";
import { BrandsStrip } from "@/components/storefront/BrandsStrip";
import { FAQ } from "@/components/storefront/FAQ";
import { CinematicHero } from "@/components/storefront/CinematicHero";
import { ContactBand } from "@/components/storefront/ContactBand";
import { FeaturesGrid } from "@/components/storefront/FeaturesGrid";
import { MobilesFooter } from "@/components/storefront/MobilesFooter";
import type { Metadata } from "next";
import type { ProductCardData } from "@/components/storefront/ProductCard";

export const revalidate = 60;

export function generateStaticParams() {
  return [{ division: "mobiles" }, { division: "jewellery" }, { division: "digital" }];
}

const SITE_URL = "https://yaga-group-website.vercel.app";

type Props = {
  params: Promise<{ division: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { division } = await params;
  if (!["mobiles", "jewellery", "digital"].includes(division)) {
    return { title: "Page Not Found" };
  }

  const key = division as keyof typeof divisionInfo;
  const info = divisionInfo[key];

  return {
    title: info.name,
    description: `${info.name} - ${info.tagline}. ${info.intro}`,
    keywords: [
      info.name,
      info.tagline,
      division,
      "YAGA GROUP",
      ...divisionInfo[key].keywords,
    ],
    openGraph: {
      title: info.name,
      description: `${info.name} - ${info.tagline}`,
      type: "website",
      url: `${SITE_URL}/${division}`,
      siteName: "YAGA GROUP",
    },
    twitter: {
      card: "summary_large_image",
      title: info.name,
      description: info.tagline,
    },
    alternates: {
      canonical: `${SITE_URL}/${division}`,
    },
  };
}

function MobilesPage({ products }: { products: ProductCardData[] }) {
  return (
    <div className="yaga-mobiles">
      <PromoTicker />
      <CinematicHero />
      <section className="ym-trust-bar">
        <div className="container">
          <TrustStrip />
        </div>
      </section>

      <section className="section alt" id="catalogue">
        <div className="container">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">Shop by category</div>
              <h2>Find your accessory</h2>
            </div>
          </div>
          <CategoryTiles />
        </div>
      </section>

      {products.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="sectionhead">
              <div>
                <div className="eyebrow">In store now</div>
                <h2>Trending accessories</h2>
              </div>
            </div>
            <FeaturedRow products={products.slice(0, 8)} />
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="section alt">
          <div className="container">
            <div className="sectionhead">
              <div>
                <div className="eyebrow">Full catalogue</div>
                <h2>All products</h2>
              </div>
              <span className="ym-filter active">In Stock</span>
            </div>
            <div className="ym-products">
              {products.map((p) => (
                <MobilesProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">Buy together & save</div>
              <h2>Ready-made kits</h2>
            </div>
          </div>
          <BundleKits />
        </div>
      </section>

      <section className="ym-steps-light">
        <div className="container">
          <div className="sectionhead">
            <div>
              <div className="eyebrow">How to order</div>
              <h2>Three steps to your door</h2>
            </div>
          </div>
          <HowToOrder />
        </div>
      </section>

      <div className="ym-brands" aria-label="Brands in store">
        <div className="container" style={{ marginBottom: 8 }}>
          <div className="eyebrow" style={{ color: "#FF8A00" }}>
            Brands in store
          </div>
        </div>
        <BrandsStrip />
      </div>

      <section className="ym-faq-light" id="faq">
        <div className="container faq-grid">
          <div>
            <div className="eyebrow">Questions</div>
            <h2>Good to know</h2>
          </div>
          <FAQ />
        </div>
      </section>

      <ContactBand />

      <section style={{ background: "#F1F2F4", padding: "28px 0 36px" }}>
        <FeaturesGrid />
      </section>

      <MobilesFooter />
    </div>
  );
}

export default async function DivisionPage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  if (!["mobiles", "jewellery", "digital"].includes(division)) notFound();
  const key = division as keyof typeof divisionInfo;
  const info = divisionInfo[key];
  const wa = whatsappUrl(info.wa, `Hello ${info.name}, I would like to make an enquiry.`);

  const products =
    key === "digital" ? [] : ((await getPublicProductsForDivision(key, 24)) as unknown as ProductCardData[]);

  if (key === "mobiles") {
    return <MobilesPage products={products} />;
  }

  return (
    <main>
      <section className="pagehero">
        <div className="container">
          <div className="eyebrow">YAGA GROUP / {info.name}</div>
          <h1>{info.name}</h1>
          <p className="muted">{info.tagline}</p>
          <p className="muted" style={{ maxWidth: 760 }}>{info.intro}</p>
          <div className="hero-actions">
            <a className="btn gold" href={wa} target="_blank" rel="noreferrer">Enquire on WhatsApp ↗</a>
            <Link className="btn outline" href="/">Back to YAGA GROUP</Link>
          </div>
        </div>
      </section>

      {key === "digital" ? (
        <section className="section">
          <div className="container">
            <div className="notice">
              The original Digital Nexus HTML has been retained unchanged and is loaded below.
              Replace the WhatsApp placeholder in the group contact settings before launch.
            </div>
            <div style={{ marginTop: 24 }}>
              <h2>Digital Nexus services</h2>
              <div className="feature-grid">
                {digitalServices.map((s) => (
                  <div className="feature" key={s}>
                    <strong>{s}</strong>
                    <p>Send an enquiry to discuss scope, timeline and quotation.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="section" style={{ background: "#f8f7f4" }}>
          <div className="container">
            <div className="sectionhead" style={{ marginBottom: 32 }}>
              <div>
                <div className="eyebrow">Explore catalogue</div>
                <h2>Jewellery collections</h2>
                <p className="muted" style={{ margin: "8px 0 0", fontSize: 14 }}>
                  Browse our collection
                </p>
              </div>
              <span className="pill" style={{ background: "#e6f4ea", color: "#1e7b3c", fontSize: 11 }}>
                In Stock
              </span>
            </div>
            {products.length === 0 ? (
              <div className="notice">
                Catalogue is being prepared. Send an enquiry on WhatsApp for current availability
                and pricing. Final order details are confirmed manually by our team.
              </div>
            ) : (
              <div className="products">
                {products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{
                      ...p,
                      division,
                      divisionName: info.name,
                    }}
                  />
                ))}
              </div>
            )}
            <div style={{ marginTop: 32 }}>
              <EnquiryForm
                divisionId={key}
                divisionName={info.name}
                whatsapp={info.wa}
              />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}