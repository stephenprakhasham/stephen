"use client";

import { useState } from "react";

const WHATSAPP = "919787608569";

// OTP gate is DISABLED for now (localhost testing).
// When going live, set this to true to require the OTP login again.
const OTP_ENABLED = false;

const tiers = [
  { name: "Bronze", req: "Start here", color: "#CD7F32", bg: "#FBEFE2" },
  { name: "Silver", req: "Regular buyer", color: "#8A8D91", bg: "#F1F2F3" },
  { name: "Gold", req: "High volume", color: "#E0A500", bg: "#FDF6E3" },
  { name: "Platinum", req: "Distributor", color: "#5B6B7A", bg: "#EEF1F4" },
];

const products = [
  { name: "Fast Charging Cable (Type-C)", pack: "Pack of 10", moq: 10, bronze: 80, silver: 75, gold: 70, emoji: "🔌" },
  { name: "Wireless Neckband", pack: "Pack of 10", moq: 10, bronze: 180, silver: 170, gold: 160, emoji: "🎧" },
  { name: "Tempered Glass (Universal)", pack: "Pack of 50", moq: 50, bronze: 15, silver: 13, gold: 12, emoji: "🛡️" },
  { name: "Power Bank 10000mAh", pack: "Pack of 10", moq: 10, bronze: 450, silver: 430, gold: 410, emoji: "🔋" },
];

function waLink(msg: string) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
}

export default function WholesaleApp() {
  const [authed, setAuthed] = useState(OTP_ENABLED ? false : true);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSendOtp() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/wholesale/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP.");
        return;
      }
      setDevOtp(data.devOtp || "");
      setStep("otp");
    } catch (e: any) {
      setError(e?.message || "Failed to send OTP.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyOtp() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/wholesale/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid OTP.");
        return;
      }
      setAuthed(true);
    } catch (e: any) {
      setError(e?.message || "Invalid OTP.");
    } finally {
      setBusy(false);
    }
  }

  function onLogout() {
    setAuthed(false);
    setStep("phone");
    setPhone("");
    setCode("");
    setDevOtp("");
    setError("");
  }

  if (OTP_ENABLED && !authed) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(135deg,#1A1A2E,#2A2440 60%,#3A2A1E)",
          padding: 20,
        }}
      >
        <div
          style={{
            width: "min(440px,100%)",
            background: "#fff",
            borderRadius: 22,
            padding: 32,
            boxShadow: "0 24px 60px rgba(0,0,0,.3)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 6 }}>🏭</div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, color: "#1A1A2E" }}>
            YAGA Wholesale
          </h1>
          <p style={{ margin: "0 0 20px", color: "#716e68", fontSize: 14 }}>
            Dealer access only. Verify your mobile number to continue.
          </p>

          {step === "phone" ? (
            <>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#514650" }}>
                Mobile number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 97876 08569"
                inputMode="tel"
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  marginTop: 6,
                  borderRadius: 12,
                  border: "1px solid #d8c8d8",
                  fontSize: 15,
                }}
              />
              {error && <p style={{ color: "#c62828", fontSize: 13, marginTop: 8 }}>{error}</p>}
              <button
                onClick={onSendOtp}
                disabled={busy}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "14px",
                  borderRadius: 12,
                  border: 0,
                  background: "linear-gradient(110deg,#FF8A4C,#FF6B35)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? "Sending…" : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#514650" }}>
                Enter the 6-digit OTP for {phone}
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter OTP"
                inputMode="numeric"
                maxLength={6}
                style={{
                  width: "100%",
                  padding: "13px 14px",
                  marginTop: 6,
                  borderRadius: 12,
                  border: "1px solid #d8c8d8",
                  fontSize: 18,
                  letterSpacing: 4,
                  textAlign: "center",
                }}
              />
              {devOtp && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#FFF4D6",
                    border: "1px solid #F0D48A",
                    color: "#7a5a00",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  🔑 Test mode — your OTP is <b style={{ fontSize: 16, letterSpacing: 2 }}>{devOtp}</b>
                </div>
              )}
              {error && <p style={{ color: "#c62828", fontSize: 13, marginTop: 8 }}>{error}</p>}
              <button
                onClick={onVerifyOtp}
                disabled={busy}
                style={{
                  width: "100%",
                  marginTop: 16,
                  padding: "14px",
                  borderRadius: 12,
                  border: 0,
                  background: "linear-gradient(110deg,#FF8A4C,#FF6B35)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {busy ? "Verifying…" : "Verify & Continue"}
              </button>
              <button
                onClick={() => {
                  setStep("phone");
                  setCode("");
                  setDevOtp("");
                  setError("");
                }}
                style={{
                  width: "100%",
                  marginTop: 10,
                  padding: "8px",
                  border: 0,
                  background: "none",
                  color: "#8a7f86",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Change number
              </button>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "#F8F5EF", color: "#1A1A2E", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px clamp(16px,4vw,40px)",
          background: "#1A1A2E",
          color: "#fff",
        }}
      >
        <b>🏭 YAGA WHOLESALE</b>
        {OTP_ENABLED && (
          <button
            onClick={onLogout}
            style={{
              border: "1px solid rgba(255,255,255,.3)",
              background: "transparent",
              color: "#fff",
              borderRadius: 999,
              padding: "8px 14px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        )}
      </div>

      <section
        style={{
          background: "linear-gradient(135deg,#1A1A2E 0%,#2A2440 55%,#3A2A1E 100%)",
          color: "#fff",
          padding: "56px 0 48px",
        }}
      >
        <div className="container">
          <span style={{ color: "#FF8A4C", fontWeight: 800, letterSpacing: ".18em", fontSize: 12 }}>
            YAGA MOBILES · B2B
          </span>
          <h1
            style={{
              fontSize: "clamp(30px,5vw,52px)",
              lineHeight: 1.05,
              letterSpacing: "-.03em",
              margin: "14px 0 12px",
              maxWidth: 760,
              fontWeight: 900,
            }}
          >
            Wholesale prices for retailers &amp; dealers
          </h1>
          <p style={{ maxWidth: 620, color: "#C9C4D6", lineHeight: 1.7, fontSize: 17 }}>
            Bulk mobile accessories at dealer-friendly rates. Tier pricing, low MOQ and fast stock.
          </p>
          <p style={{ marginTop: 18, fontSize: 13, color: "#9A94AC" }}>
            Demo catalog · Full wholesale store coming soon.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="sectionhead">
            <div>
              <span className="eyebrow">Dealer tiers</span>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", margin: "8px 0" }}>
                Better price as you grow
              </h2>
            </div>
          </div>
          <div className="division-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            {tiers.map((t) => (
              <div
                key={t.name}
                style={{ background: "#fff", border: "1px solid #ECE6DC", borderRadius: 18, padding: 22, boxShadow: "0 10px 30px rgba(43,31,45,.06)" }}
              >
                <span style={{ padding: "5px 12px", borderRadius: 999, background: t.bg, color: t.color, fontWeight: 800, fontSize: 13 }}>
                  {t.name}
                </span>
                <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>{t.req}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft" style={{ background: "#F1ECE3" }}>
        <div className="container">
          <div className="sectionhead">
            <div>
              <span className="eyebrow">Sample catalog</span>
              <h2 style={{ fontSize: "clamp(24px,3.5vw,36px)", margin: "8px 0" }}>
                Wholesale price list
              </h2>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 18 }}>
            {products.map((p) => (
              <div
                key={p.name}
                style={{ background: "#fff", border: "1px solid #ECE6DC", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", boxShadow: "0 10px 30px rgba(43,31,45,.06)" }}
              >
                <div style={{ fontSize: 34, marginBottom: 8 }}>{p.emoji}</div>
                <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800 }}>{p.name}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>{p.pack} · MOQ {p.moq}</p>
                <div style={{ marginTop: 14, display: "grid", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#CD7F32", fontWeight: 700 }}>Bronze</span><b>₹{p.bronze}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#8A8D91", fontWeight: 700 }}>Silver</span><b>₹{p.silver}</b>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#E0A500", fontWeight: 700 }}>Gold</span><b>₹{p.gold}</b>
                  </div>
                </div>
                <a
                  href={waLink(`Hi YAGA WHOLESALE, I want to order ${p.name} (${p.pack}).`)}
                  target="_blank"
                  rel="noopener"
                  className="btn"
                  style={{ marginTop: 16, background: "linear-gradient(110deg,#FF8A4C,#FF6B35)", color: "#fff", fontWeight: 800, fontSize: 13 }}
                >
                  Enquire
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div
            style={{
              background: "linear-gradient(120deg,#FFF3E9,#FFE7D6)",
              border: "1px solid #F5D6C0",
              borderRadius: 22,
              padding: "clamp(24px,4vw,44px)",
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "clamp(22px,3vw,32px)" }}>Become a YAGA dealer</h2>
              <p className="muted" style={{ margin: "8px 0 0" }}>
                Get your tier pricing, credit terms and priority stock.
              </p>
            </div>
            <a
              href={waLink("Hi YAGA WHOLESALE, I want to become a dealer.")}
              target="_blank"
              rel="noopener"
              className="btn"
              style={{ background: "linear-gradient(110deg,#FF8A4C,#FF6B35)", color: "#fff", fontWeight: 800 }}
            >
              💬 Join as dealer
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}