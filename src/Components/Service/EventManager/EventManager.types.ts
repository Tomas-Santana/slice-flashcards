// Centralized event typings for the app EventManager

// Define concrete event payloads here
export interface AppEventMap {
  // Settings changed: payload is the settings object or partial
  "settings:updated": {
    id: "settings";
    baseLanguage?: string;
    targetLanguage?: string;
    languages?: string[];
  };

  // Card events
  "card:created": { cardId: number };
  "card:updated": { cardId: number };
  "card:deleted": { cardId: number };

  // Deck events
  "deck:created": { deckId: number };
  "deck:updated": { deckId: number };
  "deck:deleted": { deckId: number };

  // Study/session events
  "study:session:start": { sessionId: number };
  "study:session:end": { sessionId: number };

  // Audio upload/ready
  "audio:added": { audioId: number; cardId?: number };

  "sidebar:toggle": {};

  "modal:newCard:open": { cardId?: number };
  "modal:newDeck:open": { deckId?: number };
}

export type EventName = keyof AppEventMap;
export type EventPayload<E extends EventName> = AppEventMap[E];
