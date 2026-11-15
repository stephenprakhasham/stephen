import { notFound } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin, type DivisionId } from "@/lib/admin-auth";
import { listEnquiries } from "@/lib/orders";
import { EnquiryManager } from "@/components/admin/EnquiryManager";

export const dynamic = "force-dynamic";

const LABELS: Record<DivisionId, string> = {
  mobiles: "YAGA MOBILES",
  jewellery: "YAGA GOLD & FASHION",
  digital: "YAGA DIGITAL NEXUS",
};

export default async function DivisionEnquiriesPage({
  params,
}: {
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  const div = division as DivisionId;
  const ctx = await getAuthContext();
  if (!ctx) notFound();
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) notFound();

  const rows = await listEnquiries(div);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">{LABELS[div]}</p>
          <h1>Enquiries</h1>
        </div>
        <span className="pill">{rows.length} recent</span>
      </div>
      <EnquiryManager division={div} enquiries={rows} />
    </div>
  );
}