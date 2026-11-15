import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YAGA GROUP | Three Business Divisions",
  description:
    "YAGA MOBILES, YAGA GOLD & FASHION and YAGA DIGITAL NEXUS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}