import fs from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from "./index";

const META_SUFFIX = ".meta.json";

export class LocalFsStorageAdapter implements StorageAdapter {
  constructor(private readonly root: string) {}

  private resolve(key: string) {
    // Refuse path traversal
    if (key.includes("..") || path.isAbsolute(key)) {
      throw new Error(`Invalid storage key: ${key}`);
    }
    return path.join(this.root, key);
  }

  async put(key: string, data: Buffer, mimeType: string) {
    const target = this.resolve(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, data);
    await fs.writeFile(
      target + META_SUFFIX,
      JSON.stringify({ mimeType, size: data.length })
    );
    return { key, size: data.length };
  }

  async get(key: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const target = this.resolve(key);
    const buffer = await fs.readFile(target);
    let mimeType = "application/octet-stream";
    try {
      const meta = JSON.parse(await fs.readFile(target + META_SUFFIX, "utf8"));
      if (typeof meta.mimeType === "string") mimeType = meta.mimeType;
    } catch {
      // ignore missing meta
    }
    return { buffer, mimeType };
  }

  async delete(key: string) {
    const target = this.resolve(key);
    await fs.rm(target, { force: true });
    await fs.rm(target + META_SUFFIX, { force: true });
  }
}
