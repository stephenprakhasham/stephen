import { requireSuperAdmin } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SuperSettingsPage() {
  await requireSuperAdmin();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("system_settings")
    .select("key, value, updated_at");

  const settings = (data ?? []).map(
    (s: { key: string; value: unknown; updated_at: string }) => ({
      key: s.key,
      value: s.value as Record<string, unknown>,
      updatedAt: s.updated_at,
    })
  );

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <p className="admin-eyebrow">Super Admin</p>
          <h1>System Settings</h1>
        </div>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}