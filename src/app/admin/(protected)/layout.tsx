import { redirect } from "next/navigation";
import { getAuthContext, isSuperAdmin, isGroupAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getAuthContext();
  if (!ctx) redirect("/admin/login");

  const canSeeSuper =
    isSuperAdmin(ctx) || isGroupAdmin(ctx) ? true : false;

  return (
    <AdminShell
      email={ctx.user.email ?? ""}
      fullName={ctx.profile.full_name}
      role={ctx.profile.role}
      divisions={ctx.divisions}
      canSeeSuper={canSeeSuper}
    >
      {children}
    </AdminShell>
  );
}