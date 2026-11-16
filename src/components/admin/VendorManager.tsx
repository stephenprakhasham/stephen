"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DivisionId } from "@/lib/admin-auth";
import type { VendorRow } from "@/lib/inventory-types";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  division: DivisionId;
  vendors: VendorRow[];
}

export function VendorManager({ division, vendors }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("net30");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/${division}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          contact_name: contactName,
          email,
          phone,
          gst_number: gstNumber,
          payment_terms: paymentTerms,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage("Vendor created.");
      setShowForm(false);
      setCompanyName("");
      setContactName("");
      setEmail("");
      setPhone("");
      setGstNumber("");
      setPaymentTerms("net30");
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
          {showForm ? "Cancel" : "+ Add Vendor"}
        </button>
      </div>

      {message && (
        <div className="alert" style={{ marginBottom: "1rem", padding: "0.75rem", background: message.includes("error") || message.includes("failed") ? "#f8d7da" : "#d4edda", borderRadius: "4px" }}>
          {message}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: "#f9f9f9", padding: "1.5rem", marginBottom: "1.5rem", borderRadius: "8px" }}>
          <h2>New Vendor</h2>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr" }}>
            <label>Company Name: <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ width: "100%", padding: "0.5rem" }} /></label>
            <label>Contact Name: <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} /></label>
            <label>Email: <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} /></label>
            <label>Phone: <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} /></label>
            <label>GST Number: <input type="text" value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} /></label>
            <label>Payment Terms: <input type="text" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} style={{ width: "100%", padding: "0.5rem" }} /></label>
          </div>
          <button type="submit" disabled={saving} className="btn" style={{ marginTop: "1rem" }}>
            {saving ? <><Spinner size={16} /> Saving...</> : "Create Vendor"}
          </button>
        </form>
      )}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Company</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Contact</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>GST</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Payment Terms</th>
            <th style={{ textAlign: "center", padding: "0.75rem" }}>Active</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((v) => (
            <tr key={v.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "0.5rem 0.75rem" }}>{v.company_name}</td>
              <td style={{ padding: "0.5rem 0.75rem" }}>{v.contact_name ?? "—"}</td>
              <td style={{ padding: "0.5rem 0.75rem" }}>{v.gst_number ?? "—"}</td>
              <td style={{ padding: "0.5rem 0.75rem" }}>{v.payment_terms}</td>
              <td style={{ padding: "0.5rem 0.75rem", textAlign: "center" }}>
                <span className={v.is_active ? "pill green" : "pill gray"}>{v.is_active ? "Active" : "Inactive"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {vendors.length === 0 && (
        <p style={{ padding: "2rem", textAlign: "center", color: "#999" }}>No vendors configured.</p>
      )}
    </>
  );
}