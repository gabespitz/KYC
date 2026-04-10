import Link from "next/link";
import { db } from "@/lib/db";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProspectsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const prospects = await db.prospect.findMany({
    where: status ? { status } : undefined,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Prospects</h1>
          {status && (
            <p className="text-sm text-muted-foreground">
              Filtered by status:{" "}
              <span className="font-medium">{status.replace("_", " ")}</span>{" "}
              ·{" "}
              <Link href="/prospects" className="underline">
                clear
              </Link>
            </p>
          )}
        </div>
        <Link
          href="/prospects/new"
          className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm hover:opacity-90"
        >
          + New prospect
        </Link>
      </div>

      {prospects.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No prospects found.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-2 font-medium">Legal name</th>
                <th className="px-4 py-2 font-medium">Industry</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Decision</th>
                <th className="px-4 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {prospects.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <Link href={`/prospects/${p.id}`} className="text-primary hover:underline">
                      {p.legalName}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {p.industry ?? "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`badge badge-${p.status.toLowerCase()}`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {p.decision ? (
                      <span className={`badge badge-${p.decision.toLowerCase()}`}>
                        {p.decision}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatRelative(p.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
