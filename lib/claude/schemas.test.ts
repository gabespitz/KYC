import { describe, expect, it } from "vitest";
import {
  ResearchReportSchema,
  RedlineBatchSchema,
  HandoffDraftSchema,
} from "./schemas";

describe("ResearchReportSchema", () => {
  it("accepts a minimal valid report", () => {
    const r = ResearchReportSchema.parse({
      company: { legalName: "Acme Co" },
      businessProfile: "An imaginary B2B SaaS company.",
      creditworthiness: { signals: [], score: "unknown" },
      trust: {},
      risks: [],
      recommendation: "GO",
      rationale: "No red flags found.",
      summary: "Acme is fine.",
      sources: [{ title: "Acme home", url: "https://acme.example.com" }],
    });
    expect(r.recommendation).toBe("GO");
    expect(r.creditworthiness.score).toBe("unknown");
  });

  it("rejects invalid recommendation", () => {
    expect(() =>
      ResearchReportSchema.parse({
        company: { legalName: "Acme" },
        businessProfile: "",
        creditworthiness: { signals: [], score: "unknown" },
        trust: {},
        risks: [],
        recommendation: "MAYBE",
        rationale: "",
        summary: "",
        sources: [],
      })
    ).toThrow();
  });
});

describe("RedlineBatchSchema", () => {
  it("accepts a list of redlines", () => {
    const b = RedlineBatchSchema.parse({
      redlines: [
        {
          clauseId: "sec-7.2",
          originalText: "Consultant grants Client all IP rights perpetually.",
          suggestedText:
            "Consultant grants Client a non-exclusive, royalty-free license to use the Deliverables.",
          riskLevel: "HIGH",
          category: "IP",
          rationale: "Avoid blanket IP assignment.",
        },
      ],
    });
    expect(b.redlines).toHaveLength(1);
    expect(b.redlines[0].riskLevel).toBe("HIGH");
  });
});

describe("HandoffDraftSchema", () => {
  it("validates a complete draft", () => {
    const d = HandoffDraftSchema.parse({
      coderfullPayload: {
        legalName: "Acme Co",
        primaryContact: { name: "Jane", email: "jane@acme.example.com" },
        riskLevel: "LOW",
      },
      accountsEmail: {
        to: ["accounts@inallmedia.local"],
        subject: "New client signed: Acme Co",
        bodyMarkdown: "Acme just signed.",
      },
    });
    expect(d.coderfullPayload.legalName).toBe("Acme Co");
    expect(d.accountsEmail.to[0]).toContain("@");
  });
});
