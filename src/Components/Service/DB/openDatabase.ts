import { IndexedDBService } from "./IndexedDB";
import { DB_NAME, DB_VERSION, upgrade } from "./schema";

let _db: IndexedDBService | null = null;

export function openDatabase() {
  if (_db) return _db;
  _db = new IndexedDBService(DB_NAME, DB_VERSION, upgrade);
  return _db;
}
