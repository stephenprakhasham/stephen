import { notFound, redirect } from "next/navigation";
import { getAuthContext, canAccessDivision, isSuperAdmin } from "@/lib/admin-auth";
import type { DivisionId } from "@/lib/admin-auth";

const VALID: DivisionId[] = ["mobiles", "jewellery", "digital"];

export default async function DivisionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ division: string }>;
}) {
  const { division } = await params;
  const ctx = await getAuthContext();
  if (!ctx) redirect("/admin/login");

  if (!VALID.includes(division as DivisionId)) notFound();

  const div = division as DivisionId;
  if (!isSuperAdmin(ctx) && !canAccessDivision(ctx, div)) {
    notFound();
  }

  return <>{children}</>;
}