import Link from "next/link";
import { notFound } from "next/navigation";
import { divisionInfo, digitalServices } from "@/lib/data";
import { whatsappUrl } from "@/lib/whatsapp";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import EnquiryForm from "@/components/EnquiryForm";
import { ProductCard, type ProductCardData } from "@/components/storefront/ProductCard";

export const dynamic = "force-dynamic";

interface ProductWithCategory {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  retail_price: number | null;
  compare_at_price: number | null;
  image_urls: string[];
  category_id: string | null;
  material_finish: string | null;
  category_name: string | null;
  image_url: string | null;
  images: { id: string; url: string; alt: string | null; is_main: boolean; is_360: boolean; sort_order: number }[];
}

async function getPublishedProducts(division: string): Promise<ProductWithCategory[]> {
  try {
    const supabase = await createSupabaseServerClient();

    // Fetch published products from the catalogue view
    const { data } = await supabase
      .from("catalogue_products")
      .select(
        "id, name, slug, short_description, description, retail_price, compare_at_price, image_urls, category_id, material_finish"
      )
      .eq("division_id", division)
      .order("created_at", { ascending: false })
      .limit(24);

    if (!data || data.length === 0) return [];

    // Fetch categories separately and build a lookup map
    const categoryIds = [...new Set(data.map((p) => p.category_id).filter(Boolean))] as string[];
    let categoryMap = new Map<string, string>();
    if (categoryIds.length > 0) {
      const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .in("id", categoryIds);
      categoryMap = new Map<string, string>();
      for (const cat of categories ?? []) {
        categoryMap.set(cat.id, cat.name);
      }
    }

    // Fetch all images for these products from product_images table
    const productIds = data.map((p) => p.id);
    const { data: images } = await supabase
      .from("product_images")
      .select("id, product_id, url, alt, is_main, is_360, sort_order")
      .in("product_id", productIds)
      .order("sort_order");

    const imagesByProduct = new Map<string, { id: string; url: string; alt: string | null; is_main: boolean; is_360: boolean; sort_order: number }[]>();
    for (const img of images ?? []) {
      if (!imagesByProduct.has(img.product_id)) {
        imagesByProduct.set(img.product_id, []);
      }
      imagesByProduct.get(img.product_id)!.push({
        id: img.id,
        url: img.url,
        alt: img.alt,
        is_main: img.is_main,
        is_360: img.is_360 ?? false,
        sort_order: img.sort_order,
      });
    }

    // Fallback to image_urls column if no product_images entry
    for (const p of data) {
      if (p.image_urls?.length && !imagesByProduct.has(p.id)) {
        imagesByProduct.set(p.id, p.image_urls.map((url: string, idx: number) => ({
          id: `fallback-${idx}`,
          url,
          alt: null,
          is_main: idx === 0,
          is_360: false,
          sort_order: idx,
        })));
      }
    }

    return data.map((p) => {
      const productImages = imagesByProduct.get(p.id) ?? [];
      const mainImage = productImages.find((img) => img.is_main)?.url ?? productImages[0]?.url ?? null;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        short_description: p.short_description,
        description: p.description,
        retail_price: p.retail_price,
        compare_at_price: p.compare_at_price,
        image_urls: p.image_urls ?? [],
        category_id: p.category_id,
        material_finish: p.material_finish,
        category_name: p.category_id ? categoryMap.get(p.category_id) ?? null : null,
        image_url: mainImage,
        images: productImages.filter((img) => !img.is_360),
      };
    });
  } catch {
    return [];
  }
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
  const list = key === "digital" ? [] : await getPublishedProducts(key);

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
                <h2>{key === "mobiles" ? "Mobile essentials" : "Jewellery collections"}</h2>
                <p className="muted" style={{ margin: "8px 0 0", fontSize: 14 }}>
                  {list.length > 0 ? `${list.length} products available` : "Browse our collection"}
                </p>
              </div>
              <span className="pill" style={{ background: "#e6f4ea", color: "#1e7b3c", fontSize: 11 }}>
                In Stock
              </span>
            </div>
            {list.length === 0 ? (
              <div className="notice">
                Catalogue is being prepared. Send an enquiry on WhatsApp for current availability
                and pricing. Final order details are confirmed manually by our team.
              </div>
            ) : (
              <div className="products">
                {list.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={{
                      id: p.id,
                      name: p.name,
                      slug: p.slug,
                      short_description: p.short_description,
                      description: p.description,
                      retail_price: p.retail_price,
                      compare_at_price: p.compare_at_price,
                      image_url: p.image_url,
                      images: p.images,
                      category_name: p.category_name,
                      material_finish: p.material_finish,
                      division: key,
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