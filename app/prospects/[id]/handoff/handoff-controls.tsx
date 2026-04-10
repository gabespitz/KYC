"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border rounded-lg p-4">
        <div className="text-sm">
          {initialExport ? (
            <>
              <div>
                Status:{" "}
                <span className="font-medium">{initialExport.status}</span>
              </div>
              {initialExport.externalId && (
                <div className="text-xs font-mono text-muted-foreground mt-1">
                  Coderfull ID: {initialExport.externalId}
                </div>
              )}
              {initialExport.error && (
                <div className="text-xs text-rose-700 mt-1">
                  {initialExport.error}
                </div>
              )}
            </>
          ) : (
            <span className="text-muted-foreground">No draft yet</span>
          )}
        </div>
        <button
          onClick={draft}
          disabled={busy}
          className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm disabled:opacity-50"
        >
          {busy
            ? "Working…"
            : initialExport
            ? "Re-draft with Claude"
            : "Draft with Claude"}
        </button>
      </div>

      {!canSend && (
        <p className="text-xs text-amber-700 border-l-4 border-amber-400 pl-3 py-1">
          Mark the prospect as <strong>SIGNED</strong> before sending the
          handoff.
        </p>
      )}

      {initialExport && (
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="text-xs font-medium uppercase text-muted-foreground">
              Coderfull payload
            </h3>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={20}
              className="w-full font-mono text-xs border rounded-md p-2"
            />
          </div>
          <div className="border rounded-lg p-4 space-y-2">
            <h3 className="text-xs font-medium uppercase text-muted-foreground">
              Accounts email
            </h3>
            <div>
              <label className="block text-xs font-medium mb-1">To</label>
              <input
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Subject</label>
              <input
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full border rounded-md px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">
                Body (markdown)
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
                className="w-full border rounded-md p-2 text-xs font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-rose-700">{error}</p>}

      {initialExport && (
        <button
          onClick={send}
          disabled={busy || !canSend}
          className="bg-emerald-600 text-white px-5 py-2 rounded-md text-sm disabled:opacity-50 hover:bg-emerald-700"
        >
          {busy ? "Sending…" : "Send to Coderfull & notify Accounts"}
        </button>
      )}
    </div>
  );
}
