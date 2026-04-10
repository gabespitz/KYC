import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProspectTabs } from "@/components/ProspectTabs";

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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/prospects"
            className="text-xs text-muted-foreground hover:underline"
          >
            ← All prospects
          </Link>
          <h1 className="text-2xl font-semibold mt-1">{prospect.legalName}</h1>
          <p className="text-sm text-muted-foreground">
            {prospect.industry ?? "—"}
            {prospect.website && (
              <>
                {" · "}
                <a
                  href={prospect.website}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {prospect.website}
                </a>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`badge badge-${prospect.status.toLowerCase()}`}>
            {prospect.status.replace("_", " ")}
          </span>
          {prospect.decision && (
            <span className={`badge badge-${prospect.decision.toLowerCase()}`}>
              {prospect.decision}
            </span>
          )}
        </div>
      </div>
      <ProspectTabs id={id} />
      <div>{children}</div>
    </div>
  );
}
