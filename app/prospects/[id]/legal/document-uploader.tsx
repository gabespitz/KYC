"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <form onSubmit={onSubmit} className="grid sm:grid-cols-4 gap-3 items-end">
      <div>
        <label className="block text-xs font-medium mb-1">Title</label>
        <input
          name="title"
          required
          className="w-full border rounded-md px-2 py-1.5 text-sm"
          placeholder="Master Services Agreement"
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Kind</label>
        <select
          name="kind"
          className="w-full border rounded-md px-2 py-1.5 text-sm"
          defaultValue="MSA"
        >
          <option>MSA</option>
          <option>SOW</option>
          <option>NDA</option>
          <option>DPA</option>
          <option>OTHER</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">File</label>
        <input
          name="file"
          type="file"
          required
          accept=".pdf,.docx,.txt,.md"
          className="w-full text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={busy}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm disabled:opacity-50"
      >
        {busy ? "Uploading…" : "Upload"}
      </button>
      {error && (
        <p className="sm:col-span-4 text-xs text-rose-700">{error}</p>
      )}
    </form>
  );
}
