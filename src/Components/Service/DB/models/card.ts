import type {
  EpochMs,
  PersonalDifficulty,
  LanguageCode,
} from "./common";

// A single flashcard entity
export interface Card {
  id?: number;

  deckIds: number[];
  targetText: string;
  baseTranslation: string;
  exampleSentence?: string;
  notes?: string;

  baseLanguage: LanguageCode; 
  targetLanguage: LanguageCode; 

  topic?: string[]; 
  personalDifficulty?: PersonalDifficulty;

  audioAssetId?: number;

  progressScore?: number; // 0..1 for dashboard progress

  repetitions?: number; // successful reviews in a row
  lastReviewedAt?: EpochMs;

  // Timestamps
  createdAt: EpochMs;
  updatedAt: EpochMs;
}
