import Link from "next/link";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUSES = [
  "RESEARCH",
  "LEGAL",
  "NEGOTIATION",
  "SIGNED",
  "HANDED_OFF",
  "REJECTED",
] as const;

export default async function DashboardPage() {
  const counts = await Promise.all(
    STATUSES.map(async (s) => ({
      status: s,
      n: await db.prospect.count({ where: { status: s } }),
    }))
  );
  const recent = await db.prospect.findMany({
    orderBy: { updatedAt: "desc" },
    take: 8,
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Track prospects through the KYC lifecycle: research, legal review,
          negotiation, and Coderfull handoff.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase text-muted-foreground mb-3">
          Pipeline
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {counts.map((c) => (
            <Link
              key={c.status}
              href={`/prospects?status=${c.status}`}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="text-2xl font-semibold">{c.n}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {c.status.replace("_", " ")}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium uppercase text-muted-foreground">
            Recent prospects
          </h2>
          <Link
            href="/prospects/new"
            className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90"
          >
            + New prospect
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground">
            No prospects yet.{" "}
            <Link href="/prospects/new" className="underline">
              Create your first one
            </Link>
            .
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/prospects/${p.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/30"
              >
                <div>
                  <div className="font-medium">{p.legalName}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.industry ?? "—"} · updated {formatRelative(p.updatedAt)}
                  </div>
                </div>
                <span className={`badge badge-${p.status.toLowerCase()}`}>
                  {p.status.replace("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
