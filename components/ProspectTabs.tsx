"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProspectTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/prospects/${id}`, label: "Overview", exact: true },
    { href: `/prospects/${id}/research`, label: "1 · Research" },
    { href: `/prospects/${id}/legal`, label: "2 · Legal" },
    { href: `/prospects/${id}/negotiation`, label: "3 · Negotiation" },
    { href: `/prospects/${id}/handoff`, label: "4 · Handoff" },
  ];
  return (
    <div className="toggle-group">
      {tabs.map((t) => {
        const active = t.exact
          ? pathname === t.href
          : pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`toggle-btn ${active ? "active" : ""}`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
