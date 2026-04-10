import { z } from "zod";

export const CreateProspectInput = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  website: z.string().url().or(z.literal("")).optional(),
  industry: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().or(z.literal("")).optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateProspectInput = z.infer<typeof CreateProspectInput>;

export const UpdateProspectInput = z.object({
  legalName: z.string().min(1).optional(),
  website: z.string().url().or(z.literal("")).optional(),
  industry: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().or(z.literal("")).optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  status: z
    .enum([
      "RESEARCH",
      "LEGAL",
      "NEGOTIATION",
      "SIGNED",
      "HANDED_OFF",
      "REJECTED",
    ])
    .optional(),
  decision: z.enum(["GO", "NO_GO", "HOLD"]).nullable().optional(),
});
export type UpdateProspectInput = z.infer<typeof UpdateProspectInput>;

export const CreateEventInput = z.object({
  type: z.enum([
    "VERSION_SENT",
    "VERSION_RECEIVED",
    "COMMENT",
    "STATUS_CHANGE",
    "SIGNED",
  ]),
  payload: z.record(z.unknown()).default({}),
  note: z.string().optional(),
});
export type CreateEventInput = z.infer<typeof CreateEventInput>;

export const UpdateRedlineInput = z.object({
  status: z.enum(["OPEN", "ACCEPTED", "REJECTED", "MODIFIED"]).optional(),
  humanNote: z.string().optional(),
  suggestedText: z.string().optional(),
});
export type UpdateRedlineInput = z.infer<typeof UpdateRedlineInput>;

export const DocumentKindEnum = z.enum(["MSA", "SOW", "NDA", "DPA", "OTHER"]);
