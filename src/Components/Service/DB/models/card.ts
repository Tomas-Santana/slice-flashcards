import type {
  DifficultyBand,
} from "./common";
import type { LanguageCode } from '@/lib/types/languages';

// A single flashcard entity
export interface Card {
  id: number;
  deckIds: number[];
  originalText: string;
  translation: Record<LanguageCode, string>;
  exampleSentence?: Record<LanguageCode, string>;
  notes?: string;

  difficulty: DifficultyBand;

  audioAssetId?: Record<LanguageCode, number>; // audio per language

  progressScore?: Record<LanguageCode, number>; // 0..1 for dashboard progress

  repetitions?: Record<LanguageCode, number>; // successful reviews in a row
  totalAttempts?: Record<LanguageCode, number>; // total review attempts
  totalSuccesses?: Record<LanguageCode, number>; // total successful reviews
  lastReviewedAt?: Record<LanguageCode, Date>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
