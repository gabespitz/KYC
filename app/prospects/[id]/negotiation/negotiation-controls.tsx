"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NegotiationControls({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [type, setType] = useState("COMMENT");
  const [error, setError] = useState<string | null>(null);

  async function logEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/prospects/${id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, note, payload: {} }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to log event");
      return;
    }
    setNote("");
    router.refresh();
  }

  async function markSigned() {
    if (!confirm("Mark this prospect as SIGNED? This advances the pipeline.")) {
      return;
    }
    setBusy(true);
    await fetch(`/api/prospects/${id}/sign`, { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <form onSubmit={logEvent} className="grid sm:grid-cols-5 gap-3 items-end">
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium mb-1">Event type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded-md px-2 py-1.5 text-sm"
          >
            <option value="COMMENT">Comment</option>
            <option value="VERSION_SENT">Version sent</option>
            <option value="VERSION_RECEIVED">Version received</option>
            <option value="STATUS_CHANGE">Status change</option>
          </select>
        </div>
        <div className="sm:col-span-3">
          <label className="block text-xs font-medium mb-1">Note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded-md px-2 py-1.5 text-sm"
            placeholder="Brief description"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm disabled:opacity-50"
        >
          Log event
        </button>
      </form>

      <div className="border-t pt-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Current status: <strong>{currentStatus.replace("_", " ")}</strong>
        </div>
        <button
          onClick={markSigned}
          disabled={busy || currentStatus === "SIGNED" || currentStatus === "HANDED_OFF"}
          className="bg-emerald-600 text-white px-4 py-1.5 rounded-md text-sm disabled:opacity-50 hover:bg-emerald-700"
        >
          Mark as signed
        </button>
      </div>
      {error && <p className="text-xs text-rose-700">{error}</p>}
    </div>
  );
}
