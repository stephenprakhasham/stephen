import { notFound } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin, type DivisionId } from "@/lib/admin-auth";
import { listCategories, listBrands, listProducts } from "@/lib/catalogue";
import { ProductManager } from "@/components/admin/ProductManager";

export const dynamic = "force-dynamic";

const LABELS: Record<DivisionId, string> = {
  mobiles: "YAGA MOBILES",
  jewellery: "YAGA GOLD & FASHION",
  digital: "YAGA DIGITAL NEXUS",
};

export default async function DivisionProductsPage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  const div = division as DivisionId;
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) notFound();

  const [products, categories, brands] = await Promise.all([
    listProducts(div),
    listCategories(div),
    listBrands(div),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">{LABELS[div]}</p>
          <h1>Products</h1>
        </div>
        <span className="pill">{products.length} products</span>
      </div>
      <ProductManager
        division={div}
        products={products}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}