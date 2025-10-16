import type { EpochMs, StudyMode } from "./common";

export interface StudySession {
  id?: number;
  mode: StudyMode;
  timed: boolean;
  deckId?: number;
  categoryFilter?: string;
  startedAt: EpochMs;
  endedAt?: EpochMs;
  cardsStudied: number;
}
