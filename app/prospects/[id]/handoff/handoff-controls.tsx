"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send, Sparkles, RefreshCw } from "lucide-react";
import type { CoderfullClientInput, HandoffEmail } from "@/lib/claude/schemas";

interface ExportState {
  id: string;
  status: string;
  externalId: string | null;
  error: string | null;
  payload: CoderfullClientInput | null;
  email: HandoffEmail | null;
}

export function HandoffControls({
  id,
  canSend,
  export: initialExport,
}: {
  id: string;
  canSend: boolean;
  export: ExportState | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payloadText, setPayloadText] = useState(
    initialExport?.payload ? JSON.stringify(initialExport.payload, null, 2) : ""
  );
  const [emailSubject, setEmailSubject] = useState(
    initialExport?.email?.subject ?? ""
  );
  const [emailBody, setEmailBody] = useState(
    initialExport?.email?.bodyMarkdown ?? ""
  );
  const [emailTo, setEmailTo] = useState(
    initialExport?.email?.to.join(", ") ?? "accounts@inallmedia.local"
  );

  async function draft() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/prospects/${id}/handoff/draft`, {
      method: "POST",
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Draft failed");
      return;
    }
    router.refresh();
  }

  async function send() {
    setBusy(true);
    setError(null);
    let parsedPayload: unknown;
    try {
      parsedPayload = JSON.parse(payloadText);
    } catch {
      setError("Coderfull payload is not valid JSON");
      setBusy(false);
      return;
    }
    const res = await fetch(`/api/prospects/${id}/handoff/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coderfullPayload: parsedPayload,
        accountsEmail: {
          to: emailTo.split(",").map((s) => s.trim()).filter(Boolean),
          subject: emailSubject,
          bodyMarkdown: emailBody,
        },
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Send failed");
      return;
    }
    router.refresh();
  }

  const statusBadgeClassName =
    initialExport?.status === "SENT"
      ? "badge badge-success"
      : initialExport?.status === "FAILED"
      ? "badge badge-error"
      : "badge badge-brand";

  return (
    <div className="stack-4">
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="overline" style={{ marginBottom: 6 }}>
              Draft status
            </div>
            {initialExport ? (
              <>
                <span className={statusBadgeClassName}>
                  <span className="badge-dot"></span>
                  {initialExport.status}
                </span>
                {initialExport.externalId && (
                  <div className="muted num" style={{ fontSize: 12, marginTop: 8 }}>
                    Coderfull ID: {initialExport.externalId}
                  </div>
                )}
                {initialExport.error && (
                  <div className="error-text" style={{ marginTop: 8 }}>
                    {initialExport.error}
                  </div>
                )}
              </>
            ) : (
              <span className="muted" style={{ fontSize: 14 }}>
                No draft yet
              </span>
            )}
          </div>
          <button onClick={draft} disabled={busy} className="btn btn-primary">
            {busy ? (
              <>
                <span className="spinner" /> Working…
              </>
            ) : initialExport ? (
              <>
                <RefreshCw size={16} /> Re-draft with Claude
              </>
            ) : (
              <>
                <Sparkles size={16} /> Draft with Claude
              </>
            )}
          </button>
        </div>
      </div>

      {!canSend && (
        <div
          className="card"
          style={{
            borderLeft: "4px solid var(--warning-500)",
            padding: 14,
            background: "var(--warning-50)",
          }}
        >
          <p style={{ fontSize: 13, margin: 0, color: "var(--warning-700)" }}>
            Mark the prospect as <strong>SIGNED</strong> before sending the
            handoff.
          </p>
        </div>
      )}

      {initialExport && (
        <div className="action-grid">
          <div className="card">
            <div className="overline" style={{ marginBottom: 10 }}>
              Coderfull payload
            </div>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={18}
              className="mono"
              style={{ minHeight: 360 }}
            />
          </div>
          <div className="card stack-3">
            <div className="overline">Accounts email</div>
            <div className="field">
              <label>To</label>
              <input
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Subject</label>
              <input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Body (markdown)</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
                className="mono"
              />
            </div>
          </div>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {initialExport && (
        <div>
          <button
            onClick={send}
            disabled={busy || !canSend}
            className="btn btn-success"
          >
            <Send size={16} />
            {busy ? "Sending…" : "Send to Coderfull & notify Accounts"}
          </button>
        </div>
      )}
    </div>
  );
}
