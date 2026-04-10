import Anthropic from "@anthropic-ai/sdk";

type AnyContentBlockParam =
  | Anthropic.TextBlockParam
  | Anthropic.ImageBlockParam
  | Anthropic.ToolUseBlockParam
  | Anthropic.ToolResultBlockParam;

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local before calling Claude."
    );
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

export const MODELS = {
  research: process.env.ANTHROPIC_MODEL_RESEARCH ?? "claude-sonnet-4-6",
  redline: process.env.ANTHROPIC_MODEL_REDLINE ?? "claude-opus-4-6",
  handoff: process.env.ANTHROPIC_MODEL_HANDOFF ?? "claude-sonnet-4-6",
} as const;

/**
 * Iterate a Claude tool-use loop until the model emits an `end_turn`
 * stop reason or invokes the terminal tool whose name is `terminalTool`.
 *
 * Returns the parsed input of the terminal tool call (if any) and the
 * full transcript of tool calls (for source validation in Phase 1).
 */
export interface ToolLoopResult {
  terminalToolInput: unknown | null;
  toolCalls: Array<{ name: string; input: unknown; result: unknown }>;
  finalText: string;
  modelUsed: string;
}

export interface ToolLoopOptions {
  model: string;
  system: string;
  userMessage: string;
  tools: Anthropic.Tool[];
  terminalTool: string;
  maxIterations?: number;
  toolHandlers: Record<
    string,
    (input: unknown) => Promise<unknown> | unknown
  >;
  onProgress?: (event: { type: string; data: unknown }) => void;
}

export async function runToolLoop(
  opts: ToolLoopOptions
): Promise<ToolLoopResult> {
  const client = getAnthropic();
  const max = opts.maxIterations ?? 12;

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: opts.userMessage },
  ];
  const toolCalls: ToolLoopResult["toolCalls"] = [];
  let finalText = "";
  let terminalToolInput: unknown | null = null;

  for (let i = 0; i < max; i++) {
    const response = await client.messages.create({
      model: opts.model,
      max_tokens: 8192,
      system: opts.system,
      tools: opts.tools,
      messages,
    });

    opts.onProgress?.({ type: "iteration", data: { i, stop: response.stop_reason } });

    // Capture text fragments
    for (const block of response.content) {
      if (block.type === "text") finalText += block.text;
    }

    if (response.stop_reason === "tool_use") {
      const assistantContent: AnyContentBlockParam[] = response.content.map(
        (b) => b as unknown as AnyContentBlockParam
      );
      messages.push({ role: "assistant", content: assistantContent });

      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      let sawTerminal = false;

      for (const tu of toolUseBlocks) {
        opts.onProgress?.({
          type: "tool_call",
          data: { name: tu.name, input: tu.input },
        });

        if (tu.name === opts.terminalTool) {
          terminalToolInput = tu.input;
          sawTerminal = true;
          toolCalls.push({ name: tu.name, input: tu.input, result: "ok" });
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: "ok",
          });
          continue;
        }

        const handler = opts.toolHandlers[tu.name];
        if (!handler) {
          const err = `Unknown tool: ${tu.name}`;
          toolCalls.push({ name: tu.name, input: tu.input, result: { error: err } });
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: err,
            is_error: true,
          });
          continue;
        }

        try {
          const result = await handler(tu.input);
          toolCalls.push({ name: tu.name, input: tu.input, result });
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content:
              typeof result === "string" ? result : JSON.stringify(result),
          });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          toolCalls.push({ name: tu.name, input: tu.input, result: { error: msg } });
          toolResults.push({
            type: "tool_result",
            tool_use_id: tu.id,
            content: msg,
            is_error: true,
          });
        }
      }

      messages.push({ role: "user", content: toolResults });

      if (sawTerminal) {
        return {
          terminalToolInput,
          toolCalls,
          finalText,
          modelUsed: opts.model,
        };
      }
      continue;
    }

    // end_turn or other terminal stop reason
    break;
  }

  return {
    terminalToolInput,
    toolCalls,
    finalText,
    modelUsed: opts.model,
  };
}
