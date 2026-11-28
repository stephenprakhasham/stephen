import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YagaDigiNexus | Grow Your Business. Reach More Customers.",
  description:
    "Creative digital marketing, AI-powered promotional videos, social media management, website development, and advertising solutions for growing businesses.",
};

export default function DigitalMarketingPage() {
  return (
    <iframe
      src="/digital-marketing/index.html"
      title="YagaDigiNexus"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
        display: "block",
        zIndex: 9999,
        background: "#0d1221",
      }}
    />
  );
}