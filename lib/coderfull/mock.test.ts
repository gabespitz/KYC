import { describe, expect, it, beforeAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import { MockCoderfullClient } from "./mock";

const TEST_DIR = path.join(process.cwd(), "uploads", "coderfull-outbox");

describe("MockCoderfullClient", () => {
  beforeAll(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  it("creates a client and writes JSON to the outbox", async () => {
    const client = new MockCoderfullClient();
    const { externalId } = await client.createClient({
      legalName: "Test Co",
      primaryContact: {
        name: "Sam",
        email: "sam@test.example.com",
      },
      riskLevel: "LOW",
      signedDocuments: [],
      notes: "",
    });
    expect(externalId).toMatch(/^cf_/);
    const file = path.join(TEST_DIR, externalId, "client.json");
    const exists = await fs
      .access(file)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(true);
    const data = JSON.parse(await fs.readFile(file, "utf8"));
    expect(data.legalName).toBe("Test Co");
  });

  it("writes uploaded documents under the client folder", async () => {
    const client = new MockCoderfullClient();
    const { externalId } = await client.createClient({
      legalName: "Test Co",
      primaryContact: {
        name: "Sam",
        email: "sam@test.example.com",
      },
      riskLevel: "LOW",
      signedDocuments: [],
      notes: "",
    });
    await client.uploadDocument(externalId, {
      name: "msa.pdf",
      buffer: Buffer.from("fake pdf"),
      mimeType: "application/pdf",
    });
    const file = path.join(TEST_DIR, externalId, "documents", "msa.pdf");
    const buf = await fs.readFile(file);
    expect(buf.toString()).toBe("fake pdf");
  });

  it("writes notification emails to the outbox", async () => {
    const client = new MockCoderfullClient();
    await client.notifyAccounts({
      to: ["accounts@example.com"],
      subject: "Hi",
      bodyMarkdown: "Body",
    });
    const files = await fs.readdir(TEST_DIR);
    expect(files.some((f) => f.startsWith("email_"))).toBe(true);
  });
});
