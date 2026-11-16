"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductRow, CategoryRow, BrandRow } from "@/lib/catalogue";
import type { DivisionId } from "@/lib/admin-auth";
import { Spinner } from "@/components/ui/Spinner";

const STATUSES = ["draft", "pending", "published", "unpublished", "archived"] as const;

interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string | null;
  is_main: boolean;
  sort_order: number;
  is_360: boolean;
}

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
    const data = await res.json();
    setMsg("Saved.");
    setCreating(false);
    if (!id && data.id) {
      // New product created - switch to edit mode to show media gallery
      setEditing(data);
    } else {
      setEditing(null);
    }
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
        <>
          <ProductForm
            division={division}
            categories={categories}
            brands={brands}
            initial={editing}
            onCancel={() => setEditing(null)}
            onSave={(payload) => save(payload, editing.id)}
            busy={busy}
          />
          <ProductImageGallery
            division={division}
            productId={editing.id}
            productName={editing.name}
          />
        </>
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
      {!initial && (
        <p className="admin-muted" style={{ marginBottom: 12, fontSize: 13 }}>
          Fill in the product details and click Save. After saving, you can upload images, 360° frames, and videos.
        </p>
      )}
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
        <button className="btn gold" disabled={busy} type="submit">
          {busy ? <><Spinner size={16} /> Saving…</> : "Save"}
        </button>
        <button className="btn outline" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

function ProductImageGallery({
  division,
  productId,
  productName,
}: {
  division: DivisionId;
  productId: string;
  productName: string;
}) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [videos, setVideos] = useState<{ id: string; url: string; title: string | null; is_feature: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch(`/api/admin/${division}/products/${productId}/images`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      setImages(data.images ?? []);
      setVideos(data.videos ?? []);
    }
  }

  useEffect(() => {
    load();
  }, [productId]);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setMsg("");
    const nextOrder = images.length;
    let ok = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const is360 = file.name.startsWith("360_");
      const isVideo = file.type.startsWith("video/");

      if (isVideo) {
        // Upload video
        const form = new FormData();
        form.append("file", file);
        form.append("is_feature", i === 0 ? "true" : "false");
        const res = await fetch(
          `/api/admin/${division}/products/${productId}/videos`,
          { method: "POST", body: form }
        );
        if (res.ok) ok++;
        else {
          const b = await res.json().catch(() => ({}));
          setMsg(b.error || "Video upload failed.");
        }
      } else {
        // Upload image (regular or 360 frame)
        const form = new FormData();
        form.append("file", file);
        form.append("is_main", images.length === 0 && i === 0 && !is360 ? "true" : "false");
        form.append("sort_order", is360 ? String(100 + i) : String(nextOrder + i));
        form.append("is_360", is360 ? "true" : "false");
        const res = await fetch(
          `/api/admin/${division}/products/${productId}/images`,
          { method: "POST", body: form }
        );
        if (res.ok) ok++;
        else {
          const b = await res.json().catch(() => ({}));
          setMsg(b.error || "Image upload failed.");
        }
      }
    }
    setUploading(false);
    e.target.value = "";
    if (ok) await load();
  }

  async function setMain(id: string) {
    setBusy(true);
    await fetch(`/api/admin/${division}/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_id: id, is_main: true }),
    });
    setBusy(false);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this image?")) return;
    setBusy(true);
    await fetch(
      `/api/admin/${division}/products/${productId}/images?image_id=${id}`,
      { method: "DELETE" }
    );
    setBusy(false);
    await load();
  }

  async function saveAlt(id: string, alt: string) {
    await fetch(`/api/admin/${division}/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_id: id, alt: alt || null }),
    });
  }

  const regularImages = images.filter((img) => !img.is_360 && img.sort_order < 100);
  const frames360 = images.filter((img) => img.is_360 || img.sort_order >= 100);

  return (
    <section className="admin-section admin-form-card">
      <h2>Media — {productName}</h2>
      <div className="admin-form-actions">
        <label className="btn gold" style={{ cursor: uploading ? "wait" : "pointer" }}>
          {uploading ? "Uploading…" : "+ Upload images/videos/360°"}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            hidden
            onChange={upload}
            disabled={uploading}
          />
        </label>
      </div>
      {msg && <p className="admin-muted">{msg}</p>}

      <div style={{ marginTop: 16 }}>
        <h3 style={{ fontSize: 14, marginBottom: 8 }}>Regular Images ({regularImages.length})</h3>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
          Upload product photos. First image will be the main image.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {regularImages.map((img) => (
            <div
              key={img.id}
              style={{
                width: 160,
                border: img.is_main ? "2px solid #b18b50" : "1px solid #ddd",
                borderRadius: 8,
                padding: 8,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ""}
                style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 4 }}
              />
              <input
                defaultValue={img.alt ?? ""}
                placeholder="Alt text"
                onBlur={(e) => saveAlt(img.id, e.target.value)}
                style={{ width: "100%", marginTop: 6, padding: "4px 6px", fontSize: 12 }}
              />
              <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                {!img.is_main && (
                  <button
                    className="btn outline"
                    style={{ padding: "4px 8px", fontSize: 11 }}
                    onClick={() => setMain(img.id)}
                    disabled={busy}
                  >
                    Set main
                  </button>
                )}
                {img.is_main && (
                  <span className="pill pill-published" style={{ fontSize: 10 }}>Main</span>
                )}
                <button
                  className="btn outline"
                  style={{ padding: "4px 8px", fontSize: 11, color: "#a11", borderColor: "#e3b6b6" }}
                  onClick={() => remove(img.id)}
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {regularImages.length === 0 && !uploading && (
            <p className="admin-muted">No images yet. Upload product photos.</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 14, marginBottom: 8 }}>360° Frames ({frames360.length})</h3>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
          Upload frames for 360° view. Name files with "360_" prefix (e.g., 360_01.jpg, 360_02.jpg).
          Minimum 36 frames recommended for smooth rotation.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {frames360.slice(0, 12).map((img) => (
            <div
              key={img.id}
              style={{
                width: 80,
                border: "1px solid #ddd",
                borderRadius: 6,
                padding: 4,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ""}
                style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 3 }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "#888" }}>#{img.sort_order - 99}</span>
                <button
                  className="btn outline"
                  style={{ padding: "2px 6px", fontSize: 10, color: "#a11", borderColor: "#e3b6b6" }}
                  onClick={() => remove(img.id)}
                  disabled={busy}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {frames360.length > 12 && (
            <div style={{ width: 80, display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: 12 }}>
              +{frames360.length - 12} more
            </div>
          )}
          {frames360.length === 0 && !uploading && (
            <p className="admin-muted">No 360° frames yet. Upload frames with "360_" prefix.</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 14, marginBottom: 8 }}>Videos ({videos.length})</h3>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>
          Upload product videos. First video will be the featured video.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {videos.map((vid) => (
            <div
              key={vid.id}
              style={{
                width: 200,
                border: vid.is_feature ? "2px solid #b18b50" : "1px solid #ddd",
                borderRadius: 8,
                padding: 8,
              }}
            >
              <video
                src={vid.url}
                style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 4 }}
                muted
              />
              {vid.is_feature && (
                <span className="pill pill-published" style={{ fontSize: 10, marginTop: 4 }}>Featured</span>
              )}
            </div>
          ))}
          {videos.length === 0 && !uploading && (
            <p className="admin-muted">No videos yet. Upload product videos.</p>
          )}
        </div>
      </div>
    </section>
  );
}