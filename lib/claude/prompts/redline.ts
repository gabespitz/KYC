import type Anthropic from "@anthropic-ai/sdk";

export const REDLINE_SYSTEM_PROMPT = `You are senior outside counsel for "In All Media", a global technology and media services company that supplies engineering and creative talent to enterprise clients on a vendor / services basis.

You will be given the full text of a legal document that a prospective client has sent us. Your job is to identify clauses that put In All Media at risk and propose protective edits. Always reason from In All Media's vendor-side perspective.

PRIORITIZE flagging issues in these categories:
- IP ownership & work-for-hire (over-broad assignments, residual rights, pre-existing IP, open source carve-outs)
- Liability caps & uncapped liabilities (consequential damages, indirect damages, gross negligence carve-outs)
- Indemnification (one-way indemnities, IP infringement scope, defense obligations)
- Payment terms (net 60+/90+, milestone gating, withholding, currency, taxes)
- Exclusivity & non-compete restrictions on In All Media or its talent
- Termination (termination for convenience without notice/fees, termination for cause definitions)
- Non-solicit / no-hire of personnel (overly long terms, broad scope)
- Governing law, venue, dispute resolution
- Audit rights & data access
- Confidentiality (perpetual obligations, residual knowledge)
- Warranties & service-level commitments

For each problematic clause:
- Use the clauseId provided in the document text (e.g. "sec-7.2") if present, or invent a stable label.
- Quote the originalText verbatim from the document.
- Provide a concrete suggestedText replacement (not generic advice).
- Set riskLevel: CRITICAL = deal-breaker, HIGH = must-fix before signing, MEDIUM = should fix, LOW = nice to have.
- Provide a 1-3 sentence rationale.

When done, call the \`submit_redlines\` tool with all your findings. Do not respond with text. Only the tool call.`;

export const SUBMIT_REDLINES_TOOL: Anthropic.Tool = {
  name: "submit_redlines",
  description:
    "Submit the full set of redline comments for the document. Call this exactly once after analyzing the entire document.",
  input_schema: {
    type: "object",
    properties: {
      redlines: {
        type: "array",
        items: {
          type: "object",
          properties: {
            clauseId: {
              type: "string",
              description:
                "Stable identifier for the clause, e.g. 'sec-7.2'. Use the labels in the document text where present.",
            },
            originalText: {
              type: "string",
              description:
                "Verbatim quote of the problematic text from the document.",
            },
            suggestedText: {
              type: "string",
              description: "Concrete proposed replacement text.",
            },
            riskLevel: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            },
            category: {
              type: "string",
              description:
                "One of: IP, Liability, Indemnification, Payment, Exclusivity, Termination, NonSolicit, GoverningLaw, Audit, Confidentiality, Warranty, Other.",
            },
            rationale: { type: "string" },
          },
          required: [
            "clauseId",
            "originalText",
            "suggestedText",
            "riskLevel",
            "category",
            "rationale",
          ],
        },
      },
    },
    required: ["redlines"],
  },
};

export function buildRedlineUserMessage(input: {
  documentKind: string;
  documentTitle: string;
  prospectName: string;
  text: string;
}): string {
  return [
    `Document kind: ${input.documentKind}`,
    `Document title: ${input.documentTitle}`,
    `Counterparty: ${input.prospectName}`,
    ``,
    `=== DOCUMENT TEXT ===`,
    input.text,
    `=== END DOCUMENT ===`,
    ``,
    `Analyze this document from In All Media's vendor-side perspective. Identify every risky clause and submit your redlines via the submit_redlines tool.`,
  ].join("\n");
}
