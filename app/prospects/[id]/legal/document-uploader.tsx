"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Upload } from "lucide-react";

export function DocumentUploader({ prospectId }: { prospectId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const res = await fetch(`/api/prospects/${prospectId}/documents`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Upload failed");
      setBusy(false);
      return;
    }
    setBusy(false);
    (e.currentTarget as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="stack-4">
      <div className="form-grid">
        <div className="field">
          <label htmlFor="uploader-title">Title</label>
          <input
            id="uploader-title"
            name="title"
            required
            placeholder="Master Services Agreement"
          />
        </div>
        <div className="field">
          <label htmlFor="uploader-kind">Kind</label>
          <select id="uploader-kind" name="kind" defaultValue="MSA">
            <option>MSA</option>
            <option>SOW</option>
            <option>NDA</option>
            <option>DPA</option>
            <option>OTHER</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="uploader-file">File (PDF, DOCX, TXT)</label>
        <input
          id="uploader-file"
          name="file"
          type="file"
          required
          accept=".pdf,.docx,.txt,.md"
        />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? (
            <>
              <span className="spinner" /> Uploading…
            </>
          ) : (
            <>
              <Upload size={16} /> Upload document
            </>
          )}
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
}
