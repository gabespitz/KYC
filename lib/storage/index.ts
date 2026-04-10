export interface StorageAdapter {
  put(
    key: string,
    data: Buffer,
    mimeType: string
  ): Promise<{ key: string; size: number }>;
  get(key: string): Promise<{ buffer: Buffer; mimeType: string }>;
  delete(key: string): Promise<void>;
}

import { LocalFsStorageAdapter } from "./local";

let _storage: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (_storage) return _storage;
  _storage = new LocalFsStorageAdapter(
    process.env.KYC_UPLOAD_DIR ?? "./uploads"
  );
  return _storage;
}
