"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MiniCart } from "@/components/cart/MiniCart";

function MobilesHeader() {
  return (
    <>
      <div className="topline">YAGA MOBILES · PREMIUM MOBILE ACCESSORIES · ORDER ON WHATSAPP</div>
      <header className="ym-header">
        <div className="container ym-nav">
          <Link className="ym-brand" href="/mobiles">
            <span className="ym-brand-barcode" aria-hidden="true" />
            <span className="ym-brand-text">YAGA <em>MOBILES</em></span>
          </Link>
          <nav className="ym-links">
            <Link href="/mobiles">Shop</Link>
            <Link href="/mobiles#catalogue">Categories</Link>
            <Link href="/yaga-hot-deals">🔥 Hot Deals</Link>
            <Link href="/mobiles#faq">FAQ</Link>
          </nav>
          <div className="ym-nav-cta">
            <a
              className="ym-wa-btn"
              href="https://wa.me/919787608569?text=Hello%20YAGA%20MOBILES!%20I%20want%20to%20order."
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ym-wa-dot" />
              Order on WhatsApp
            </a>
            <MiniCart />
          </div>
        </div>
      </header>
    </>
  );
}

export default function Header() {
  const pathname = usePathname();
  if (pathname === "/mobiles") {
    return <MobilesHeader />;
  }
  return (
    <>
      <div className="topline">YAGA GROUP · THREE DIVISIONS · ONE TRUSTED GROUP</div>
      <header className="header">
        <div className="container nav">
          <Link className="brand" href="/">YAGA <span>GROUP</span></Link>
          <nav className="navlinks">
            <Link href="/mobiles">Mobiles</Link>
            <Link href="/yaga-hot-deals">🔥 Hot Deals</Link>
            <Link href="/jewellery">Gold & Fashion</Link>
            <Link href="/digital">Digital Nexus</Link>
            <Link href="/#about">About Group</Link>
          </nav>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link className="navcta" href="/contact">Contact us</Link>
            <MiniCart />
          </div>
        </div>
      </header>
    </>
  );
}