"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BrandRow } from "@/lib/catalogue";
import type { DivisionId } from "@/lib/admin-auth";

export function BrandManager({
  division,
  brands,
}: {
  division: DivisionId;
  brands: BrandRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(brands);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/${division}/brands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setMsg(b.error || "Create failed.");
      return;
    }
    setName("");
    const list = await fetch(`/api/admin/${division}/brands`, { cache: "no-store" });
    if (list.ok) setRows(await list.json());
    router.refresh();
  }

  return (
    <>
      <form className="admin-section admin-form-card" onSubmit={create}>
        <h2>Add brand</h2>
        <div className="admin-form-grid">
          <label className="field"><span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        </div>
        <div className="admin-form-actions">
          <button className="btn gold" disabled={busy} type="submit">{busy ? "Adding…" : "Add brand"}</button>
        </div>
        {msg && <p className="admin-muted">{msg}</p>}
      </form>

      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr><th>Brand</th><th>Slug</th><th>Website</th></tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.slug}</td>
                <td>{b.website || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={3} className="admin-muted">No brands yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}