import Link from "next/link";
import {
  Search,
  FileText,
  MessageSquare,
  Package,
  ArrowRight,
} from "lucide-react";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ToolsIndexPage() {
  const [
    pendingResearch,
    openRedlines,
    inNegotiation,
    pendingHandoff,
  ] = await Promise.all([
    db.prospect.count({ where: { research: { none: {} } } }),
    db.redlineComment.count({ where: { status: "OPEN" } }),
    db.prospect.count({ where: { status: "NEGOTIATION" } }),
    db.prospect.count({
      where: {
        status: "SIGNED",
        exports: { none: { status: "SENT" } },
      },
    }),
  ]);

  const tools = [
    {
      href: "/tools/research",
      icon: Search,
      title: "Research",
      blurb:
        "Investigate a prospect: business profile, creditworthiness, vendor history, trust — backed by Claude web search.",
      count: pendingResearch,
      countLabel:
        pendingResearch === 1 ? "prospect without a report" : "prospects without a report",
      audience: "For: Sales, Ops",
    },
    {
      href: "/tools/legal",
      icon: FileText,
      title: "Legal redline",
      blurb:
        "Upload a client MSA/SOW/NDA/DPA and let Claude (Opus) act as outside counsel to propose protective edits.",
      count: openRedlines,
      countLabel: openRedlines === 1 ? "open redline" : "open redlines",
      audience: "For: Legal",
    },
    {
      href: "/tools/negotiation",
      icon: MessageSquare,
      title: "Negotiation",
      blurb:
        "Track document versions and commentary as we iterate with the client toward signing.",
      count: inNegotiation,
      countLabel:
        inNegotiation === 1 ? "prospect in negotiation" : "prospects in negotiation",
      audience: "For: Legal, Sales",
    },
    {
      href: "/tools/handoff",
      icon: Package,
      title: "Handoff",
      blurb:
        "Once signed, draft the Coderfull payload and Accounts notification email, then push the client into Coderfull.",
      count: pendingHandoff,
      countLabel:
        pendingHandoff === 1 ? "signed prospect pending" : "signed prospects pending",
      audience: "For: Accounts",
    },
  ] as const;

  return (
    <div>
      <div className="sec-head">
        <h1 className="sec-title">Tools</h1>
        <p className="sec-sub">
          Each sub-tool is a focused workspace for one part of the KYC lifecycle. Open the one you need — they share the same prospect records under the hood.
        </p>
      </div>

      <div className="action-grid">
        {tools.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="card interactive"
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="metric-icon">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h2
                      className="card-title"
                      style={{ fontSize: 16, marginBottom: 2 }}
                    >
                      {t.title}
                    </h2>
                    <div
                      className="overline"
                      style={{ fontSize: 10, letterSpacing: "0.06em" }}
                    >
                      {t.audience}
                    </div>
                  </div>
                </div>
                <ArrowRight size={18} color="var(--muted)" />
              </div>

              <p className="muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                {t.blurb}
              </p>

              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: 10,
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                }}
              >
                <span className="num" style={{ fontSize: 22, fontWeight: 600 }}>
                  {t.count}
                </span>
                <span className="muted" style={{ fontSize: 12 }}>
                  {t.countLabel}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
