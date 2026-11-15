import Link from "next/link";
import { notFound } from "next/navigation";
import { divisionInfo, digitalServices } from "@/lib/data";
import { whatsappUrl } from "@/lib/whatsapp";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import EnquiryForm from "@/components/EnquiryForm";

export const dynamic = "force-dynamic";

interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  retail_price: number | null;
  image_urls: string[];
  category_id: string | null;
  material_finish: string | null;
}

async function getPublishedProducts(division: string): Promise<PublicProduct[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("catalogue_products")
      .select(
        "id, name, slug, short_description, description, retail_price, image_urls, category_id, material_finish"
      )
      .eq("division_id", division)
      .order("created_at", { ascending: false })
      .limit(24);
    return (data ?? []) as PublicProduct[];
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
        <section className="section">
          <div className="container">
            <div className="sectionhead">
              <div>
                <div className="eyebrow">Explore catalogue</div>
                <h2>{key === "mobiles" ? "Mobile essentials" : "Jewellery collections"}</h2>
              </div>
              <span className="pill">Enquiry-based ordering</span>
            </div>
            {list.length === 0 ? (
              <div className="notice">
                Catalogue is being prepared. Send an enquiry on WhatsApp for current availability
                and pricing. Final order details are confirmed manually by our team.
              </div>
            ) : (
              <div className="products" style={{ marginTop: 22 }}>
                {list.map((p) => (
                  <article className="product" key={p.id}>
                    <div className="productvisual">
                      {p.image_urls?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_urls[0]} alt={p.name} className="productimg" />
                      ) : (
                        <div className="productmark">{info.name.split(" ").map((w) => w[0]).join("")}</div>
                      )}
                    </div>
                    <h3>{p.name}</h3>
                    <p>{p.short_description || p.description || info.tagline}</p>
                    <div className="product-meta">
                      {p.retail_price != null && <span>₹{p.retail_price}</span>}
                      {p.material_finish && <span>{p.material_finish}</span>}
                    </div>
                    <a className="btn outline" href={wa} target="_blank" rel="noreferrer">Enquire ↗</a>
                  </article>
                ))}
              </div>
            )}
            <div style={{ marginTop: 24 }}>
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