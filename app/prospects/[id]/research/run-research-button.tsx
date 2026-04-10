"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function RunResearchButton({
  id,
  hasReport,
}: {
  id: string;
  hasReport: boolean;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    const res = await fetch(`/api/prospects/${id}/research`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Research failed");
      setRunning(false);
      return;
    }
    setRunning(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={run}
        disabled={running}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
      >
        {running ? "Researching…" : hasReport ? "Re-run research" : "Run research"}
      </button>
      {running && (
        <p className="text-xs text-muted-foreground">
          Claude is searching the web. This may take 1–3 minutes.
        </p>
      )}
      {error && <p className="text-xs text-rose-700 max-w-xs text-right">{error}</p>}
    </div>
  );
}
