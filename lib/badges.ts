/**
 * Centralised badge styling for status, decision, and risk values.
 * All badges use the IAM design system classes from app/globals.css.
 */

export interface BadgeSpec {
  className: string;
  label: string;
}

const STATUS_MAP: Record<string, BadgeSpec> = {
  RESEARCH:   { className: "badge badge-brand",   label: "Research" },
  LEGAL:      { className: "badge badge-purple",  label: "Legal review" },
  NEGOTIATION:{ className: "badge badge-warning", label: "Negotiation" },
  SIGNED:     { className: "badge badge-success", label: "Signed" },
  HANDED_OFF: { className: "badge badge-success", label: "Handed off" },
  REJECTED:   { className: "badge badge-error",   label: "Rejected" },
};

const DECISION_MAP: Record<string, BadgeSpec> = {
  GO:    { className: "badge badge-success", label: "GO" },
  HOLD:  { className: "badge badge-warning", label: "HOLD" },
  NO_GO: { className: "badge badge-error",   label: "NO-GO" },
};

const RISK_MAP: Record<string, BadgeSpec> = {
  LOW:      { className: "badge badge-success", label: "Low" },
  MEDIUM:   { className: "badge badge-warning", label: "Medium" },
  HIGH:     { className: "badge badge-error",   label: "High" },
  CRITICAL: { className: "badge badge-error",   label: "Critical" },
};

export function statusBadge(status: string | null | undefined): BadgeSpec {
  if (!status) return { className: "badge badge-gray", label: "—" };
  return STATUS_MAP[status] ?? { className: "badge badge-gray", label: status };
}

export function decisionBadge(decision: string | null | undefined): BadgeSpec {
  if (!decision) return { className: "badge badge-gray", label: "Pending" };
  return DECISION_MAP[decision] ?? { className: "badge badge-gray", label: decision };
}

export function riskBadge(risk: string | null | undefined): BadgeSpec {
  if (!risk) return { className: "badge badge-gray", label: "—" };
  return RISK_MAP[risk] ?? { className: "badge badge-gray", label: risk };
}

export function riskCardClass(risk: string): string {
  switch (risk) {
    case "CRITICAL": return "risk-card risk-critical";
    case "HIGH":     return "risk-card risk-high";
    case "MEDIUM":   return "risk-card risk-medium";
    default:         return "risk-card risk-low";
  }
}
