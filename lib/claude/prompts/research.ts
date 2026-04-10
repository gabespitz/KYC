import type Anthropic from "@anthropic-ai/sdk";

export const RESEARCH_SYSTEM_PROMPT = `You are a B2B vendor due-diligence analyst working for "In All Media", a global technology and media services company that provides engineering and creative talent to enterprise clients.

Your job is to research a prospective client and produce a structured KYC (Know Your Client) report that helps In All Media decide whether to enter a vendor relationship with them.

Investigate these dimensions:
1. **Business profile** — what the company does, sector, size, geography, founding, ownership.
2. **Creditworthiness** — public financial signals (funding rounds, public filings, news of layoffs, bankruptcy, late payments, vendor lawsuits).
3. **Vendor relationship history** — known relationships with other vendors / agencies / consultancies; any reports of payment issues, disputes, lawsuits.
4. **Trust & reputation** — Glassdoor / news reputation, leadership profile, litigation, sanctions/PEP exposure, regulatory actions.
5. **Risks** — anything that could harm In All Media if we engage them.

RULES:
- Use the web_search tool aggressively to gather evidence. Do not invent facts.
- EVERY claim in the final report must be backed by a URL you actually retrieved via web_search. Do not include sources you didn't open.
- If information is not available, say "unknown" rather than guessing.
- Be concise and decision-oriented. The reader is a Sales/Legal lead who needs a GO / NO_GO / HOLD recommendation.
- When you have gathered enough evidence, call the \`submit_report\` tool with your final structured report. Do NOT respond with a long text answer at the end — call the tool.`;

export const SUBMIT_REPORT_TOOL: Anthropic.Tool = {
  name: "submit_report",
  description:
    "Submit the final structured KYC research report. Call this once you have gathered sufficient evidence. Every URL in `sources` MUST have been retrieved via web_search earlier in this conversation.",
  input_schema: {
    type: "object",
    properties: {
      company: {
        type: "object",
        properties: {
          legalName: { type: "string" },
          aliases: { type: "array", items: { type: "string" } },
          website: { type: "string" },
          hq: { type: "string" },
          founded: { type: "string" },
          employees: { type: "string" },
          industry: { type: "string" },
        },
        required: ["legalName"],
      },
      businessProfile: { type: "string" },
      creditworthiness: {
        type: "object",
        properties: {
          signals: { type: "array", items: { type: "string" } },
          score: {
            type: "string",
            enum: ["strong", "adequate", "weak", "unknown"],
          },
          notes: { type: "string" },
        },
        required: ["signals", "score"],
      },
      vendorHistory: {
        type: "array",
        items: {
          type: "object",
          properties: {
            vendor: { type: "string" },
            relationship: { type: "string" },
            notes: { type: "string" },
            source: { type: "string" },
          },
          required: ["vendor", "relationship"],
        },
      },
      trust: {
        type: "object",
        properties: {
          reputationNotes: { type: "string" },
          litigationFlags: { type: "array", items: { type: "string" } },
          sanctionsFlags: { type: "array", items: { type: "string" } },
        },
      },
      risks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            severity: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            },
            description: { type: "string" },
            evidence: { type: "string" },
          },
          required: ["severity", "description"],
        },
      },
      recommendation: {
        type: "string",
        enum: ["GO", "NO_GO", "HOLD"],
      },
      rationale: { type: "string" },
      summary: {
        type: "string",
        description: "2-4 sentence executive summary.",
      },
      sources: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            url: { type: "string" },
            snippet: { type: "string" },
          },
          required: ["title", "url"],
        },
      },
    },
    required: [
      "company",
      "businessProfile",
      "creditworthiness",
      "trust",
      "risks",
      "recommendation",
      "rationale",
      "summary",
      "sources",
    ],
  },
};

export function buildResearchUserMessage(input: {
  legalName: string;
  website?: string | null;
  industry?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  notes?: string | null;
}): string {
  return [
    `Research the following prospective client for In All Media:`,
    ``,
    `- Legal name: ${input.legalName}`,
    input.website ? `- Website: ${input.website}` : null,
    input.industry ? `- Industry: ${input.industry}` : null,
    input.contactName ? `- Contact: ${input.contactName}` : null,
    input.contactEmail ? `- Contact email: ${input.contactEmail}` : null,
    input.notes ? `- Internal notes: ${input.notes}` : null,
    ``,
    `Use web_search to gather evidence, then submit the structured KYC report via the submit_report tool.`,
  ]
    .filter(Boolean)
    .join("\n");
}
