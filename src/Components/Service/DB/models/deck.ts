import type { DifficultyBand, EpochMs, LanguageCode } from "./common";

export interface Deck {
  id: number;
  name: string;
  topic?: string[]; // temas o categorías
  level?: DifficultyBand;

  baseLanguage?: LanguageCode;
  targetLanguage?: LanguageCode;

  cardCount?: number;

  createdAt: EpochMs;
  updatedAt: EpochMs;
}
