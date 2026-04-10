"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Sparkles, Upload } from "lucide-react";
import { riskBadge, riskCardClass } from "@/lib/badges";

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

  const text = currentVersion.extractedText;
  const fragments = highlightFragments(text, redlines, activeRedlineId);
  const fileUrl = `/api/files/${Buffer.from(currentVersion.storageKey).toString("base64url")}`;

  return (
    <div className="stack-4">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span className="badge badge-gray">{document.kind}</span>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
              {document.title}
            </h2>
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            v{currentVersion.versionNumber} · {currentVersion.fileName}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
          >
            <Download size={16} />
            Download original
          </a>
          <button
            onClick={analyze}
            disabled={analyzing}
            className="btn btn-primary"
          >
            {analyzing ? (
              <>
                <span className="spinner" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles size={16} /> Analyze with Claude
              </>
            )}
          </button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <VersionUploader documentId={document.id} prospectId={prospectId} />

      {versions.length > 1 && (
        <div className="muted" style={{ fontSize: 12 }}>
          <strong>History:</strong>{" "}
          {versions
            .map(
              (v) =>
                `v${v.versionNumber} (${v.source.toLowerCase()}, ${v.fileName})`
            )
            .join(" → ")}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
          gap: 16,
        }}
        className="redline-grid"
      >
        <div
          className="card"
          style={{
            padding: 20,
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {text.length === 0 ? (
            <p className="muted" style={{ fontSize: 14 }}>
              No extracted text. The file may be image-based — re-upload as a
              text PDF or DOCX.
            </p>
          ) : (
            <pre
              className="num"
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 12,
                lineHeight: 1.65,
                color: "var(--text)",
                margin: 0,
              }}
            >
              {fragments}
            </pre>
          )}
        </div>
        <div
          className="stack-3"
          style={{ maxHeight: "70vh", overflowY: "auto" }}
        >
          <div className="section-label" style={{ position: "sticky", top: 0, background: "var(--bg)", zIndex: 1, marginBottom: 0, padding: "4px 0" }}>
            Redlines ({redlines.length})
          </div>
          {redlines.length === 0 ? (
            <div className="card">
              <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                No redlines yet. Click <strong>Analyze with Claude</strong> to generate.
              </p>
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

      <style jsx>{`
        @media (max-width: 900px) {
          .redline-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function VersionUploader({
  documentId,
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
      className="card"
      style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}
    >
      <div className="field" style={{ flex: "1 1 220px" }}>
        <label>Upload new version</label>
        <input
          name="file"
          type="file"
          required
          accept=".pdf,.docx,.txt,.md"
        />
      </div>
      <div className="field" style={{ flex: "0 0 200px" }}>
        <label>From</label>
        <select name="source" defaultValue="CLIENT">
          <option value="CLIENT">Client (received)</option>
          <option value="US">In All Media (sent)</option>
        </select>
      </div>
      <button type="submit" disabled={busy} className="btn btn-secondary">
        {busy ? (
          <>
            <span className="spinner" /> Uploading…
          </>
        ) : (
          <>
            <Upload size={16} /> Add version
          </>
        )}
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
  const rb = riskBadge(redline.riskLevel);
  return (
    <div
      onClick={onClick}
      className={`${riskCardClass(redline.riskLevel)} ${active ? "active" : ""}`}
      style={{ cursor: "pointer" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 8,
          fontSize: 12,
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span className="num" style={{ fontWeight: 600 }}>
            {redline.clauseId}
          </span>
          <span className="badge badge-gray" style={{ fontSize: 10 }}>
            {redline.category}
          </span>
          <span className={rb.className}>
            <span className="badge-dot"></span>
            {rb.label}
          </span>
        </div>
        <span className="subtle" style={{ fontSize: 10 }}>
          {redline.createdBy}
        </span>
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.5 }}>
        <div className="muted" style={{ marginBottom: 4 }}>
          <strong>Original: </strong>
          <span style={{ fontStyle: "italic" }}>{truncate(redline.originalText, 180)}</span>
        </div>
        <div style={{ color: "var(--text)", marginBottom: 4 }}>
          <strong>Suggest: </strong>
          {truncate(redline.suggestedText, 180)}
        </div>
        <div className="muted" style={{ fontStyle: "italic" }}>
          {redline.rationale}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
        {(["OPEN", "ACCEPTED", "MODIFIED", "REJECTED"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChangeStatus(s);
            }}
            className="btn btn-secondary btn-sm"
            style={
              redline.status === s
                ? {
                    background: "var(--primary)",
                    color: "#fff",
                    borderColor: "var(--primary)",
                    fontSize: 11,
                    padding: "4px 8px",
                  }
                : { fontSize: 11, padding: "4px 8px" }
            }
          >
            {s}
          </button>
        ))}
      </div>
      <input
        value={note}
        placeholder="Add a note..."
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => {
          if (note !== (redline.humanNote ?? "")) onChangeNote(note);
        }}
        style={{ marginTop: 8, fontSize: 12, padding: "6px 10px" }}
      />
    </div>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n).trimEnd() + "…";
}

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
        style={{
          borderRadius: 3,
          padding: "0 2px",
          background:
            m.redline.id === activeId ? "#fde68a" : riskBg(m.redline.riskLevel),
        }}
      >
        {text.slice(m.start, m.end)}
      </mark>
    );
    cursor = m.end;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

function riskBg(level: string): string {
  switch (level) {
    case "CRITICAL": return "#fecaca";
    case "HIGH":     return "#fed7aa";
    case "MEDIUM":   return "#fde68a";
    default:         return "#bbf7d0";
  }
}
