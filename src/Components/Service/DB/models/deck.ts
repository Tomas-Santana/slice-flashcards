import type { DifficultyBand } from "./common";

export interface Deck {
  id: number;
  emoji: string;
  name: string;
  difficulty: DifficultyBand;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
  cardIds: number[];
}
