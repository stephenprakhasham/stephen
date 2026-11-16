import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://yaga-group-website.vercel.app";
const SITE_NAME = "YAGA GROUP";
const SITE_DESCRIPTION = "YAGA GROUP - Three specialist divisions: YAGA MOBILES (mobile phones & accessories), YAGA GOLD & FASHION (jewellery & fashion), and YAGA DIGITAL NEXUS (digital marketing & technology services). Quality products, competitive prices, trusted service.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "YAGA GROUP | Mobile Phones, Jewellery & Digital Services",
    template: "%s | YAGA GROUP",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "YAGA GROUP",
    "YAGA MOBILES",
    "mobile phones",
    "smartphones",
    "mobile accessories",
    "chargers",
    "earphones",
    "YAGA GOLD FASHION",
    "jewellery",
    "fashion jewellery",
    "gold jewellery",
    "YAGA DIGITAL NEXUS",
    "digital marketing",
    "technology services",
    "web development",
    "SEO services",
  ],
  authors: [{ name: "YAGA GROUP" }],
  creator: "YAGA GROUP",
  publisher: "YAGA GROUP",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "YAGA GROUP | Mobile Phones, Jewellery & Digital Services",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: `${SITE_URL}/icon.svg`,
        width: 512,
        height: 512,
        alt: "YAGA GROUP Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YAGA GROUP | Mobile Phones, Jewellery & Digital Services",
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/icon.svg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: "shopping",
  classification: "E-commerce",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="theme-color" content="#b18b50" />
        <meta name="msapplication-TileColor" content="#b18b50" />
      </head>
      <body>{children}</body>
    </html>
  );
}