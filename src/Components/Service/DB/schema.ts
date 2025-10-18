import type { IDBPDatabase, IDBPTransaction } from "idb";

// Database identification
export const DB_NAME = "flashcards-db";
export const DB_VERSION = 1;

// Store names
export const STORES = {
  decks: "decks", 
  cards: "cards", 
  settings: "settings", // keyPath: id ('settings')
  sessions: "sessions", 
  sessionCards: "sessionCards", 
  audio: "audio", 
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

export function upgrade(
  db: IDBPDatabase,
) {
  // Decks
  if (!db.objectStoreNames.contains(STORES.decks)) {
    const s = db.createObjectStore(STORES.decks, {
      keyPath: "id",
      autoIncrement: true,
    });
    s.createIndex("by_name", "name", { unique: false });
    s.createIndex("by_difficulty", "difficulty", { unique: false });
    s.createIndex("by_createdAt", "createdAt", { unique: false });
  }

  // Cards
  if (!db.objectStoreNames.contains(STORES.cards)) {
    const s = db.createObjectStore(STORES.cards, {
      keyPath: "id",
      autoIncrement: true,
    });

    s.createIndex("by_deckIds", "deckIds", { unique: false, multiEntry: true });
    s.createIndex("by_status", "status", { unique: false });
    s.createIndex("by_difficulty", "difficulty", {
      unique: false,
    });
    s.createIndex("by_originalText", "originalText", { unique: false });
    s.createIndex("by_createdAt", "createdAt", { unique: false });
  }


  // Settings (singleton)
  if (!db.objectStoreNames.contains(STORES.settings)) {
    db.createObjectStore(STORES.settings, { keyPath: "id" });
  }

  // Study sessions
  if (!db.objectStoreNames.contains(STORES.sessions)) {
    const s = db.createObjectStore(STORES.sessions, {
      keyPath: "id",
      autoIncrement: true,
    });
    s.createIndex("by_deckId", "deckId", { unique: false });
    s.createIndex("by_startedAt", "startedAt", { unique: false });
  }

  // Study session cards
  if (!db.objectStoreNames.contains(STORES.sessionCards)) {
    const s = db.createObjectStore(STORES.sessionCards, {
      keyPath: "id",
      autoIncrement: true,
    });
    s.createIndex("by_sessionId", "sessionId", { unique: false });
  }

  // Audio assets
  if (!db.objectStoreNames.contains(STORES.audio)) {
    const s = db.createObjectStore(STORES.audio, {
      keyPath: "id",
      autoIncrement: true,
    });
    s.createIndex("by_cardId", "cardId", { unique: false });
  }
}
