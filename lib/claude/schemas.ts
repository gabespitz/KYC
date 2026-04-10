import { z } from "zod";

// =============================================================================
// Phase 1 — Research report (structured output from Claude)
// =============================================================================

export const SourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string().optional().default(""),
});
export type Source = z.infer<typeof SourceSchema>;

export const CompanySchema = z.object({
  legalName: z.string(),
  aliases: z.array(z.string()).default([]),
  website: z.string().optional().nullable(),
  hq: z.string().optional().nullable(),
  founded: z.string().optional().nullable(),
  employees: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
});

export const VendorRelationSchema = z.object({
  vendor: z.string(),
  relationship: z.string(),
  notes: z.string().optional().default(""),
  source: z.string().optional().default(""),
});

export const RiskItemSchema = z.object({
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: z.string(),
  evidence: z.string().optional().default(""),
});

export const ResearchReportSchema = z.object({
  company: CompanySchema,
  businessProfile: z.string(),
  creditworthiness: z.object({
    signals: z.array(z.string()).default([]),
    score: z.enum(["strong", "adequate", "weak", "unknown"]),
    notes: z.string().optional().default(""),
  }),
  vendorHistory: z.array(VendorRelationSchema).default([]),
  trust: z.object({
    reputationNotes: z.string().default(""),
    litigationFlags: z.array(z.string()).default([]),
    sanctionsFlags: z.array(z.string()).default([]),
  }),
  risks: z.array(RiskItemSchema).default([]),
  recommendation: z.enum(["GO", "NO_GO", "HOLD"]),
  rationale: z.string(),
  summary: z.string(),
  sources: z.array(SourceSchema).default([]),
});
export type ResearchReport = z.infer<typeof ResearchReportSchema>;

// =============================================================================
// Phase 2 — Legal redline output
// =============================================================================

export const RedlineSchema = z.object({
  clauseId: z.string(),
  originalText: z.string(),
  suggestedText: z.string(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  category: z.string(),
  rationale: z.string(),
});
export type Redline = z.infer<typeof RedlineSchema>;

export const RedlineBatchSchema = z.object({
  redlines: z.array(RedlineSchema),
});
export type RedlineBatch = z.infer<typeof RedlineBatchSchema>;

// =============================================================================
// Phase 4 — Coderfull handoff payload
// =============================================================================

export const CoderfullClientInputSchema = z.object({
  legalName: z.string(),
  displayName: z.string().optional(),
  industry: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  primaryContact: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional().nullable(),
  }),
  billingAddress: z.string().optional().nullable(),
  paymentTerms: z.string().optional().nullable(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
  notes: z.string().optional().default(""),
  signedDocuments: z
    .array(
      z.object({
        kind: z.string(),
        title: z.string(),
        signedAt: z.string().optional().nullable(),
      })
    )
    .default([]),
});
export type CoderfullClientInput = z.infer<typeof CoderfullClientInputSchema>;

export const HandoffEmailSchema = z.object({
  to: z.array(z.string().email()).min(1),
  subject: z.string(),
  bodyMarkdown: z.string(),
});
export type HandoffEmail = z.infer<typeof HandoffEmailSchema>;

export const HandoffDraftSchema = z.object({
  coderfullPayload: CoderfullClientInputSchema,
  accountsEmail: HandoffEmailSchema,
});
export type HandoffDraft = z.infer<typeof HandoffDraftSchema>;
