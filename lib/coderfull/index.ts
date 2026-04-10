import type { CoderfullClientInput, HandoffEmail } from "../claude/schemas";
import { MockCoderfullClient } from "./mock";

export interface CoderfullClient {
  createClient(input: CoderfullClientInput): Promise<{ externalId: string }>;
  uploadDocument(
    externalId: string,
    file: { name: string; buffer: Buffer; mimeType: string }
  ): Promise<void>;
  notifyAccounts(email: HandoffEmail): Promise<void>;
}

let _client: CoderfullClient | null = null;

export function getCoderfullClient(): CoderfullClient {
  if (_client) return _client;
  const mode = process.env.CODERFULL_MODE ?? "mock";
  if (mode !== "mock") {
    throw new Error(
      `Unsupported CODERFULL_MODE=${mode}. Only "mock" is implemented in the MVP.`
    );
  }
  _client = new MockCoderfullClient();
  return _client;
}
