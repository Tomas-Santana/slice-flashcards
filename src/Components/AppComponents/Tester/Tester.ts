import type { TesterProps } from "./Tester.types";
import type PracticeCountDown from "@/Components/Visual/PracticeCountDown/PracticeCountDown";
import type CardCarousel from "@/Components/Visual/CardCarousel/CardCarousel";
import type PracticeAnswerForm from "@/Components/Visual/PracticeAnswerForm/PracticeAnswerForm";
import type AnswerFeedback from "@/Components/Visual/AnswerFeedback/AnswerFeedback";
import type PracticeEndFeedback from "@/Components/Visual/PracticeEndFeedback/PracticeEndFeedback";
import type PracticeTimer from "@/Components/Visual/PracticeTimer/PracticeTimer";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import type { Card } from "@/Components/Service/DB/models/card";
import html from "@/lib/render";
import type { Deck } from "@/Components/Service/DB/models/deck";
import { PracticeSessionManager } from "@/Components/Service/PracticeSession/PracticeSessionManager";
import type { AnswerComparisonResult } from "@/lib/utils/answerComparison";
import type { DifficultyBand } from "@/Components/Service/DB/models/common";

export default class Tester extends HTMLElement {
  static props = {
    params: { type: Object },
  };

  private db = openDatabase();
  private $countdown: PracticeCountDown | null = null;
  private $carousel: CardCarousel | null = null;
  private $answerForm: PracticeAnswerForm | null = null;
  private $timer: PracticeTimer | null = null;
  private sessionManager: PracticeSessionManager | null = null;
  private cards: Card[] = [];
  private deckId: number = -1;
  private deck: Deck | null = null;
  private difficulty: DifficultyBand = "basic";
  private timed: boolean = false;

  constructor(props: TesterProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
  }

  async init() {
    // Get deck ID and query params from route

    // @ts-ignore - params is provided by slice router
    this.deckId = window.location.pathname.split("/").pop()
      ? parseInt(window.location.pathname.split("/").pop() as string, 10)
      : -1;

    // Get difficulty and timed from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    this.difficulty =
      (urlParams.get("difficulty") as DifficultyBand) || "basic";
    this.timed = urlParams.get("timed") === "true";

    // Initialize session manager
    this.sessionManager = new PracticeSessionManager();

    // Start the practice session
    await this.sessionManager.startSession({
      deckId: this.deckId,
      difficulty: this.difficulty,
      timed: this.timed,
    });

    // Get cards from session manager
    this.cards = this.sessionManager.getAllCards();
    this.deck = this.sessionManager.getDeck();

    // Show carousel and form
    await this.showCarousel();

    // Create timer if session is timed
    if (this.timed) {
      this.$timer = (await window.slice.build(
        "PracticeTimer",
        {}
      )) as PracticeTimer;

      // Create timer container with absolute positioning
      const timerContainer = html`
        <div class="timer-container fixed top-4 right-4 z-50">
          ${this.$timer}
        </div>
      `;
      this.appendChild(timerContainer);
    }

    // Show countdown
    this.$countdown = await window.slice.build("PracticeCountDown", {
      countFrom: 3,
      onComplete: () => {
        console.log("Countdown complete!");
        this.$countdown?.remove();
        this.$countdown = null;

        // Start timer if timed session
        if (this.timed && this.$timer) {
          this.$timer.start();
        }

        // Focus the input after countdown
        this.$answerForm?.focusInput();
      },
    });

    this.appendChild(this.$countdown);
  }

  private async showCarousel() {
    if (this.cards.length === 0) {
      // Show no cards message
      const message = html`
        <div class="flex items-center justify-center h-screen">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-font-primary mb-4">
              No hay tarjetas para practicar
            </h2>
            <p class="text-font-secondary">Este mazo no contiene tarjetas.</p>
            <a href="/" class="text-blue-500 hover:underline"
              >Volver al inicio</a
            >
          </div>
        </div>
      `;
      this.appendChild(message);
      return;
    }

    // Get front language from session manager
    const frontLanguage = this.sessionManager!.getCurrentLanguage();

    // Create carousel
    this.$carousel = (await window.slice.build("CardCarousel", {
      cards: this.cards,
      frontLanguage,
    })) as CardCarousel;

    // Create answer form
    const currentCard = this.sessionManager!.getCurrentCard();
    if (!currentCard) return;

    this.$answerForm = (await window.slice.build("PracticeAnswerForm", {
      currentCard,
      onCorrectAnswer: (result: AnswerComparisonResult) =>
        this.handleCorrectAnswer(result),
      onWrongAnswer: (result: AnswerComparisonResult) =>
        this.handleWrongAnswer(result),
    })) as PracticeAnswerForm;

    // Create progress indicator
    const progress = this.sessionManager!.getProgress();
    const $progressText = html`
      <div class="progress-text text-font-secondary text-sm">
        Tarjeta ${progress.current} de ${progress.total}
      </div>
    `;

    // Create container with carousel and form
    const container = html`
      <div class="tester-container flex flex-col h-screen p-8 gap-6">
        <!-- Progress indicator -->
        <div class="progress-section text-center">${$progressText}</div>

        <!-- Card display -->
        <div class="flex-1 flex items-center justify-center min-h-0">
          ${this.$carousel}
        </div>

        <!-- Answer form -->
        <div class="answer-section flex items-center justify-center pb-8">
          ${this.$answerForm}
        </div>
      </div>
    `;
    this.appendChild(container);
  }

  private async handleCorrectAnswer(result: AnswerComparisonResult) {
    const currentCard = this.sessionManager!.getCurrentCard();
    if (!currentCard) return;

    this.$carousel.$currentCard.flip();

    // Show feedback message
    await this.showFeedbackMessage(result, true);

    // Update card statistics
    await this.sessionManager!.updateCardStatistics(currentCard.id, true);

    // Move to next card
    await this.moveToNextCard();
  }

  private async handleWrongAnswer(result: AnswerComparisonResult) {
    const currentCard = this.sessionManager!.getCurrentCard();
    if (!currentCard) return;

    this.$carousel.$currentCard.flip();

    // Show feedback message
    await this.showFeedbackMessage(result, false);

    // Update card statistics
    await this.sessionManager!.updateCardStatistics(currentCard.id, false);

    // Move to next card
    await this.moveToNextCard();
  }

  private async showFeedbackMessage(
    result: AnswerComparisonResult,
    isCorrect: boolean
  ) {
    // Create feedback component
    const feedback = (await window.slice.build("AnswerFeedback", {
      result,
      isCorrect,
    })) as AnswerFeedback;

    // Add to DOM
    document.body.appendChild(feedback);

    // Show with animation
    await feedback.show();

    // Remove from DOM
    feedback.remove();
  }

  private async moveToNextCard() {
    // Check if there are more cards
    const hasNext = await this.sessionManager!.moveToNextCard();

    if (hasNext) {
      // Move carousel to next card
      await this.$carousel?.nextCard();

      // Update form with new card
      const nextCard = this.sessionManager!.getCurrentCard();
      if (nextCard && this.$answerForm) {
        this.$answerForm.setCurrentCard(nextCard);
      }

      // Update progress indicator
      this.updateProgress();
    } else {
      // Session complete
      await this.sessionManager!.endSession();
      this.showSessionSummary();
    }
  }

  private updateProgress() {
    const progress = this.sessionManager!.getProgress();
    const $progressText = this.querySelector(".progress-text");
    if ($progressText) {
      $progressText.textContent = `Tarjeta ${progress.current} de ${progress.total}`;
    }
  }

  private async showSessionSummary() {
    const stats = this.sessionManager!.getSessionStats();

    // Stop timer if it exists and get elapsed time
    let timeElapsed: string | undefined;
    if (this.$timer) {
      this.$timer.pause();
      timeElapsed = this.$timer.getFormattedTime();
    }

    // Create end feedback component
    const endFeedback = (await window.slice.build("PracticeEndFeedback", {
      stats,
      timeElapsed,
    })) as PracticeEndFeedback;

    // Clear container and show summary
    const container = this.querySelector(".tester-container");
    if (container) {
      container.innerHTML = "";
      container.appendChild(endFeedback);
    }

    // Remove timer from display
    const timerContainer = this.querySelector(".timer-container");
    if (timerContainer) {
      timerContainer.remove();
    }
  }

  async update() {
    // Component update logic (can be async)
  }
}

customElements.define("slice-tester", Tester);
