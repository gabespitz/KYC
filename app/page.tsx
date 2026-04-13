import Link from "next/link";
import {
  Plus,
  Search,
  FileText,
  MessageSquare,
  CheckCircle2,
  Package,
  XCircle,
  Users,
} from "lucide-react";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/utils";
import { statusBadge, decisionBadge } from "@/lib/badges";

export const dynamic = "force-dynamic";

const STATUSES = [
  { key: "RESEARCH", label: "Research", icon: Search },
  { key: "LEGAL", label: "Legal", icon: FileText },
  { key: "NEGOTIATION", label: "Negotiation", icon: MessageSquare },
  { key: "SIGNED", label: "Signed", icon: CheckCircle2 },
  { key: "HANDED_OFF", label: "Handed off", icon: Package },
  { key: "REJECTED", label: "Rejected", icon: XCircle },
] as const;

export default async function DashboardPage() {
  const [counts, recent, queueCounts] = await Promise.all([
    Promise.all(
      STATUSES.map(async (s) => ({
        ...s,
        n: await db.prospect.count({ where: { status: s.key } }),
      }))
    ),
    db.prospect.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    Promise.all([
      db.prospect.count({ where: { research: { none: {} } } }),
      db.redlineComment.count({ where: { status: "OPEN" } }),
      db.prospect.count({ where: { status: "NEGOTIATION" } }),
      db.prospect.count({
        where: { status: "SIGNED", exports: { none: { status: "SENT" } } },
      }),
    ]),
  ]);
  const [pendingResearch, openRedlines, inNegotiation, pendingHandoff] =
    queueCounts;
  const total = counts.reduce((sum, c) => sum + c.n, 0);

  const toolQueues = [
    {
      href: "/tools/research",
      title: "Research queue",
      icon: Search,
      count: pendingResearch,
      hint:
        pendingResearch === 1 ? "prospect without a report" : "prospects without a report",
    },
    {
      href: "/tools/legal",
      title: "Open redlines",
      icon: FileText,
      count: openRedlines,
      hint: openRedlines === 1 ? "redline awaiting action" : "redlines awaiting action",
    },
    {
      href: "/tools/negotiation",
      title: "In negotiation",
      icon: MessageSquare,
      count: inNegotiation,
      hint:
        inNegotiation === 1 ? "prospect active now" : "prospects active now",
    },
    {
      href: "/tools/handoff",
      title: "Handoffs pending",
      icon: Package,
      count: pendingHandoff,
      hint:
        pendingHandoff === 1 ? "signed prospect ready" : "signed prospects ready",
    },
  ] as const;

  return (
    <div>
      <div
        className="sec-head"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h1 className="sec-title">Dashboard</h1>
          <p className="sec-sub">
            Track prospects through the KYC lifecycle: research, legal review, negotiation, and Coderfull handoff.
          </p>
        </div>
        <Link href="/prospects/new" className="btn btn-primary">
          <Plus size={16} />
          New prospect
        </Link>
      </div>

      <div className="section-label">Tool queues</div>
      <div
        className="metric-grid"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
          marginBottom: 24,
        }}
      >
        {toolQueues.map((q) => {
          const Icon = q.icon;
          return (
            <Link
              key={q.href}
              href={q.href}
              className="metric-card"
              style={{ display: "block", textDecoration: "none" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div>
                  <div className="metric-label">{q.title}</div>
                  <div className="metric-value">{q.count}</div>
                  <div
                    className="muted"
                    style={{ fontSize: 12, marginTop: 4 }}
                  >
                    {q.hint}
                  </div>
                </div>
                <div className="metric-icon">
                  <Icon size={20} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="section-label">Pipeline ({total} total)</div>
      <div className="metric-grid-6" style={{ marginBottom: 32 }}>
        {counts.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.key}
              href={`/prospects?status=${c.key}`}
              className="metric-card"
              style={{ display: "block", textDecoration: "none", padding: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <div>
                  <div className="metric-label" style={{ fontSize: 12 }}>
                    {c.label}
                  </div>
                  <div className="metric-value" style={{ fontSize: 24 }}>
                    {c.n}
                  </div>
                </div>
                <div className="metric-icon" style={{ width: 32, height: 32 }}>
                  <Icon size={16} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="section-label">Recent prospects</div>
      {recent.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={28} />
            </div>
            <h3>No prospects yet</h3>
            <p>Create your first prospect to begin the KYC research.</p>
            <Link href="/prospects/new" className="btn btn-primary">
              <Plus size={16} />
              New prospect
            </Link>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Legal name</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Decision</th>
                <th style={{ textAlign: "right" }}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => {
                const s = statusBadge(p.status);
                const d = decisionBadge(p.decision);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link
                        href={`/prospects/${p.id}`}
                        style={{ color: "var(--text)" }}
                      >
                        {p.legalName}
                      </Link>
                    </td>
                    <td className="muted">{p.industry ?? "—"}</td>
                    <td>
                      <span className={s.className}>
                        <span className="badge-dot"></span>
                        {s.label}
                      </span>
                    </td>
                    <td>
                      <span className={d.className}>
                        <span className="badge-dot"></span>
                        {d.label}
                      </span>
                    </td>
                    <td
                      className="muted"
                      style={{ textAlign: "right", fontSize: 13 }}
                    >
                      {formatRelative(p.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
