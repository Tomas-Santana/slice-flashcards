import type { FlashcardListProps } from "./FlashcardList.types";
import type { Card } from "@/Components/Service/DB/models/card";
import type Flashcard from "@/Components/Visual/Flashcard/Flashcard";
import type Selectable from "@/Components/Visual/Selectable/Selectable";
import html from "@/lib/render";

export default class FlashcardList extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: FlashcardListProps;
  private cards: Card[] = [];
  private $flashcardElements: (Flashcard | Selectable)[] = [];

  constructor(props: FlashcardListProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
    this.cards = props.cards || [];
  }

  async init() {
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
  }

  async update() {
    const fragment = await this.getTemplate();
    this.innerHTML = "";
    this.appendChild(fragment);
  }

  async getTemplate() {
    this.$flashcardElements = await Promise.all(
      this.cards.map((card) => this.buildCard(card))
    );

    return html`
      <div class="flex flex-wrap gap-4" id="cards-container">
        ${this.$flashcardElements.length > 0
          ? this.$flashcardElements
          : html`<div class="no-cards-message text-center text-gray-500 w-full">
              No hay cartas disponibles. Crea una nueva carta para empezar.
            </div>`}
      </div>
    `;
  }

  async buildCard(card: Card) {
    const cardElement = await window.slice.build("Flashcard", {
      card,
      showFlipButton: this.props.showFlipButton ?? true,
      showEditButton: this.props.showEditButton ?? true,
      frontLanguage: this.props.frontLanguage,
    });

    // Wrap in Selectable if needed
    if (this.props.selectable) {
      const selectable = await window.slice.build("Selectable", {
        content: cardElement,
        onSelectChange: (selected: boolean) => {
          this.props.onCardSelected?.(card.id, selected);
        },
      });
      return selectable;
    }

    return cardElement;
  }

  // Public method to set cards and re-render
  async setCards(cards: Card[]) {
    this.cards = cards;
    await this.update();
  }

  // Public method to add a card to the list
  async addCard(card: Card) {
    this.cards.push(card);
    const cardsContainer = this.querySelector(
      "#cards-container"
    ) as HTMLElement;
    if (!cardsContainer) return;

    // Remove "no cards" message if present
    const noCardsMessage = cardsContainer.querySelector(
      ".no-cards-message"
    ) as HTMLElement;
    if (noCardsMessage) {
      noCardsMessage.remove();
    }

    const cardElement = await this.buildCard(card);
    this.$flashcardElements.push(cardElement);
    cardsContainer.appendChild(cardElement);
  }

  // Public method to update a card in the list
  async updateCard(cardId: number, updatedCard: Card) {
    const cardIndex = this.cards.findIndex((c) => c.id === cardId);
    if (cardIndex !== -1) {
      this.cards[cardIndex] = updatedCard;
    }

    const elementToUpdate = this.$flashcardElements.find((el) => {
      // Check if it's a Selectable wrapping a Flashcard
      if (this.props.selectable && (el as any).props?.content) {
        const flashcard = (el as any).props.content as Flashcard;
        return flashcard.props?.card?.id === cardId;
      }
      // Otherwise it's a direct Flashcard
      return (el as Flashcard).props?.card?.id === cardId;
    });

    if (elementToUpdate) {
      let flashcard: Flashcard;

      if (this.props.selectable) {
        // Get the wrapped Flashcard from the Selectable
        flashcard = (elementToUpdate as any).props.content as Flashcard;
      } else {
        flashcard = elementToUpdate as Flashcard;
      }

      if (flashcard) {
        flashcard.props.card = updatedCard;
        await flashcard.loadAudio();
        await flashcard.update();
      }
    }
  }

  // Public method to remove a card from the list
  removeCard(cardId: number) {
    const cardIndex = this.cards.findIndex((c) => c.id === cardId);
    if (cardIndex !== -1) {
      this.cards.splice(cardIndex, 1);
    }

    const flashcardIndex = this.$flashcardElements.findIndex((el) => {
      // Check if it's a Selectable wrapping a Flashcard
      if (this.props.selectable && (el as any).props?.content) {
        const flashcard = (el as any).props.content as Flashcard;
        return flashcard.props?.card?.id === cardId;
      }
      // Otherwise it's a direct Flashcard
      return (el as Flashcard).props?.card?.id === cardId;
    });

    if (flashcardIndex !== -1) {
      this.$flashcardElements.splice(flashcardIndex, 1);
    }

    const cardsContainer = this.querySelector(
      "#cards-container"
    ) as HTMLElement;
    if (!cardsContainer) return;

    const cardElement = cardsContainer.querySelector(
      `slice-flashcard[data-card-id="${cardId}"]`
    );

    if (cardElement) {
      cardElement.remove();
    }

    // Show "no cards" message if all cards are deleted
    if (this.cards.length === 0 && cardsContainer) {
      cardsContainer.innerHTML = `<div class="no-cards-message text-center text-gray-500 w-full">
        No hay cartas disponibles. Crea una nueva carta para empezar.
      </div>`;
    }
  }
}

customElements.define("slice-flashcardlist", FlashcardList);
