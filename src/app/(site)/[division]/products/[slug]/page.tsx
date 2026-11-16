import { notFound } from "next/navigation";
import { getPublicProductBySlug } from "@/lib/catalogue";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

const SITE_URL = "https://yaga-group-website.vercel.app";

type Props = {
  params: Promise<{ division: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { division, slug } = await params;
  const product = await getPublicProductBySlug(division, slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }

  const title = `${product.name} - ${product.short_description || "Buy Online at YAGA GROUP"}`;
  const description = product.short_description || product.description || `Buy ${product.name} online at YAGA GROUP. Quality products at competitive prices with fast delivery.`;
  const images = product.images.filter((img) => !img.is_360).slice(0, 5).map((img) => ({
    url: img.url,
    alt: img.alt || product.name,
  }));

  return {
    title,
    description,
    keywords: [
      product.name,
      product.category_name,
      "buy online",
      "YAGA GROUP",
      division,
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      type: "website",
      url: `${SITE_URL}/${division}/products/${slug}`,
      siteName: "YAGA GROUP",
      images: images.length > 0 ? images : [{ url: `${SITE_URL}/icon.svg`, alt: "YAGA GROUP" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length > 0 ? [images[0].url] : [`${SITE_URL}/icon.svg`],
    },
    alternates: {
      canonical: `${SITE_URL}/${division}/products/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { division, slug } = await params;
  if (!["mobiles", "jewellery", "digital"].includes(division)) notFound();

  const product = await getPublicProductBySlug(division, slug);
  if (!product) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: videos } = await supabase
    .from("product_videos")
    .select("id, url, title, is_feature")
    .eq("product_id", product.id)
    .order("created_at");

  // Structured data for SEO (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description || product.name,
    image: product.images.filter((img) => !img.is_360).map((img) => img.url),
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "YAGA GROUP",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/${division}/products/${slug}`,
      priceCurrency: "INR",
      price: product.retail_price || 0,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "YAGA GROUP",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "0",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main>
        <ProductDetail
          product={product}
          division={division}
          videos={videos ?? []}
        />
      </main>
    </>
  );
}