"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = [
  "RESEARCH",
  "LEGAL",
  "NEGOTIATION",
  "SIGNED",
  "HANDED_OFF",
  "REJECTED",
] as const;
const DECISIONS = ["GO", "HOLD", "NO_GO"] as const;

export function ProspectStatusControls({
  id,
  status,
  decision,
}: {
  id: string;
  status: string;
  decision: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function update(patch: Record<string, string | null>) {
    setBusy(true);
    await fetch(`/api/prospects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="form-grid">
      <div className="field">
        <label>Status</label>
        <select
          value={status}
          disabled={busy}
          onChange={(e) => update({ status: e.target.value })}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Decision (GO / HOLD / NO-GO)</label>
        <select
          value={decision ?? ""}
          disabled={busy}
          onChange={(e) =>
            update({ decision: e.target.value === "" ? null : e.target.value })
          }
        >
          <option value="">— pending —</option>
          {DECISIONS.map((d) => (
            <option key={d} value={d}>
              {d.replace("_", "-")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
