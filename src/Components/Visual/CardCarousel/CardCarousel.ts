import type { CardCarouselProps } from "./CardCarousel.types";
import html from "@/lib/render";
import type Flashcard from "../Flashcard/Flashcard";
import {
  animateCardEntrance,
  animateCardExit,
} from "@/lib/utils/cardAnimations";
import type { Card } from "@/Components/Service/DB/models/card";

export default class CardCarousel extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: CardCarouselProps;
  private currentIndex: number = 0;
  private $container: HTMLElement | null = null;
  $currentCard: Flashcard | null = null;
  private isAnimating: boolean = false;

  constructor(props: CardCarouselProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    const fragment = await this.getTemplate();
    this.appendChild(fragment);

    // Render first card if available
    if (this.props.cards.length > 0) {
      await this.renderCard(0);
    }
  }

  async getTemplate() {
    return html`
      <div
        class="card-carousel-container relative w-full h-full flex items-center justify-center"
      >
        <!-- Cards will be rendered here dynamically -->
      </div>
    `;
  }

  private async renderCard(index: number, animate: boolean = true) {
    if (index < 0 || index >= this.props.cards.length) {
      console.log("Invalid index:", index);
      return;
    }

    this.$container = this.querySelector(".card-carousel-container");
    if (!this.$container) {
      console.log("Container not found");
      return;
    }

    const card = this.props.cards[index];
    console.log("Rendering card:", index, card.originalText);

    // Build new flashcard first
    const newFlashcard = (await window.slice.build("Flashcard", {
      card,
      frontLanguage: this.props.frontLanguage,
      showFlipButton: false,
      showEditButton: false,
      selectable: false,
    })) as Flashcard;

    // Set initial position for animation if needed
    if (animate) {
      newFlashcard.style.opacity = "0";
      newFlashcard.style.transform = "translateX(100px)";
    }

    // If there's a current card, animate it out first
    if (this.$currentCard && animate) {
      this.isAnimating = true;
      console.log("Animating out current card");
      await animateCardExit(this.$currentCard);
      this.$currentCard.remove();
    } else if (this.$currentCard) {
      // No animation, just remove
      console.log("Removing current card without animation");
      this.$currentCard.remove();
    }

    // Add to DOM
    this.$container.appendChild(newFlashcard);
    this.$currentCard = newFlashcard;

    // Wait for next frame to ensure element is in DOM
    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (animate) {
      console.log("Animating in new card");
      this.isAnimating = true;
      await animateCardEntrance(newFlashcard);
      this.isAnimating = false;
    }

    console.log("Render complete, isAnimating:", this.isAnimating);
  }

  /**
   * Move to the next card in the carousel
   * Returns true if there was a next card, false if at the end
   */
  async nextCard(): Promise<boolean> {
    // Prevent multiple animations at once
    if (this.isAnimating) {
      return false;
    }

    if (this.currentIndex < this.props.cards.length - 1) {
      this.currentIndex++;
      await this.renderCard(this.currentIndex);
      return true;
    }

    return false;
  }

  /**
   * Move to the previous card in the carousel
   * Returns true if there was a previous card, false if at the beginning
   */
  async previousCard(): Promise<boolean> {
    // Prevent multiple animations at once
    if (this.isAnimating) {
      return false;
    }

    if (this.currentIndex > 0) {
      this.currentIndex--;
      await this.renderCard(this.currentIndex);
      return true;
    }

    return false;
  }

  /**
   * Jump to a specific card index
   */
  async goToCard(index: number): Promise<boolean> {
    if (this.isAnimating) {
      return false;
    }

    if (
      index >= 0 &&
      index < this.props.cards.length &&
      index !== this.currentIndex
    ) {
      this.currentIndex = index;
      await this.renderCard(this.currentIndex);
      return true;
    }

    return false;
  }

  /**
   * Get the current card data
   */
  getCurrentCardData(): Card | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.props.cards.length) {
      return this.props.cards[this.currentIndex];
    }
    return null;
  }

  /**
   * Get the current card index
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }

  /**
   * Get total number of cards
   */
  getTotalCards(): number {
    return this.props.cards.length;
  }

  /**
   * Check if there are more cards after the current one
   */
  hasNextCard(): boolean {
    return this.currentIndex < this.props.cards.length - 1;
  }

  /**
   * Check if there are cards before the current one
   */
  hasPreviousCard(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Update the cards list and reset to first card
   */
  async setCards(cards: Card[]) {
    this.props.cards = cards;
    this.currentIndex = 0;

    if (cards.length > 0) {
      await this.renderCard(0, false);
    } else {
      // Clear current card if no cards
      if (this.$currentCard) {
        this.$currentCard.remove();
        this.$currentCard = null;
      }
    }
  }

  update() {
    // Component update logic (can be async)
  }
}

customElements.define("slice-cardcarousel", CardCarousel);
