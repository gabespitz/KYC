"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, MessageSquarePlus } from "lucide-react";

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
    <div className="card stack-4">
      <form onSubmit={logEvent} className="stack-3">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="event-type">Event type</label>
            <select
              id="event-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="COMMENT">Comment</option>
              <option value="VERSION_SENT">Version sent</option>
              <option value="VERSION_RECEIVED">Version received</option>
              <option value="STATUS_CHANGE">Status change</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="event-note">Note</label>
            <input
              id="event-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Brief description"
            />
          </div>
        </div>
        <div>
          <button type="submit" disabled={busy} className="btn btn-primary">
            <MessageSquarePlus size={16} />
            Log event
          </button>
        </div>
      </form>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div className="muted" style={{ fontSize: 13 }}>
          Current status:{" "}
          <strong style={{ color: "var(--text)" }}>
            {currentStatus.replace("_", " ")}
          </strong>
        </div>
        <button
          onClick={markSigned}
          disabled={
            busy ||
            currentStatus === "SIGNED" ||
            currentStatus === "HANDED_OFF"
          }
          className="btn btn-success"
        >
          <CheckCircle2 size={16} />
          Mark as signed
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
