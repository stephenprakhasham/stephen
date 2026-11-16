"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/Spinner";

interface SettingRow {
  key: string;
  value: Record<string, unknown>;
  updatedAt: string;
}

export function SettingsForm({ settings }: { settings: SettingRow[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {};
    for (const s of settings) d[s.key] = JSON.stringify(s.value, null, 2);
    return d;
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function save(key: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(draft[key]);
    } catch {
      setMsg(`${key}: invalid JSON.`);
      return;
    }
    setBusy(key);
    setMsg("");
    const res = await fetch("/api/admin/super/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: parsed }),
    });
    setBusy(null);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMsg(body.error || "Save failed.");
      return;
    }
    setMsg(`${key} saved.`);
    router.refresh();
  }

  if (settings.length === 0) {
    return <p className="admin-muted">No settings defined.</p>;
  }

  return (
    <div className="admin-settings-list">
      {settings.map((s) => (
        <section key={s.key} className="admin-section">
          <div className="admin-page-head">
            <h2>{s.key}</h2>
            <span className="admin-muted">
              updated {new Date(s.updatedAt).toLocaleString("en-IN")}
            </span>
          </div>
          <textarea
            className="admin-textarea"
            rows={Math.min(12, (draft[s.key] || "").split("\n").length + 2)}
            value={draft[s.key] ?? ""}
            onChange={(e) =>
              setDraft((d) => ({ ...d, [s.key]: e.target.value }))
            }
            spellCheck={false}
          />
          <button
            className="btn gold"
            onClick={() => save(s.key)}
            disabled={busy === s.key}
          >
            {busy === s.key ? <><Spinner size={16} /> Saving…</> : "Save"}
          </button>
        </section>
      ))}
      {msg && <p className="admin-muted">{msg}</p>}
    </div>
  );
}