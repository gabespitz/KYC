import fs from "node:fs/promises";
import path from "node:path";
import { nanoid } from "nanoid";
import type { CoderfullClient } from "./index";
import type { CoderfullClientInput, HandoffEmail } from "../claude/schemas";

const OUTBOX_DIR = path.join(
  process.env.KYC_UPLOAD_DIR ?? "./uploads",
  "coderfull-outbox"
);

async function ensureOutbox() {
  await fs.mkdir(OUTBOX_DIR, { recursive: true });
}

export class MockCoderfullClient implements CoderfullClient {
  async createClient(input: CoderfullClientInput) {
    await ensureOutbox();
    const externalId = `cf_${nanoid(10)}`;
    const dir = path.join(OUTBOX_DIR, externalId);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(
      path.join(dir, "client.json"),
      JSON.stringify(input, null, 2)
    );
    return { externalId };
  }

  async uploadDocument(
    externalId: string,
    file: { name: string; buffer: Buffer; mimeType: string }
  ) {
    const dir = path.join(OUTBOX_DIR, externalId, "documents");
    await fs.mkdir(dir, { recursive: true });
    const safe = file.name.replace(/[^A-Za-z0-9._-]+/g, "_");
    await fs.writeFile(path.join(dir, safe), file.buffer);
  }

  async notifyAccounts(email: HandoffEmail) {
    await ensureOutbox();
    const file = path.join(
      OUTBOX_DIR,
      `email_${Date.now()}_${nanoid(6)}.json`
    );
    await fs.writeFile(file, JSON.stringify(email, null, 2));
  }
}
