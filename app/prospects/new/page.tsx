"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";

export default function NewProspectPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create prospect");
      setSubmitting(false);
      return;
    }
    const { prospect } = await res.json();
    router.push(`/prospects/${prospect.id}`);
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Link
        href="/prospects"
        className="nav-item"
        style={{ width: "auto", display: "inline-flex", marginBottom: 12, padding: "4px 0" }}
      >
        <ArrowLeft size={16} />
        Back to prospects
      </Link>

      <div className="sec-head">
        <h1 className="sec-title">New prospect</h1>
        <p className="sec-sub">
          Add a potential client. After creating, run KYC research and start the legal review.
        </p>
      </div>

      <div className="card">
        <form onSubmit={onSubmit} className="stack-4">
          <div className="field">
            <label htmlFor="legalName">Legal name *</label>
            <input id="legalName" name="legalName" type="text" required placeholder="Acme Corp" />
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="url" placeholder="https://acme.example.com" />
            </div>
            <div className="field">
              <label htmlFor="industry">Industry</label>
              <input id="industry" name="industry" type="text" placeholder="Media / Advertising" />
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="contactName">Primary contact name</label>
              <input id="contactName" name="contactName" type="text" placeholder="Jane Smith" />
            </div>
            <div className="field">
              <label htmlFor="contactEmail">Primary contact email</label>
              <input id="contactEmail" name="contactEmail" type="email" placeholder="jane@acme.example.com" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="contactPhone">Primary contact phone</label>
            <input id="contactPhone" name="contactPhone" type="tel" placeholder="+1 (555) 000-0000" />
          </div>

          <div className="field">
            <label htmlFor="notes">Internal notes</label>
            <textarea id="notes" name="notes" rows={4} placeholder="How did we meet this prospect? Any context for the research phase?" />
          </div>

          {error && <p className="error-text">{error}</p>}

          <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? (
                <>
                  <span className="spinner" /> Creating…
                </>
              ) : (
                <>
                  <Plus size={16} /> Create prospect
                </>
              )}
            </button>
            <button type="button" onClick={() => router.back()} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
