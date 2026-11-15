import { requireSuperAdmin } from "@/lib/admin-auth";
import {
  listAdminUsers,
  listRoles,
  listDivisions,
} from "@/lib/admin-data";
import { UserRoleManager } from "@/components/admin/UserRoleManager";

export const dynamic = "force-dynamic";

export default async function SuperUsersPage() {
  await requireSuperAdmin();
  const [users, roles, divisions] = await Promise.all([
    listAdminUsers(),
    listRoles(),
    listDivisions(),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Super Admin</p>
          <h1>Users &amp; Roles</h1>
        </div>
        <span className="pill">{users.length} users</span>
      </div>

      <UserRoleManager users={users} roles={roles} divisions={divisions} />
    </div>
  );
}