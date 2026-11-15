"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductRow, CategoryRow, BrandRow } from "@/lib/catalogue";
import type { DivisionId } from "@/lib/admin-auth";

const STATUSES = ["draft", "pending", "published", "unpublished", "archived"] as const;

export function ProductManager({
  division,
  products,
  categories,
  brands,
}: {
  division: DivisionId;
  products: ProductRow[];
  categories: CategoryRow[];
  brands: BrandRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(products);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const filtered = useMemo(
    () => (statusFilter === "all" ? rows : rows.filter((r) => r.status === statusFilter)),
    [rows, statusFilter]
  );

  async function reload() {
    const res = await fetch(`/api/admin/${division}/products`, { cache: "no-store" });
    if (res.ok) setRows(await res.json());
    router.refresh();
  }

  async function save(payload: Record<string, unknown>, id?: string) {
    setBusy(true);
    setMsg("");
    const url = id
      ? `/api/admin/${division}/products/${id}`
      : `/api/admin/${division}/products`;
    const res = await fetch(url, {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setMsg(b.error || "Save failed.");
      return;
    }
    setMsg("Saved.");
    setCreating(false);
    setEditing(null);
    await reload();
  }

  async function archive(id: string) {
    if (!confirm("Archive this product? It will be hidden from the storefront.")) return;
    setBusy(true);
    await fetch(`/api/admin/${division}/products/${id}`, { method: "DELETE" });
    setBusy(false);
    setMsg("Archived.");
    await reload();
  }

  return (
    <>
      <div className="admin-toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn gold" onClick={() => { setCreating(true); setEditing(null); }}>
          + New product
        </button>
        <span className="admin-muted">{filtered.length} shown</span>
      </div>

      {msg && <p className="admin-muted">{msg}</p>}

      {creating && (
        <ProductForm
          division={division}
          categories={categories}
          brands={brands}
          onCancel={() => setCreating(false)}
          onSave={save}
          busy={busy}
        />
      )}

      {editing && (
        <ProductForm
          division={division}
          categories={categories}
          brands={brands}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={(payload) => save(payload, editing.id)}
          busy={busy}
        />
      )}

      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Retail</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku || "—"}</td>
                <td>{categories.find((c) => c.id === p.category_id)?.name || "—"}</td>
                <td>{p.retail_price != null ? `₹${p.retail_price}` : "—"}</td>
                <td>{p.stock_quantity}</td>
                <td><span className={`pill pill-${p.status}`}>{p.status}</span></td>
                <td>
                  <button className="btn outline" onClick={() => { setEditing(p); setCreating(false); }}>
                    Edit
                  </button>
                  <button className="btn outline" onClick={() => archive(p.id)}>
                    Archive
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="admin-muted">No products.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProductForm({
  division,
  categories,
  brands,
  initial,
  onSave,
  onCancel,
  busy,
}: {
  division: DivisionId;
  categories: CategoryRow[];
  brands: BrandRow[];
  initial?: ProductRow;
  onSave: (payload: Record<string, unknown>) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    category_id: initial?.category_id ?? "",
    brand_id: initial?.brand_id ?? "",
    sku: initial?.sku ?? "",
    short_description: initial?.short_description ?? "",
    retail_price: initial?.retail_price?.toString() ?? "",
    wholesale_price: initial?.wholesale_price?.toString() ?? "",
    cost_price: initial?.cost_price?.toString() ?? "",
    stock_quantity: initial?.stock_quantity?.toString() ?? "0",
    status: initial?.status ?? "draft",
  });

  function set(k: string, v: string) {
    setF((s) => ({ ...s, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      name: f.name,
      category_id: f.category_id || null,
      brand_id: f.brand_id || null,
      sku: f.sku || null,
      short_description: f.short_description || null,
      retail_price: f.retail_price ? Number(f.retail_price) : null,
      wholesale_price: f.wholesale_price ? Number(f.wholesale_price) : null,
      cost_price: f.cost_price ? Number(f.cost_price) : null,
      stock_quantity: Number(f.stock_quantity) || 0,
      status: f.status,
    });
  }

  return (
    <form className="admin-section admin-form-card" onSubmit={submit}>
      <h2>{initial ? "Edit product" : "New product"}</h2>
      <div className="admin-form-grid">
        <label className="field"><span>Name</span>
          <input value={f.name} onChange={(e) => set("name", e.target.value)} required /></label>
        <label className="field"><span>SKU</span>
          <input value={f.sku} onChange={(e) => set("sku", e.target.value)} /></label>
        <label className="field"><span>Category</span>
          <select value={f.category_id} onChange={(e) => set("category_id", e.target.value)}>
            <option value="">— none —</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
        <label className="field"><span>Brand</span>
          <select value={f.brand_id} onChange={(e) => set("brand_id", e.target.value)}>
            <option value="">— none —</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select></label>
        <label className="field"><span>Retail price (₹)</span>
          <input type="number" step="0.01" value={f.retail_price} onChange={(e) => set("retail_price", e.target.value)} /></label>
        <label className="field"><span>Wholesale price (₹)</span>
          <input type="number" step="0.01" value={f.wholesale_price} onChange={(e) => set("wholesale_price", e.target.value)} /></label>
        <label className="field"><span>Cost price (₹)</span>
          <input type="number" step="0.01" value={f.cost_price} onChange={(e) => set("cost_price", e.target.value)} /></label>
        <label className="field"><span>Stock</span>
          <input type="number" value={f.stock_quantity} onChange={(e) => set("stock_quantity", e.target.value)} /></label>
        <label className="field"><span>Status</span>
          <select value={f.status} onChange={(e) => set("status", e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select></label>
        <label className="field admin-form-wide"><span>Short description</span>
          <textarea rows={2} value={f.short_description} onChange={(e) => set("short_description", e.target.value)} /></label>
      </div>
      <div className="admin-form-actions">
        <button className="btn gold" disabled={busy} type="submit">{busy ? "Saving…" : "Save"}</button>
        <button className="btn outline" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}