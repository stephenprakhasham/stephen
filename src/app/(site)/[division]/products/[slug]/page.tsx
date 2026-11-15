import { notFound } from "next/navigation";
import { getPublicProductBySlug } from "@/lib/catalogue";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ProductDetail } from "@/components/storefront/ProductDetail";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ division: string; slug: string }>;
}) {
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

  return (
    <main>
      <ProductDetail
        product={product}
        division={division}
        videos={videos ?? []}
      />
    </main>
  );
}