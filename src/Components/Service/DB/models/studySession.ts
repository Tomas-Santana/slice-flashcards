import type { StudyMode } from "./common";

export interface StudySession {
  id: number;
  mode: StudyMode;
  timed: boolean;
  deckId?: number;
  startedAt: Date;
  endedAt?: Date;
  cardsStudied: number;
}
