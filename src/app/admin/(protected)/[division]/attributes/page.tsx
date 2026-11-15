import { notFound } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin, type DivisionId } from "@/lib/admin-auth";
import { listAttributeDefinitions, listCategories } from "@/lib/catalogue";
import { AttributeManager } from "@/components/admin/AttributeManager";

export const dynamic = "force-dynamic";

const LABELS: Record<DivisionId, string> = {
  mobiles: "YAGA MOBILES",
  jewellery: "YAGA GOLD & FASHION",
  digital: "YAGA DIGITAL NEXUS",
};

export default async function DivisionAttributesPage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  const div = division as DivisionId;
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) notFound();

  const [definitions, categories] = await Promise.all([
    listAttributeDefinitions(div),
    listCategories(div),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">{LABELS[div]}</p>
          <h1>Attribute Builder</h1>
        </div>
        <span className="pill">{definitions.length} attributes</span>
      </div>
      <AttributeManager division={div} definitions={definitions} categories={categories} />
    </div>
  );
}