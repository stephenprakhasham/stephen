import { notFound } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin, type DivisionId } from "@/lib/admin-auth";
import { listCategories } from "@/lib/catalogue";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

const LABELS: Record<DivisionId, string> = {
  mobiles: "YAGA MOBILES",
  jewellery: "YAGA GOLD & FASHION",
  digital: "YAGA DIGITAL NEXUS",
};

export default async function DivisionCategoriesPage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  const div = division as DivisionId;
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) notFound();

  const categories = await listCategories(div);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">{LABELS[div]}</p>
          <h1>Categories</h1>
        </div>
        <span className="pill">{categories.length} categories</span>
      </div>
      <CategoryManager division={div} categories={categories} />
    </div>
  );
}