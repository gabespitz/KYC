"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProspectPicker } from "@/components/ProspectPicker";

export default function NewLegalPage() {
  const router = useRouter();

  async function createProspect(legalName: string) {
    const res = await fetch("/api/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ legalName }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error ?? "Failed to create prospect");
    }
    const data = await res.json();
    return {
      id: data.prospect.id,
      legalName: data.prospect.legalName,
      industry: data.prospect.industry,
      status: data.prospect.status,
    };
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <Link
        href="/tools/legal"
        className="nav-item"
        style={{
          width: "auto",
          display: "inline-flex",
          marginBottom: 12,
          padding: "4px 0",
        }}
      >
        <ArrowLeft size={16} />
        Back to legal queue
      </Link>

      <div className="sec-head">
        <h1 className="sec-title">Upload a new document</h1>
        <p className="sec-sub">
          Pick the prospect this document belongs to — or create a new prospect on the fly. You&apos;ll land on their Legal tab where you can upload the MSA / SOW / NDA / DPA and click <strong>Analyze with Claude</strong>.
        </p>
      </div>

      <div className="card">
        <ProspectPicker
          autoFocus
          onSelect={(p) => router.push(`/prospects/${p.id}/legal`)}
          onCreate={createProspect}
          label="Which prospect is this document from?"
          placeholder="Search or type a new prospect name…"
        />
        <p className="help" style={{ marginTop: 12 }}>
          Tip: if this is a brand-new prospect, type their company name and click <em>Create new prospect</em> when it appears.
        </p>
      </div>
    </div>
  );
}
