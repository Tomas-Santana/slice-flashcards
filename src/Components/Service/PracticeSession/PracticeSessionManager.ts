/**
 * PracticeSessionManager
 * Manages practice session state, card progression, and statistics
 */

import { openDatabase } from "@/Components/Service/DB/openDatabase";
import type { Card } from "@/Components/Service/DB/models/card";
import type { Deck } from "@/Components/Service/DB/models/deck";
import type { StudySession } from "@/Components/Service/DB/models/studySession";
import type { Settings } from "@/Components/Service/DB/models/settings";
import type {
  DifficultyBand,
  StudyMode,
} from "@/Components/Service/DB/models/common";
import {
  compareAnswers,
  type AnswerComparisonResult,
} from "@/lib/utils/answerComparison";
import type { LanguageCode } from "@/lib/types/languages";

export interface SessionProgress {
  current: number;
  total: number;
  correct: number;
  incorrect: number;
  remaining: number;
}

export interface SessionConfig {
  deckId: number;
  difficulty: DifficultyBand;
  timed: boolean;
}

export class PracticeSessionManager {
  private db = openDatabase();
  private currentSession: StudySession | null = null;
  private cards: Card[] = [];
  private currentIndex: number = 0;
  private settings: Settings | null = null;
  private correctCount: number = 0;
  private incorrectCount: number = 0;
  private deck: Deck | null = null;

  /**
   * Initializes and starts a new practice session
   */
  async startSession(config: SessionConfig): Promise<void> {
    // Load settings
    this.settings = await this.db.get("settings", "settings");

    // Load cards for the session
    if (config.deckId === -1) {
      // Random practice: load all cards and take a random sample
      const allCards = await this.db.getAll("cards");

      // Shuffle all cards first
      for (let i = allCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
      }

      // Take first 20 cards (already shuffled)
      this.cards = allCards.slice(0, 20);
    } else {
      // Specific deck: load deck and its cards
      this.deck = await this.db.get("decks", config.deckId);
      if (!this.deck) {
        throw new Error(`Deck with ID ${config.deckId} not found`);
      }

      // Load cards from deck
      const loadedCards: Card[] = [];

      for (const cardId of this.deck.cardIds) {
        const card = await this.db.get("cards", cardId);
        if (card) {
          loadedCards.push(card);
        }
      }
      this.cards = loadedCards;
    }

    // Filter cards by difficulty
    this.cards = this.filterCardsByDifficulty(this.cards, config.difficulty);

    if (this.cards.length === 0) {
      throw new Error("No cards available for this difficulty level");
    }

    // Shuffle cards for random order (for specific decks, or after filtering)
    this.shuffleCards();

    // Determine study mode based on difficulty
    const mode: StudyMode =
      config.difficulty === "intermediate" || config.difficulty === "advanced"
        ? "training"
        : "free";

    // Create study session record
    this.currentSession = {
      id: Date.now(),
      mode,
      timed: config.timed,
      deckId: config.deckId === -1 ? undefined : config.deckId,
      startedAt: new Date(),
      cardsStudied: 0,
    };

    await this.db.add("sessions", this.currentSession);

    // Reset progress counters
    this.currentIndex = 0;
    this.correctCount = 0;
    this.incorrectCount = 0;
  }

  /**
   * Filters cards based on minimum difficulty level
   */
  private filterCardsByDifficulty(
    cards: Card[],
    minDifficulty: DifficultyBand
  ): Card[] {
    const difficultyOrder: Record<DifficultyBand, number> = {
      basic: 1,
      intermediate: 2,
      advanced: 3,
    };

    const minLevel = difficultyOrder[minDifficulty];

    return cards.filter((card) => {
      const cardLevel = difficultyOrder[card.difficulty];
      return cardLevel >= minLevel;
    });
  }

  /**
   * Shuffles the cards array using Fisher-Yates algorithm
   */
  private shuffleCards(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Gets the current card being studied
   */
  getCurrentCard(): Card | null {
    if (this.currentIndex >= this.cards.length) {
      return null;
    }
    return this.cards[this.currentIndex];
  }

  /**
   * Gets the current language for the session
   */
  getCurrentLanguage(): LanguageCode {
    return this.settings?.selectedLanguage || "en";
  }

  /**
   * Checks user's answer against the current card
   */
  checkAnswer(userAnswer: string): AnswerComparisonResult {
    const currentCard = this.getCurrentCard();
    if (!currentCard) {
      throw new Error("No current card to check answer against");
    }

    const correctAnswer = currentCard.originalText;
    return compareAnswers(userAnswer, correctAnswer);
  }

  /**
   * Updates card statistics after an answer attempt
   */
  async updateCardStatistics(
    cardId: number,
    isCorrect: boolean
  ): Promise<void> {
    const card = await this.db.get("cards", cardId);
    if (!card) return;

    const lang = this.getCurrentLanguage();

    // Initialize objects if they don't exist
    if (!card.totalAttempts)
      card.totalAttempts = {} as Record<LanguageCode, number>;
    if (!card.totalSuccesses)
      card.totalSuccesses = {} as Record<LanguageCode, number>;
    if (!card.repetitions)
      card.repetitions = {} as Record<LanguageCode, number>;
    if (!card.lastReviewedAt)
      card.lastReviewedAt = {} as Record<LanguageCode, Date>;
    if (!card.progressScore)
      card.progressScore = {} as Record<LanguageCode, number>;

    // Update counters
    card.totalAttempts[lang] = (card.totalAttempts[lang] || 0) + 1;

    if (isCorrect) {
      card.totalSuccesses[lang] = (card.totalSuccesses[lang] || 0) + 1;
      card.repetitions[lang] = (card.repetitions[lang] || 0) + 1;
    } else {
      // Reset streak on incorrect answer
      card.repetitions[lang] = 0;
    }

    // Calculate progress score (0-1 based on success rate + repetition bonus)
    const attempts = card.totalAttempts[lang];
    const successes = card.totalSuccesses[lang] || 0;
    const repetitions = card.repetitions[lang] || 0;

    // Base score from success rate (0-1)
    const successRate = attempts > 0 ? successes / attempts : 0;

    // Repetition bonus: logarithmic scale to reward streaks without over-weighting
    // Max bonus of 0.3 at 10+ repetitions
    const repetitionBonus = Math.min(0.3, repetitions * 0.03);

    // Final score: base success rate + repetition bonus (capped at 1.0)
    card.progressScore[lang] = Math.min(1.0, successRate + repetitionBonus);

    // Update timestamps
    card.lastReviewedAt[lang] = new Date();
    card.updatedAt = new Date();

    await this.db.put("cards", card);

    // Update session counters
    if (isCorrect) {
      this.correctCount++;
    } else {
      this.incorrectCount++;
    }
  }

  /**
   * Moves to the next card in the session
   * Returns true if there are more cards, false if session is complete
   */
  async moveToNextCard(): Promise<boolean> {
    this.currentIndex++;

    // Update session cards studied count
    if (this.currentSession) {
      this.currentSession.cardsStudied = this.currentIndex;
      await this.db.put("sessions", this.currentSession);
    }

    return this.currentIndex < this.cards.length;
  }

  /**
   * Gets the current progress of the session
   */
  getProgress(): SessionProgress {
    return {
      current: this.currentIndex + 1,
      total: this.cards.length,
      correct: this.correctCount,
      incorrect: this.incorrectCount,
      remaining: this.cards.length - this.currentIndex - 1,
    };
  }

  /**
   * Gets the session statistics
   */
  getSessionStats() {
    const totalStudied = this.currentIndex;
    const accuracy =
      totalStudied > 0 ? (this.correctCount / totalStudied) * 100 : 0;

    return {
      cardsStudied: totalStudied,
      correct: this.correctCount,
      incorrect: this.incorrectCount,
      accuracy: Math.round(accuracy),
      timeStarted: this.currentSession?.startedAt,
      timed: this.currentSession?.timed || false,
    };
  }

  /**
   * Ends the current session and saves final data
   */
  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.endedAt = new Date();
    this.currentSession.cardsStudied = this.currentIndex;

    await this.db.put("sessions", this.currentSession);
  }

  /**
   * Checks if the session is complete (all cards studied)
   */
  isSessionComplete(): boolean {
    return this.currentIndex >= this.cards.length;
  }

  /**
   * Gets the deck information if practicing a specific deck
   */
  getDeck(): Deck | null {
    return this.deck;
  }

  /**
   * Gets all cards in the session (useful for review)
   */
  getAllCards(): Card[] {
    console.log("Returning cards:", this.cards);
    return this.cards;
  }

  /**
   * Gets cards that were answered incorrectly (for review)
   */
  getIncorrectCards(): Card[] {
    // This would need tracking which specific cards were incorrect
    // For now, returns empty array - can be enhanced later
    return [];
  }

  /**
   * Resets the session to start over with the same cards
   */
  async restartSession(): Promise<void> {
    this.currentIndex = 0;
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.shuffleCards();

    // Create a new session
    if (this.currentSession) {
      const mode = this.currentSession.mode;
      const timed = this.currentSession.timed;
      const deckId = this.currentSession.deckId;

      this.currentSession = {
        id: Date.now(),
        mode,
        timed,
        deckId,
        startedAt: new Date(),
        cardsStudied: 0,
      };

      await this.db.add("sessions", this.currentSession);
    }
  }
}
