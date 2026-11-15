import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type DivisionId = "mobiles" | "jewellery" | "digital";
export type RoleName = "super_admin" | "admin" | "staff" | "customer";

export interface AdminProfile {
  id: string;
  role: RoleName;
  full_name: string | null;
}

export interface EffectivePermission {
  permission_key: string;
  module: string;
  action: string;
}

export interface AuthContext {
  user: User;
  profile: AdminProfile;
  divisions: DivisionId[];
  categories: string[];
  modules: string[];
  permissions: EffectivePermission[];
}

/** Server-side only: reads the signed-in user + profile + scopes. */
export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  const divisionRows = await supabase
    .from("user_division_access")
    .select("division_id")
    .eq("user_id", user.id);
  const categoryRows = await supabase
    .from("user_category_access")
    .select("category_id")
    .eq("user_id", user.id);
  const moduleRows = await supabase
    .from("user_module_access")
    .select("module")
    .eq("user_id", user.id);
  const permRows = await supabase.rpc("effective_permissions", {
    uid: user.id,
  });

  return {
    user,
    profile: profile as AdminProfile,
    divisions: (divisionRows.data ?? []).map(
      (r: { division_id: DivisionId }) => r.division_id
    ),
    categories: (categoryRows.data ?? []).map(
      (r: { category_id: string }) => r.category_id
    ),
    modules: (moduleRows.data ?? []).map((r: { module: string }) => r.module),
    permissions: (permRows.data ?? []) as EffectivePermission[],
  };
}

export function isSuperAdmin(ctx: AuthContext | null): boolean {
  return ctx?.profile.role === "super_admin";
}

export function isGroupAdmin(ctx: AuthContext | null): boolean {
  return ctx?.profile.role === "super_admin" || ctx?.profile.role === "admin";
}

export function canAccessDivision(
  ctx: AuthContext | null,
  division: DivisionId
): boolean {
  if (!ctx) return false;
  if (isSuperAdmin(ctx) || isGroupAdmin(ctx)) return true;
  return ctx.divisions.includes(division);
}

export function canAccessCategory(
  ctx: AuthContext | null,
  categoryId: string
): boolean {
  if (!ctx) return false;
  if (isSuperAdmin(ctx) || isGroupAdmin(ctx)) return true;
  return ctx.categories.includes(categoryId);
}

export function canAccessModule(
  ctx: AuthContext | null,
  module: string
): boolean {
  if (!ctx) return false;
  if (isSuperAdmin(ctx)) return true;
  return ctx.modules.includes(module);
}

export function hasPermission(
  ctx: AuthContext | null,
  permissionKey: string
): boolean {
  if (!ctx) return false;
  if (isSuperAdmin(ctx)) return true;
  return ctx.permissions.some((p) => p.permission_key === permissionKey);
}

/** Throwing guards for route handlers / server actions. */
export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw new AuthError("Authentication required.", 401);
  return ctx;
}

export async function requireSuperAdmin(): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!isSuperAdmin(ctx)) throw new AuthError("Super admin required.", 403);
  return ctx;
}

export async function requireDivision(
  division: DivisionId
): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!canAccessDivision(ctx, division))
    throw new AuthError(`Access to ${division} denied.`, 403);
  return ctx;
}

export async function requirePermission(
  permissionKey: string
): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!hasPermission(ctx, permissionKey))
    throw new AuthError(`Permission '${permissionKey}' required.`, 403);
  return ctx;
}

/**
 * Resolve the raw permission list. The permissions table is readable by any
 * authenticated user (RLS), so the caller-scoped client is sufficient.
 */
export async function listAllPermissions(): Promise<EffectivePermission[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("permissions")
    .select("key, module, action");
  return (data ?? []).map(
    (p: { key: string; module: string; action: string }) => ({
      permission_key: p.key,
      module: p.module,
      action: p.action,
    })
  );
}