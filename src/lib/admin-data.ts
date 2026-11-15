import { requireSuperAdmin } from "@/lib/admin-auth";
import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase-server";
import { writeAudit } from "@/lib/audit";
import { createAuthUserDirect, deleteAuthUserDirect, isDbConfigured } from "@/lib/supabase-db";

export const PROFILE_ROLES = [
  "super_admin",
  "admin",
  "staff",
  "customer",
] as const;

export type ProfileRole = (typeof PROFILE_ROLES)[number];

export interface AdminUserRow {
  id: string;
  email: string;
  role: string;
  fullName: string | null;
  createdAt: string;
  lastSignIn: string | null;
  divisionIds: string[];
}

export interface CreateAdminUserInput {
  email: string;
  password: string;
  fullName?: string;
  /** profiles.role value; defaults to "staff". */
  role?: string;
  /** Optional roles.id to assign after creation. */
  roleId?: string | null;
  /** Optional division to grant (user_division_access). */
  divisionId?: string | null;
}

export interface CreateAdminUserResult {
  user: AdminUserRow;
  divisionGranted: boolean;
  roleAssigned: boolean;
}

function normalizeProfileRole(role: string | undefined): ProfileRole {
  return (PROFILE_ROLES as readonly string[]).includes(role ?? "")
    ? (role as ProfileRole)
    : "staff";
}

/**
 * List all admin users joined with their profile role (super admin only).
 * Prefers the service-role client (needed to enumerate auth.users emails);
 * falls back to profile rows only when SUPABASE_SERVICE_ROLE_KEY is absent.
 */
export async function listAdminUsers(): Promise<AdminUserRow[]> {
  await requireSuperAdmin();

  const supabase = await createSupabaseServerClient();
  const { data: profiles } = await supabase
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

  const divisionRows = await supabase
    .from("user_division_access")
    .select("user_id, division_id");
  const divisionMap = new Map<string, string[]>();
  for (const d of divisionRows.data ?? []) {
    const list = divisionMap.get(d.user_id) ?? [];
    list.push(d.division_id);
    divisionMap.set(d.user_id, list);
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // No service role: return profiles without auth emails.
    return Array.from(profileMap.entries()).map(([id, prof]) => ({
      id,
      email: "",
      role: prof.role,
      fullName: prof.fullName,
      createdAt: prof.createdAt,
      lastSignIn: null,
      divisionIds: divisionMap.get(id) ?? [],
    }));
  }

  const svc = createSupabaseServiceClient();

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
        divisionIds: divisionMap.get(u.id) ?? [],
      });
    }
    if (data.users.length < perPage) break;
    page += 1;
  }
  return users;
}

/**
 * Create a new auth user + profile row (super admin only).
 * Prefers SUPABASE_SERVICE_ROLE_KEY (auth.admin.createUser). When that is
 * absent, falls back to a direct Postgres insert (SUPABASE_DB_PASSWORD), which
 * hashes the password with pgcrypto bcrypt and marks the email confirmed.
 */
export async function createAdminUser(
  input: CreateAdminUserInput
): Promise<CreateAdminUserResult> {
  const ctx = await requireSuperAdmin();

  const email = (input.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email address is required.");
  }
  if (!input.password || input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const role = normalizeProfileRole(input.role);

  const useServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const useDirectDb = !useServiceRole && isDbConfigured();

  if (!useServiceRole && !useDirectDb) {
    throw new Error(
      "User creation is not configured. Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_DB_PASSWORD to .env.local and restart the server."
    );
  }

  let userId: string;
  let createdAt: string;

  if (useServiceRole) {
    const svc = createSupabaseServiceClient();
    const { data: created, error: createError } = await svc.auth.admin.createUser(
      {
        email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          full_name: (input.fullName ?? "").trim() || null,
        },
      }
    );
    if (createError || !created?.user) {
      throw new Error(createError?.message ?? "Failed to create the user.");
    }
    userId = created.user.id;
    createdAt = created.user.created_at;
  } else {
    const created = await createAuthUserDirect({
      email,
      password: input.password,
      fullName: (input.fullName ?? "").trim() || null,
    });
    userId = created.id;
    createdAt = created.createdAt;
  }

  const db = useServiceRole
    ? createSupabaseServiceClient()
    : await createSupabaseServerClient();

  const { error: profileError } = await db
    .from("profiles")
    .upsert(
      {
        id: userId,
        full_name: (input.fullName ?? "").trim() || null,
        role,
      },
      { onConflict: "id" }
    );
  if (profileError) {
    throw new Error(profileError.message);
  }

  let divisionGranted = false;
  if (input.divisionId) {
    const { error: divisionError } = await db
      .from("user_division_access")
      .upsert(
        { user_id: userId, division_id: input.divisionId },
        { onConflict: "user_id,division_id" }
      );
    if (divisionError) throw new Error(divisionError.message);
    divisionGranted = true;
  }

  let roleAssigned = false;
  if (input.roleId) {
    const { data: roleRow, error: roleError } = await db
      .from("roles")
      .select("id, division_id")
      .eq("id", input.roleId)
      .maybeSingle();
    if (roleError) throw new Error(roleError.message);
    if (!roleRow) throw new Error("Role not found.");

    const { error: assignmentError } = await db
      .from("user_role_assignments")
      .upsert(
        {
          user_id: userId,
          role_id: roleRow.id,
          division_id:
            input.divisionId ?? (roleRow.division_id as string | null) ?? null,
          category_id: null,
        },
        { onConflict: "user_id,role_id,division_id,category_id" }
      );
    if (assignmentError) throw new Error(assignmentError.message);
    roleAssigned = true;
  }

  await writeAudit({
    actorUserId: ctx.user.id,
    actorEmail: ctx.user.email ?? null,
    action: "create",
    entityType: "auth.users",
    entityId: userId,
    divisionId: input.divisionId ?? null,
    newValues: {
      email,
      profile_role: role,
      full_name: (input.fullName ?? "").trim() || null,
      role_id: input.roleId ?? null,
    },
  });

  return {
    user: {
      id: userId,
      email,
      role,
      fullName: (input.fullName ?? "").trim() || null,
      createdAt,
      lastSignIn: null,
      divisionIds: input.divisionId ? [input.divisionId] : [],
    },
    divisionGranted,
    roleAssigned,
  };
}

/**
 * Delete an auth user and all dependent rows (super admin only).
 * The signed-in super admin cannot delete their own account.
 */
export async function deleteAdminUser(userId: string): Promise<void> {
  const ctx = await requireSuperAdmin();
  if (!userId) throw new Error("A user id is required.");
  if (userId === ctx.user.id) {
    throw new Error("You cannot delete your own account.");
  }

  const useServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const useDirectDb = !useServiceRole && isDbConfigured();
  if (!useServiceRole && !useDirectDb) {
    throw new Error(
      "User deletion is not configured. Add SUPABASE_SERVICE_ROLE_KEY or SUPABASE_DB_PASSWORD to .env.local and restart the server."
    );
  }

  if (useServiceRole) {
    const svc = createSupabaseServiceClient();
    const { error } = await svc.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);
  } else {
    const deleted = await deleteAuthUserDirect(userId);
    if (!deleted) throw new Error("User not found.");
  }

  await writeAudit({
    actorUserId: ctx.user.id,
    actorEmail: ctx.user.email ?? null,
    action: "delete",
    entityType: "auth.users",
    entityId: userId,
    newValues: null,
  });
}

export interface UpdateAdminUserInput {
  fullName?: string | null;
  role?: string;
  /** Replaces the user's division access. Omit to leave unchanged. */
  divisionId?: string | null;
}

/**
 * Update a user's profile name, profile role, and division scope
 * (super admin only). A super admin cannot remove their own super_admin role.
 */
export async function updateAdminUser(
  userId: string,
  input: UpdateAdminUserInput
): Promise<void> {
  const ctx = await requireSuperAdmin();
  if (!userId) throw new Error("A user id is required.");

  const role =
    input.role !== undefined ? normalizeProfileRole(input.role) : undefined;

  if (userId === ctx.user.id && role && role !== "super_admin") {
    throw new Error("You cannot remove your own super_admin role.");
  }

  const useServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const db = useServiceRole
    ? createSupabaseServiceClient()
    : await createSupabaseServerClient();

  const patch: { full_name?: string | null; role?: string } = {};
  if (input.fullName !== undefined) {
    patch.full_name = input.fullName?.trim() || null;
  }
  if (role) patch.role = role;

  if (Object.keys(patch).length > 0) {
    const { error } = await db.from("profiles").update(patch).eq("id", userId);
    if (error) throw new Error(error.message);
  }

  if (input.divisionId !== undefined) {
    const { error: deleteError } = await db
      .from("user_division_access")
      .delete()
      .eq("user_id", userId);
    if (deleteError) throw new Error(deleteError.message);

    if (input.divisionId) {
      const { error: insertError } = await db
        .from("user_division_access")
        .insert({ user_id: userId, division_id: input.divisionId });
      if (insertError) throw new Error(insertError.message);
    }
  }

  await writeAudit({
    actorUserId: ctx.user.id,
    actorEmail: ctx.user.email ?? null,
    action: "update",
    entityType: "profiles",
    entityId: userId,
    newValues: {
      full_name: input.fullName ?? undefined,
      role: role ?? undefined,
      division_id: input.divisionId ?? undefined,
    },
  });
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