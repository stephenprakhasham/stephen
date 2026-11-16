"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DivisionId } from "@/lib/admin-auth";
import type { WarehouseRow } from "@/lib/inventory-types";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  division: DivisionId;
  warehouses: WarehouseRow[];
}

export function WarehouseManager({ division, warehouses }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/${division}/warehouses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code, contact_name: contactName, contact_phone: contactPhone }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage("Warehouse created.");
      setShowForm(false);
      setName("");
      setCode("");
      setContactName("");
      setContactPhone("");
      router.refresh();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setShowForm(!showForm)} className="btn">
          {showForm ? "Cancel" : "+ Add Warehouse"}
        </button>
      </div>

      {message && (
        <div className="alert" style={{ marginBottom: "1rem", padding: "0.75rem", background: message.includes("error") || message.includes("failed") ? "#f8d7da" : "#d4edda", borderRadius: "4px" }}>
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: "#f9f9f9", padding: "1.5rem", marginBottom: "1.5rem", borderRadius: "8px" }}>
          <h2>New Warehouse</h2>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
            <label>Name: <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: "0.5rem" }} /></label>
            <label>Code: <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required style={{ width: "100%", padding: "0.5rem" }} /></label>
            <label>Contact Name: <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} /></label>
            <label>Contact Phone: <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} /></label>
          </div>
          <button type="submit" disabled={saving} className="btn" style={{ marginTop: "1rem" }}>
            {saving ? <><Spinner size={16} /> Saving...</> : "Create Warehouse"}
          </button>
        </form>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Name</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Code</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Contact</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Active</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((wh) => (
            <tr key={wh.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.5rem 0.75rem" }}>{wh.name}</td>
              <td style={{ padding: "0.5rem 0.75rem" }}>{wh.code}</td>
              <td style={{ padding: "0.5rem 0.75rem" }}>{wh.contact_name ?? "—"}</td>
              <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                <span className={wh.is_active ? "pill green" : "pill gray"}>{wh.is_active ? "Active" : "Inactive"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {warehouses.length === 0 && (
        <p style={{ padding: "2rem", textAlign: "center", color: "#999" }}>No warehouses configured.</p>
      )}
    </>
  );
}