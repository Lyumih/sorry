import type { ApologyEntry, NewApologyEntry } from "../types/apologyEntry.ts";
import {
  DB_NAME,
  DB_VERSION,
  INDEX_CREATED_AT,
  STORE_ENTRIES,
} from "./constants.ts";

function isValidIso8601(value: string): boolean {
  const t = Date.parse(value);
  return Number.isFinite(t);
}

function assertApologyEntry(entry: ApologyEntry): void {
  if (typeof entry.id !== "string" || entry.id.length === 0) {
    throw new TypeError("ApologyEntry.id must be a non-empty string");
  }
  if (!isValidIso8601(entry.createdAt)) {
    throw new TypeError("ApologyEntry.createdAt must be a valid ISO 8601 date string");
  }
  if (typeof entry.toWhom !== "string") {
    throw new TypeError("ApologyEntry.toWhom must be a string");
  }
  if (typeof entry.reason !== "string") {
    throw new TypeError("ApologyEntry.reason must be a string");
  }
  if (typeof entry.reflection !== "string") {
    throw new TypeError("ApologyEntry.reflection must be a string");
  }
}

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function promisifyTransaction(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
    tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
  });
}

let dbPromise: Promise<IDBDatabase> | null = null;

export function openApologyDatabase(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => {
        reject(req.error ?? new Error("IndexedDB open failed"));
      };
      req.onsuccess = () => {
        resolve(req.result);
      };
      req.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_ENTRIES)) {
          const store = db.createObjectStore(STORE_ENTRIES, { keyPath: "id" });
          store.createIndex(INDEX_CREATED_AT, "createdAt", { unique: false });
        }
      };
    });
  }
  return dbPromise;
}

/**
 * Создаёт запись с новым UUID. Поле `createdAt` должно быть валидной ISO 8601 строкой.
 */
export async function addEntry(entry: NewApologyEntry): Promise<ApologyEntry> {
  const full: ApologyEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };
  assertApologyEntry(full);
  const db = await openApologyDatabase();
  const tx = db.transaction(STORE_ENTRIES, "readwrite");
  const store = tx.objectStore(STORE_ENTRIES);
  await promisifyRequest(store.add(full));
  await promisifyTransaction(tx);
  return full;
}

/** Обновляет существующую запись по `id`. */
export async function updateEntry(entry: ApologyEntry): Promise<void> {
  assertApologyEntry(entry);
  const db = await openApologyDatabase();
  const tx = db.transaction(STORE_ENTRIES, "readwrite");
  const store = tx.objectStore(STORE_ENTRIES);
  await promisifyRequest(store.put(entry));
  await promisifyTransaction(tx);
}

/** Удаляет запись по идентификатору. */
export async function deleteEntry(id: string): Promise<void> {
  if (typeof id !== "string" || id.length === 0) {
    throw new TypeError("deleteEntry: id must be a non-empty string");
  }
  const db = await openApologyDatabase();
  const tx = db.transaction(STORE_ENTRIES, "readwrite");
  const store = tx.objectStore(STORE_ENTRIES);
  await promisifyRequest(store.delete(id));
  await promisifyTransaction(tx);
}

function normalizeRow(raw: unknown): ApologyEntry {
  const r = raw as Record<string, unknown>;
  return {
    id: String(r.id),
    createdAt: String(r.createdAt),
    toWhom: String(r.toWhom ?? ""),
    reason: String(r.reason ?? ""),
    reflection: String(r.reflection ?? ""),
  };
}

/** Все записи, от новых к старым по `createdAt`. Устаревшее поле `phraseType` из IndexedDB отбрасывается. */
export async function getAllEntries(): Promise<ApologyEntry[]> {
  const db = await openApologyDatabase();
  const tx = db.transaction(STORE_ENTRIES, "readonly");
  const store = tx.objectStore(STORE_ENTRIES);
  const index = store.index(INDEX_CREATED_AT);
  const rows = await promisifyRequest(index.getAll() as IDBRequest<unknown[]>);
  await promisifyTransaction(tx);
  const sorted = [...rows]
    .map(normalizeRow)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return sorted;
}
