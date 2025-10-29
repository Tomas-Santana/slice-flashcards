import { EventName, EventPayload } from "./EventManager.types";

type Handler<E extends EventName> = (payload: EventPayload<E>) => void;

/**
 * Lightweight typed pub/sub EventManager.
 * - subscribe: listen to events
 * - once: listen for a single occurrence
 * - unsubscribe: remove a handler
 * - publish: emit an event to listeners
 */
export class EventManager {
  private listeners: Map<string, Set<Function>> = new Map();

  subscribe<E extends EventName>(event: E, handler: Handler<E>): () => void {
    const key = String(event);
    let set = this.listeners.get(key);
    if (!set) {
      set = new Set();
      this.listeners.set(key, set);
    }
    set.add(handler as Function);

    return () => this.unsubscribe(event, handler);
  }

  subscribeToMultiple<E extends EventName>(events: E[], handler: Handler<E>): () => void {
    const unsubscribers = events.map((event) => this.subscribe(event, handler));
    return () => unsubscribers.forEach((unsub) => unsub());
  }

  once<E extends EventName>(event: E, handler: Handler<E>): () => void {
    const wrapper = (payload: EventPayload<E>) => {
      try {
        handler(payload);
      } finally {
        this.unsubscribe(event, wrapper as Handler<E>);
      }
    };

    return this.subscribe(event, wrapper as Handler<E>);
  }

  unsubscribe<E extends EventName>(event: E, handler: Handler<E>): void {
    const key = String(event);
    const set = this.listeners.get(key);
    if (!set) return;
    set.delete(handler as Function);
    if (set.size === 0) this.listeners.delete(key);
  }

  publish<E extends EventName>(event: E, payload: EventPayload<E>): void {
    const key = String(event);
    const set = this.listeners.get(key);
    if (!set) return;
    // Create a shallow copy to avoid mutation during iteration
    const toCall = Array.from(set);
    for (const fn of toCall) {
      try {
        // cast is safe because handlers were added through subscribe
        (fn as Handler<E>)(payload);
      } catch (err) {
        // Swallow errors in listeners to avoid breaking the publisher chain
        // Consider logging in the future
        console.error("[EventManager] handler error for", key, err);
      }
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

// Export a singleton for app-wide use
export const eventManager = new EventManager();

export default eventManager;
