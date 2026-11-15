"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AttributeDefinitionRow, CategoryRow } from "@/lib/catalogue";
import type { DivisionId } from "@/lib/admin-auth";

const FIELD_TYPES = ["text", "longtext", "number", "decimal", "dropdown", "multiselect", "checkbox", "date"];

export function AttributeManager({
  division,
  definitions,
  categories,
}: {
  division: DivisionId;
  definitions: AttributeDefinitionRow[];
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(definitions);
  const [f, setF] = useState({
    label: "",
    key: "",
    field_type: "text",
    category_id: "",
    required: false,
    public_display: true,
    variant_defining: false,
    searchable: false,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  function set(k: string, v: unknown) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!f.label.trim() || !f.key.trim()) {
      setMsg("Label and key are required.");
      return;
    }
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/${division}/attributes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...f,
        category_id: f.category_id || null,
        key: f.key.toLowerCase().replace(/\s+/g, "_"),
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setMsg(b.error || "Create failed.");
      return;
    }
    setF({ label: "", key: "", field_type: "text", category_id: "", required: false, public_display: true, variant_defining: false, searchable: false });
    const list = await fetch(`/api/admin/${division}/attributes`, { cache: "no-store" });
    if (list.ok) setRows(await list.json());
    router.refresh();
  }

  return (
    <>
      <form className="admin-section admin-form-card" onSubmit={create}>
        <h2>Define attribute</h2>
        <div className="admin-form-grid">
          <label className="field"><span>Label</span>
            <input value={f.label} onChange={(e) => set("label", e.target.value)} required /></label>
          <label className="field"><span>Key (internal)</span>
            <input value={f.key} onChange={(e) => set("key", e.target.value)} required placeholder="e.g. bluetooth_version" /></label>
          <label className="field"><span>Field type</span>
            <select value={f.field_type} onChange={(e) => set("field_type", e.target.value)}>
              {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select></label>
          <label className="field"><span>Category scope (optional)</span>
            <select value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>
              <option value="">— all categories —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></label>
        </div>
        <div className="admin-checks">
          <label><input type="checkbox" checked={f.required} onChange={(e) => set("required", e.target.checked)} /> Required</label>
          <label><input type="checkbox" checked={f.public_display} onChange={(e) => set("public_display", e.target.checked)} /> Public display</label>
          <label><input type="checkbox" checked={f.searchable} onChange={(e) => set("searchable", e.target.checked)} /> Searchable</label>
          <label><input type="checkbox" checked={f.variant_defining} onChange={(e) => set("variant_defining", e.target.checked)} /> Variant-defining</label>
        </div>
        <div className="admin-form-actions">
          <button className="btn gold" disabled={busy} type="submit">{busy ? "Saving…" : "Add attribute"}</button>
        </div>
        {msg && <p className="admin-muted">{msg}</p>}
      </form>

      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr><th>Label</th><th>Key</th><th>Type</th><th>Category</th><th>Flags</th></tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>{a.label}</td>
                <td>{a.key}</td>
                <td>{a.field_type}</td>
                <td>{categories.find((c) => c.id === a.category_id)?.name || "all"}</td>
                <td className="admin-muted">
                  {[a.required && "required", a.public_display && "public", a.searchable && "searchable", a.variant_defining && "variant"]
                    .filter(Boolean).join(", ") || "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="admin-muted">No attributes defined.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}