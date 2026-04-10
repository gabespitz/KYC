"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">New prospect</h1>
        <p className="text-sm text-muted-foreground">
          Add a potential client. After creating, run KYC research and start the
          legal review.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field name="legalName" label="Legal name *" required />
        <Field name="website" label="Website" placeholder="https://..." />
        <Field name="industry" label="Industry" />
        <Field name="contactName" label="Primary contact name" />
        <Field
          name="contactEmail"
          label="Primary contact email"
          type="email"
        />
        <Field name="contactPhone" label="Primary contact phone" />
        <div>
          <label className="block text-sm font-medium mb-1">
            Internal notes
          </label>
          <textarea
            name="notes"
            rows={4}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-rose-700">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create prospect"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md text-sm border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full border rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}
