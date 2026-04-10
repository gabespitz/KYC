import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProspectTabs } from "@/components/ProspectTabs";
import { statusBadge, decisionBadge } from "@/lib/badges";

export default async function ProspectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prospect = await db.prospect.findUnique({ where: { id } });
  if (!prospect) notFound();

  const s = statusBadge(prospect.status);
  const d = decisionBadge(prospect.decision);

  return (
    <div className="stack-6">
      <div>
        <Link
          href="/prospects"
          className="nav-item"
          style={{ width: "auto", display: "inline-flex", padding: "4px 0", marginBottom: 8 }}
        >
          <ArrowLeft size={14} />
          All prospects
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h1 className="sec-title" style={{ marginBottom: 6 }}>
              {prospect.legalName}
            </h1>
            <p className="sec-sub" style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {prospect.industry && <span>{prospect.industry}</span>}
              {prospect.website && (
                <>
                  {prospect.industry && <span>·</span>}
                  <a
                    href={prospect.website}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "var(--primary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    {prospect.website}
                    <ExternalLink size={12} />
                  </a>
                </>
              )}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className={`${s.className} badge-lg`}>
              <span className="badge-dot"></span>
              {s.label}
            </span>
            <span className={`${d.className} badge-lg`}>
              <span className="badge-dot"></span>
              {d.label}
            </span>
          </div>
        </div>
      </div>

      <ProspectTabs id={id} />

      <div>{children}</div>
    </div>
  );
}
