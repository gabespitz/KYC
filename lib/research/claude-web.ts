import type Anthropic from "@anthropic-ai/sdk";
import { MODELS, runToolLoop } from "../claude/client";
import {
  RESEARCH_SYSTEM_PROMPT,
  SUBMIT_REPORT_TOOL,
  buildResearchUserMessage,
} from "../claude/prompts/research";
import { ResearchReportSchema } from "../claude/schemas";
import type { ResearchInput, ResearchResult, ResearchSource } from "./index";

/**
 * Claude-powered research source.
 *
 * Uses Anthropic's hosted `web_search_20250305` server tool which lets the
 * model issue real searches against the live web. We also expose `submit_report`
 * as the terminal tool that returns the structured KYC report.
 */
export class ClaudeWebResearchSource implements ResearchSource {
  name = "claude-web";

  async run(input: ResearchInput): Promise<ResearchResult> {
    const tools: Anthropic.Tool[] = [
      // Hosted server-side web search tool
      // (the SDK does not require us to handle this — Anthropic executes it)
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: 8,
      } as unknown as Anthropic.Tool,
      SUBMIT_REPORT_TOOL,
    ];

    const result = await runToolLoop({
      model: MODELS.research,
      system: RESEARCH_SYSTEM_PROMPT,
      userMessage: buildResearchUserMessage(input),
      tools,
      terminalTool: "submit_report",
      maxIterations: 16,
      // web_search is server-side; we never need to handle it locally.
      // Provide a no-op handler in case the loop ever sees it as a tool_use block.
      toolHandlers: {
        web_search: () => "(handled server-side)",
      },
    });

    if (!result.terminalToolInput) {
      throw new Error(
        "Claude did not call submit_report. Final text was: " +
          result.finalText.slice(0, 500)
      );
    }

    const parsed = ResearchReportSchema.safeParse(result.terminalToolInput);
    if (!parsed.success) {
      throw new Error(
        "submit_report payload failed validation: " +
          parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ")
      );
    }

    const searchedUrls: string[] = [];
    for (const call of result.toolCalls) {
      if (call.name === "web_search") {
        const r = call.result as unknown;
        if (Array.isArray(r)) {
          for (const item of r) {
            if (item && typeof item === "object" && "url" in item) {
              const url = (item as { url?: unknown }).url;
              if (typeof url === "string") searchedUrls.push(url);
            }
          }
        }
      }
    }

    return {
      report: parsed.data,
      modelUsed: result.modelUsed,
      toolCallCount: result.toolCalls.length,
      searchedUrls,
    };
  }
}
