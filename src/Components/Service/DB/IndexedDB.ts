import * as idb from "idb";
import { StoreModel, StoreName } from "./modelMap";
import { LanguageCode } from "../../../lib/types/languages";

export class IndexedDBService {
  private dbPromise: Promise<idb.IDBPDatabase>;
  private dbName: string;

  constructor(
    dbName: string,
    version: number,
    upgradeCallback: (
      db: idb.IDBPDatabase,
      oldVersion: number,
      newVersion: number | null,
      tx: idb.IDBPTransaction<any, any, "versionchange">
    ) => void
  ) {
    this.dbName = dbName;
    this.dbPromise = this.initDB(version, upgradeCallback);
  }

  private async initDB(
    version: number,
    upgradeCallback: (
      db: idb.IDBPDatabase,
      oldVersion: number,
      newVersion: number | null,
      tx: idb.IDBPTransaction<any, any, "versionchange">
    ) => void
  ): Promise<idb.IDBPDatabase> {
    const db = await idb.openDB(this.dbName, version, {
      upgrade: (db, oldVersion, newVersion, tx) => {
        upgradeCallback(
          db as any,
          oldVersion as number,
          (newVersion ?? null) as any,
          tx as any
        );
      },
    });
    return db;
  }

  async get<T extends StoreModel<S>, S extends StoreName>(storeName: S, key: IDBValidKey): Promise<T | undefined> {
    const db = await this.dbPromise;
    return db.get(storeName, key) as any;
  }

  async add<T extends StoreModel<S>, S extends StoreName>(storeName: S, value: T): Promise<IDBValidKey> {
    const db = await this.dbPromise;
    return db.add(storeName, value as any);
  }

  async put<T extends StoreModel<S>, S extends StoreName>(storeName: S, value: T): Promise<IDBValidKey> {
    const db = await this.dbPromise;
    return db.put(storeName, value as any);
  }

  async delete(storeName: StoreName, key: IDBValidKey): Promise<void> {
    const db = await this.dbPromise;
    return db.delete(storeName, key);
  }

  async getAll<T extends StoreModel<S>, S extends StoreName>(storeName: S): Promise<T[]> {
    const db = await this.dbPromise;
    return db.getAll(storeName) as any;
  }

  async getAllFromIndex<T extends StoreModel<S>, S extends StoreName>(
    storeName: S,
    indexName: string,
    query?: IDBValidKey | IDBKeyRange | null
  ): Promise<T[]> {
    const db = await this.dbPromise;
    const tx = db.transaction(storeName);
    const idx = tx.store.index(indexName);
    const results = await idx.getAll(query as any);
    await tx.done;
    return results as any;
  }

  async getByIndex<T extends StoreModel<S>, S extends StoreName>(
    storeName: S,
    indexName: string,
    query: IDBValidKey | IDBKeyRange
  ): Promise<T | undefined> {
    const db = await this.dbPromise;
    const tx = db.transaction(storeName);
    const idx = tx.store.index(indexName);
    const result = await idx.get(query as any);
    await tx.done;
    return result as any;
  }

  async createLanguageIndex(languageCode: LanguageCode): Promise<void> {
    const db = await this.dbPromise;
    const storeName = "cards";
    const indexName = `by_translation_${languageCode}`;

    if (!db.objectStoreNames.contains(storeName)) {
      throw new Error(`Object store ${storeName} does not exist`);
    }

    const s = db.transaction(storeName, "versionchange").objectStore(storeName);
    if (!s.indexNames.contains(indexName)) {
      s.createIndex(indexName, `translation.${languageCode}`, { unique: false });
    }
  }
}
