"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Plus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface NavEntry {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  exact?: boolean;
}

const MAIN_NAV: NavEntry[] = [
  { href: "/", label: "Dashboard", icon: Home, exact: true },
  { href: "/prospects", label: "Prospects", icon: Users },
  { href: "/prospects/new", label: "New prospect", icon: Plus },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="sidebar">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 8px 20px",
        }}
      >
        <div className="logo-mark">iN</div>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>
          KYC
        </span>
      </div>

      <div className="nav-label">Main</div>
      {MAIN_NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${active ? "active" : ""}`}
          >
            <Icon size={20} />
            {item.label}
          </Link>
        );
      })}

      <div
        className="sidebar-footer"
        style={{ marginTop: "auto", padding: "12px 0" }}
      >
        <ThemeToggle />
      </div>
    </nav>
  );
}
