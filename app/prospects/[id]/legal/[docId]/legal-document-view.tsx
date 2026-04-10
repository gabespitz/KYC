"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RedlineLite {
  id: string;
  clauseId: string;
  originalText: string;
  suggestedText: string;
  riskLevel: string;
  category: string;
  rationale: string;
  status: string;
  humanNote: string | null;
  createdBy: string;
}

interface VersionLite {
  id: string;
  versionNumber: number;
  source: string;
  fileName: string;
  createdAt: string;
  hasText: boolean;
}

export function LegalDocumentView({
  prospectId,
  document,
  versions,
  currentVersion,
  initialRedlines,
}: {
  prospectId: string;
  document: { id: string; kind: string; title: string };
  versions: VersionLite[];
  currentVersion: {
    id: string;
    versionNumber: number;
    fileName: string;
    extractedText: string;
    storageKey: string;
  };
  initialRedlines: RedlineLite[];
}) {
  const router = useRouter();
  const [redlines, setRedlines] = useState(initialRedlines);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRedlineId, setActiveRedlineId] = useState<string | null>(null);

  async function analyze() {
    setAnalyzing(true);
    setError(null);
    const res = await fetch(`/api/documents/${document.id}/analyze`, {
      method: "POST",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Analyze failed");
      setAnalyzing(false);
      return;
    }
    setAnalyzing(false);
    router.refresh();
  }

  async function updateRedline(id: string, patch: Partial<RedlineLite>) {
    const res = await fetch(`/api/redlines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const data = await res.json();
      setRedlines((rs) =>
        rs.map((r) => (r.id === id ? { ...r, ...data.redline } : r))
      );
    }
  }

  // Build text with highlighted regions for each redline.
  const text = currentVersion.extractedText;
  const fragments = highlightFragments(text, redlines, activeRedlineId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded mr-2">
              {document.kind}
            </span>
            {document.title}
          </h2>
          <div className="text-xs text-muted-foreground mt-1">
            v{currentVersion.versionNumber} · {currentVersion.fileName}
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/files/${Buffer.from(currentVersion.storageKey).toString("base64url")}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm border px-3 py-1.5 rounded-md hover:bg-muted/50"
          >
            Download original
          </a>
          <button
            onClick={analyze}
            disabled={analyzing}
            className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm disabled:opacity-50"
          >
            {analyzing ? "Analyzing…" : "Analyze with Claude"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}

      <VersionUploader documentId={document.id} prospectId={prospectId} />

      <div className="text-xs text-muted-foreground">
        Versions:{" "}
        {versions
          .map(
            (v) =>
              `v${v.versionNumber} (${v.source.toLowerCase()}, ${v.fileName})`
          )
          .join(" → ")}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 border rounded-lg p-4 bg-white max-h-[70vh] overflow-y-auto">
          {text.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No extracted text. The file may be image-based — re-upload as a
              text PDF or DOCX.
            </p>
          ) : (
            <pre className="whitespace-pre-wrap text-xs leading-relaxed font-sans">
              {fragments}
            </pre>
          )}
        </div>
        <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto">
          <h3 className="text-xs font-medium uppercase text-muted-foreground sticky top-0 bg-background py-1">
            Redlines ({redlines.length})
          </h3>
          {redlines.length === 0 ? (
            <div className="border rounded-lg p-4 text-sm text-muted-foreground">
              No redlines yet. Click <strong>Analyze with Claude</strong> to
              generate.
            </div>
          ) : (
            redlines.map((r) => (
              <RedlineCard
                key={r.id}
                redline={r}
                active={activeRedlineId === r.id}
                onClick={() => setActiveRedlineId(r.id)}
                onChangeStatus={(status) => updateRedline(r.id, { status })}
                onChangeNote={(humanNote) => updateRedline(r.id, { humanNote })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function VersionUploader({
  documentId,
  prospectId: _prospectId,
}: {
  documentId: string;
  prospectId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/documents/${documentId}/versions`, {
      method: "POST",
      body: fd,
    });
    setBusy(false);
    if (res.ok) {
      (e.currentTarget as HTMLFormElement).reset();
      router.refresh();
    }
  }
  return (
    <form
      onSubmit={onSubmit}
      className="border rounded-lg p-3 flex gap-3 items-end"
    >
      <div className="flex-1">
        <label className="block text-xs font-medium mb-1">
          Upload new version
        </label>
        <input
          name="file"
          type="file"
          required
          accept=".pdf,.docx,.txt,.md"
          className="text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">From</label>
        <select
          name="source"
          className="border rounded-md px-2 py-1.5 text-sm"
          defaultValue="CLIENT"
        >
          <option value="CLIENT">Client (received)</option>
          <option value="US">In All Media (sent)</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={busy}
        className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm disabled:opacity-50"
      >
        {busy ? "Uploading…" : "Add version"}
      </button>
    </form>
  );
}

function RedlineCard({
  redline,
  active,
  onClick,
  onChangeStatus,
  onChangeNote,
}: {
  redline: RedlineLite;
  active: boolean;
  onClick: () => void;
  onChangeStatus: (status: string) => void;
  onChangeNote: (note: string) => void;
}) {
  const [note, setNote] = useState(redline.humanNote ?? "");
  return (
    <div
      onClick={onClick}
      className={cn(
        "border rounded-lg p-3 cursor-pointer transition-colors",
        active ? "ring-2 ring-primary" : "hover:bg-muted/30",
        `risk-${redline.riskLevel.toLowerCase()}`
      )}
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex gap-2 items-center">
          <span className="font-mono font-medium">{redline.clauseId}</span>
          <span className="px-1.5 py-0.5 rounded bg-white border text-[10px]">
            {redline.category}
          </span>
          <span className="font-medium">{redline.riskLevel}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {redline.createdBy}
        </span>
      </div>
      <div className="mt-2 text-xs">
        <div className="text-muted-foreground line-clamp-2">
          <span className="font-medium">Original: </span>
          {redline.originalText}
        </div>
        <div className="mt-1 text-foreground">
          <span className="font-medium">Suggest: </span>
          {redline.suggestedText}
        </div>
        <div className="mt-1 text-muted-foreground italic">
          {redline.rationale}
        </div>
      </div>
      <div className="mt-2 flex gap-1 items-center">
        {(["OPEN", "ACCEPTED", "MODIFIED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            onClick={(e) => {
              e.stopPropagation();
              onChangeStatus(s);
            }}
            className={cn(
              "text-[10px] px-2 py-0.5 rounded border",
              redline.status === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white"
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <input
        value={note}
        placeholder="Note"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => {
          if (note !== (redline.humanNote ?? "")) onChangeNote(note);
        }}
        className="mt-2 w-full text-xs border rounded px-2 py-1"
      />
    </div>
  );
}

// Render the document text with each redline's originalText highlighted.
function highlightFragments(
  text: string,
  redlines: RedlineLite[],
  activeId: string | null
): React.ReactNode {
  const matches: Array<{ start: number; end: number; redline: RedlineLite }> = [];
  for (const r of redlines) {
    if (!r.originalText) continue;
    const idx = text.indexOf(r.originalText);
    if (idx >= 0) {
      matches.push({
        start: idx,
        end: idx + r.originalText.length,
        redline: r,
      });
    }
  }
  matches.sort((a, b) => a.start - b.start);

  // Filter out overlaps (keep first)
  const filtered: typeof matches = [];
  let lastEnd = -1;
  for (const m of matches) {
    if (m.start >= lastEnd) {
      filtered.push(m);
      lastEnd = m.end;
    }
  }

  const out: React.ReactNode[] = [];
  let cursor = 0;
  filtered.forEach((m, i) => {
    if (m.start > cursor) {
      out.push(text.slice(cursor, m.start));
    }
    out.push(
      <mark
        key={`m-${i}`}
        className={cn(
          "rounded px-0.5",
          m.redline.id === activeId
            ? "bg-yellow-300"
            : riskBg(m.redline.riskLevel)
        )}
      >
        {text.slice(m.start, m.end)}
      </mark>
    );
    cursor = m.end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));

  return out;
}

function riskBg(level: string) {
  switch (level) {
    case "CRITICAL":
      return "bg-rose-200";
    case "HIGH":
      return "bg-orange-200";
    case "MEDIUM":
      return "bg-amber-200";
    default:
      return "bg-emerald-200";
  }
}
