import { openDB, type IDBPDatabase } from "idb";

export interface CachedGeneration {
  id: string;
  user_id: string;
  type: "email" | "notes" | "tasks" | "presentation" | "diagram";
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  updated_at: string;
  created_at: string;
}

let _db: Promise<IDBPDatabase> | null = null;
function db() {
  if (typeof indexedDB === "undefined") return null;
  if (!_db) {
    _db = openDB("sawubona-cache", 1, {
      upgrade(d) {
        const s = d.createObjectStore("generations", { keyPath: "id" });
        s.createIndex("by_user_updated", ["user_id", "updated_at"]);
      },
    });
  }
  return _db;
}

export async function cachePut(g: CachedGeneration) {
  const d = await db(); if (!d) return;
  await d.put("generations", g);
}
export async function cachePutMany(rows: CachedGeneration[]) {
  const d = await db(); if (!d) return;
  const tx = d.transaction("generations", "readwrite");
  await Promise.all(rows.map((r) => tx.store.put(r)));
  await tx.done;
}
export async function cacheDelete(id: string) {
  const d = await db(); if (!d) return;
  await d.delete("generations", id);
}
export async function cacheList(userId: string): Promise<CachedGeneration[]> {
  const d = await db(); if (!d) return [];
  const all = (await d.getAll("generations")) as CachedGeneration[];
  return all.filter((r) => r.user_id === userId)
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
}
export async function cacheGet(id: string): Promise<CachedGeneration | undefined> {
  const d = await db(); if (!d) return undefined;
  return (await d.get("generations", id)) as CachedGeneration | undefined;
}
