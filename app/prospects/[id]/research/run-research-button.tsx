"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play, RefreshCw } from "lucide-react";

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <button
        onClick={run}
        disabled={running}
        className="btn btn-primary"
      >
        {running ? (
          <>
            <span className="spinner" /> Researching…
          </>
        ) : hasReport ? (
          <>
            <RefreshCw size={16} /> Re-run research
          </>
        ) : (
          <>
            <Play size={16} /> Run research
          </>
        )}
      </button>
      {running && (
        <p className="muted" style={{ fontSize: 12, margin: 0 }}>
          Claude is searching the web. This may take 1–3 minutes.
        </p>
      )}
      {error && (
        <p className="error-text" style={{ maxWidth: 280, textAlign: "right" }}>
          {error}
        </p>
      )}
    </div>
  );
}
