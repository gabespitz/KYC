import type Anthropic from "@anthropic-ai/sdk";

export const HANDOFF_SYSTEM_PROMPT = `You are an operations assistant for "In All Media". A new client has just signed their legal documents and is being handed off to the Accounts team to be onboarded into our internal "Coderfull" platform.

Your job is to:
1. Build a clean Coderfull client payload from the prospect record and signed documents.
2. Draft a notification email to the Accounts group introducing the client and listing the signed documents.

When done, call the \`draft_handoff\` tool with both outputs. Do not return text. Only the tool call.`;

export const DRAFT_HANDOFF_TOOL: Anthropic.Tool = {
  name: "draft_handoff",
  description:
    "Submit the Coderfull client payload and the Accounts handoff email.",
  input_schema: {
    type: "object",
    properties: {
      coderfullPayload: {
        type: "object",
        properties: {
          legalName: { type: "string" },
          displayName: { type: "string" },
          industry: { type: "string" },
          website: { type: "string" },
          primaryContact: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              phone: { type: "string" },
            },
            required: ["name", "email"],
          },
          billingAddress: { type: "string" },
          paymentTerms: { type: "string" },
          riskLevel: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH"],
          },
          notes: { type: "string" },
          signedDocuments: {
            type: "array",
            items: {
              type: "object",
              properties: {
                kind: { type: "string" },
                title: { type: "string" },
                signedAt: { type: "string" },
              },
              required: ["kind", "title"],
            },
          },
        },
        required: ["legalName", "primaryContact", "riskLevel"],
      },
      accountsEmail: {
        type: "object",
        properties: {
          to: { type: "array", items: { type: "string" } },
          subject: { type: "string" },
          bodyMarkdown: { type: "string" },
        },
        required: ["to", "subject", "bodyMarkdown"],
      },
    },
    required: ["coderfullPayload", "accountsEmail"],
  },
};

export function buildHandoffUserMessage(input: {
  prospect: {
    legalName: string;
    industry: string | null;
    website: string | null;
    contactName: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    notes: string | null;
  };
  researchSummary: string | null;
  riskRecommendation: string | null;
  signedDocuments: Array<{ kind: string; title: string; signedAt?: string }>;
}): string {
  return [
    `Build the Coderfull handoff for this newly-signed client.`,
    ``,
    `## Prospect`,
    `- Legal name: ${input.prospect.legalName}`,
    `- Industry: ${input.prospect.industry ?? "unknown"}`,
    `- Website: ${input.prospect.website ?? "unknown"}`,
    `- Primary contact: ${input.prospect.contactName ?? "unknown"} <${input.prospect.contactEmail ?? "unknown"}> ${input.prospect.contactPhone ?? ""}`,
    input.prospect.notes ? `- Internal notes: ${input.prospect.notes}` : null,
    ``,
    `## Research summary`,
    input.researchSummary ?? "(no research report on file)",
    ``,
    `## Recommendation from research`,
    input.riskRecommendation ?? "unknown",
    ``,
    `## Signed documents`,
    ...input.signedDocuments.map(
      (d) => `- ${d.kind}: ${d.title}${d.signedAt ? ` (signed ${d.signedAt})` : ""}`
    ),
    ``,
    `Send the result to: accounts@inallmedia.local`,
    `Map the research recommendation to riskLevel: GO -> LOW, HOLD -> MEDIUM, NO_GO -> HIGH (but if it's NO_GO, that's unusual at this stage — flag it in notes).`,
    ``,
    `Call draft_handoff with both outputs.`,
  ]
    .filter(Boolean)
    .join("\n");
}
