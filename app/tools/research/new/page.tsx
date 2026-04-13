"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProspectPicker } from "@/components/ProspectPicker";

export default function NewResearchPage() {
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
        href="/tools/research"
        className="nav-item"
        style={{
          width: "auto",
          display: "inline-flex",
          marginBottom: 12,
          padding: "4px 0",
        }}
      >
        <ArrowLeft size={16} />
        Back to research queue
      </Link>

      <div className="sec-head">
        <h1 className="sec-title">Run new research</h1>
        <p className="sec-sub">
          Pick an existing prospect or create a new one. You&apos;ll be taken to that prospect&apos;s research tab where you can click <strong>Run research</strong>.
        </p>
      </div>

      <div className="card">
        <ProspectPicker
          autoFocus
          onSelect={(p) => router.push(`/prospects/${p.id}/research`)}
          onCreate={createProspect}
          label="Which company are you researching?"
          placeholder="e.g. Acme Corp"
        />
        <p className="help" style={{ marginTop: 12 }}>
          Tip: if the prospect isn&apos;t in the list, keep typing and click{" "}
          <em>Create new prospect</em> that appears below.
        </p>
      </div>
    </div>
  );
}
