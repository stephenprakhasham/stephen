"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRow } from "@/lib/catalogue";
import type { DivisionId } from "@/lib/admin-auth";

export function CategoryManager({
  division,
  categories,
}: {
  division: DivisionId;
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(categories);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/${division}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, parent_id: parentId || null }),
    });
    setBusy(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setMsg(b.error || "Create failed.");
      return;
    }
    setName("");
    setParentId("");
    const list = await fetch(`/api/admin/${division}/categories`, { cache: "no-store" });
    if (list.ok) setRows(await list.json());
    router.refresh();
  }

  // Build a simple indented tree from flat rows.
  const roots = rows.filter((r) => !r.parent_id);
  const childrenOf = (id: string) => rows.filter((r) => r.parent_id === id);

  function renderRow(r: CategoryRow, depth: number) {
    return (
      <div key={r.id}>
        <div className="admin-tree-row" style={{ paddingLeft: depth * 20 + 8 }}>
          <span className="admin-tree-name">{r.name}</span>
          <span className="pill pill-muted">{r.slug}</span>
        </div>
        {childrenOf(r.id).map((c) => renderRow(c, depth + 1))}
      </div>
    );
  }

  return (
    <>
      <form className="admin-section admin-form-card" onSubmit={create}>
        <h2>Add category</h2>
        <div className="admin-form-grid">
          <label className="field"><span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label className="field"><span>Parent (optional)</span>
            <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
              <option value="">— top level —</option>
              {rows.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select></label>
        </div>
        <div className="admin-form-actions">
          <button className="btn gold" disabled={busy} type="submit">{busy ? "Adding…" : "Add category"}</button>
        </div>
        {msg && <p className="admin-muted">{msg}</p>}
      </form>

      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr><th>Category</th><th>Slug</th><th>Active</th></tr>
          </thead>
          <tbody>
            {roots.map((r) => renderRow(r, 0))}
            {roots.length === 0 && (
              <tr><td colSpan={3} className="admin-muted">No categories yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}