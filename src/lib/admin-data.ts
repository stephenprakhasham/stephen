import { requireSuperAdmin } from "@/lib/admin-auth";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase-server";

export interface AdminUserRow {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  createdAt: string;
  lastSignIn: string | null;
}

/**
 * List all auth users joined with their profile role (super admin only).
 * Uses the service-role client because emails live in auth.users and are not
 * exposed through RLS to the caller.
 */
export async function listAdminUsers(): Promise<AdminUserRow[]> {
  await requireSuperAdmin();
  const svc = createSupabaseServiceClient();

  const { data: profiles } = await svc
    .from("profiles")
    .select("id, role, full_name, created_at");
  const profileMap = new Map<
    string,
    { role: string; fullName: string | null; createdAt: string }
  >();
  for (const p of profiles ?? []) {
    profileMap.set(p.id, {
      role: p.role,
      fullName: p.full_name,
      createdAt: p.created_at,
    });
  }

  const users: AdminUserRow[] = [];
  let page = 1;
  const perPage = 200;
  // Paginate through auth users.
  for (;;) {
    const { data, error } = await svc.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      const prof = profileMap.get(u.id);
      users.push({
        id: u.id,
        email: u.email ?? "",
        role: prof?.role ?? "customer",
        fullName: prof?.fullName ?? "",
        createdAt: prof?.createdAt ?? u.created_at,
        lastSignIn: u.last_sign_in_at ?? null,
      });
    }
    if (data.users.length < perPage) break;
    page += 1;
  }
  return users;
}

export async function listRoles() {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("roles")
    .select("id, division_id, key, name, description")
    .order("name");
  return data ?? [];
}

export async function listDivisions() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("business_divisions")
    .select("id, name");
  return data ?? [];
}

export async function listCategories() {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, division_id");
  return data ?? [];
}

export async function listAssignments() {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_role_assignments")
    .select("id, user_id, role_id, division_id, category_id, expires_at");
  return data ?? [];
}