"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ProspectTabs({ id }: { id: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/prospects/${id}`, label: "Overview" },
    { href: `/prospects/${id}/research`, label: "1 · Research" },
    { href: `/prospects/${id}/legal`, label: "2 · Legal" },
    { href: `/prospects/${id}/negotiation`, label: "3 · Negotiation" },
    { href: `/prospects/${id}/handoff`, label: "4 · Handoff" },
  ];
  return (
    <div className="border-b flex gap-1">
      {tabs.map((t) => {
        const active =
          pathname === t.href ||
          (t.href !== `/prospects/${id}` && pathname.startsWith(t.href));
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "px-4 py-2 text-sm border-b-2 -mb-px",
              active
                ? "border-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
