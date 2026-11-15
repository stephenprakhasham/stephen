"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { DivisionId, RoleName } from "@/lib/admin-auth";

const DIVISIONS: { id: DivisionId; label: string; short: string }[] = [
  { id: "mobiles", label: "YAGA MOBILES", short: "Mobiles" },
  { id: "jewellery", label: "YAGA GOLD & FASHION", short: "Jewellery" },
  { id: "digital", label: "YAGA DIGITAL NEXUS", short: "Digital" },
];

interface NavItem {
  href: string;
  label: string;
  icon: string;
  superOnly?: boolean;
  division?: DivisionId;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/super/users", label: "Users & Roles", icon: "◉", superOnly: true },
  { href: "/admin/super/audit", label: "Audit Logs", icon: "☰", superOnly: true },
  { href: "/admin/super/settings", label: "Settings", icon: "⚙", superOnly: true },
  // Mobiles
  { href: "/admin/mobiles/products", label: "Products", icon: "▤", division: "mobiles" },
  { href: "/admin/mobiles/categories", label: "Categories", icon: "▥", division: "mobiles" },
  { href: "/admin/mobiles/brands", label: "Brands", icon: "◇", division: "mobiles" },
  { href: "/admin/mobiles/attributes", label: "Attributes", icon: "≡", division: "mobiles" },
  // Jewellery
  { href: "/admin/jewellery/products", label: "Products", icon: "▤", division: "jewellery" },
  { href: "/admin/jewellery/categories", label: "Categories", icon: "▥", division: "jewellery" },
  { href: "/admin/jewellery/attributes", label: "Attributes", icon: "≡", division: "jewellery" },
  // Digital (services catalogue)
  { href: "/admin/digital/services", label: "Services", icon: "▤", division: "digital" },
  { href: "/admin/digital/categories", label: "Categories", icon: "▥", division: "digital" },
  { href: "/admin/digital/leads", label: "Leads", icon: "◎", division: "digital" },
];

export function AdminShell({
  email,
  fullName,
  role,
  divisions,
  canSeeSuper,
  children,
}: {
  email: string;
  fullName: string | null;
  role: RoleName;
  divisions: DivisionId[];
  canSeeSuper: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Which division is currently in scope, inferred from the path.
  const activeDivision: DivisionId | "all" = (() => {
    const seg = pathname.split("/")[2];
    if (seg === "mobiles" || seg === "jewellery" || seg === "digital")
      return seg;
    return "all";
  })();

  const canSee = (item: NavItem) => {
    if (item.superOnly && !canSeeSuper) return false;
    if (item.division && !canSeeSuper && !divisions.includes(item.division))
      return false;
    return true;
  };

  const visibleNav = NAV.filter(canSee);

  async function signOut() {
    await supabase?.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <Link href="/admin">YAGA GROUP</Link>
          <span>ADMIN</span>
        </div>
        <nav className="admin-nav">
          {visibleNav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${active ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <span className="admin-role-badge">{role.replace("_", " ")}</span>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-burger"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
          <div className="admin-dpicker">
            <span className="admin-dpicker-label">Division</span>
            <select
              className="admin-dpicker-select"
              value={activeDivision}
              onChange={(e) => {
                const v = e.target.value;
                router.push(v === "all" ? "/admin" : `/admin/${v}`);
              }}
            >
              {canSeeSuper && <option value="all">All Divisions</option>}
              {DIVISIONS.filter(
                (d) => canSeeSuper || divisions.includes(d.id)
              ).map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-user">
            <div className="admin-user-meta">
              <strong>{fullName || email}</strong>
              <span>{email}</span>
            </div>
            <button className="btn outline" onClick={signOut}>
              Sign out
            </button>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}