"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname === "/mobiles") return null;
  return (
    <footer className="footer">
      <div className="container footergrid">
        <div>
          <div className="brand">YAGA GROUP</div>
          <p>One group. Three business divisions.</p>
          <small>YAGA MOBILES · YAGA GOLD & FASHION · YAGA DIGITAL NEXUS</small>
        </div>
        <div>
          <p><Link href="/mobiles">YAGA MOBILES</Link></p>
          <p><Link href="/jewellery">YAGA GOLD & FASHION</Link></p>
          <p><Link href="/digital">YAGA DIGITAL NEXUS</Link></p>
          <small>© {new Date().getFullYear()} YAGA GROUP. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
}