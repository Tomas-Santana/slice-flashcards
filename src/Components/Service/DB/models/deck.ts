import type { DifficultyBand } from "./common";

export interface Deck {
  id: number;
  name: string;
  difficulty: DifficultyBand;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
}
