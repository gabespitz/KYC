"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Plus,
  Search,
  FileText,
  MessageSquare,
  Package,
} from "lucide-react";
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

const TOOLS_NAV: NavEntry[] = [
  { href: "/tools/research", label: "Research", icon: Search },
  { href: "/tools/legal", label: "Legal redline", icon: FileText },
  { href: "/tools/negotiation", label: "Negotiation", icon: MessageSquare },
  { href: "/tools/handoff", label: "Handoff", icon: Package },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

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
        const Icon = item.icon;
        const active =
          item.href === "/prospects"
            ? pathname === "/prospects" ||
              (pathname.startsWith("/prospects/") && pathname !== "/prospects/new")
            : isActive(pathname, item.href, item.exact);
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

      <div className="nav-label">Tools</div>
      {TOOLS_NAV.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
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
