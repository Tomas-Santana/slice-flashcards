import type { FlashcardListProps } from "./FlashcardList.types";
import type { Card } from "@/Components/Service/DB/models/card";
import type Flashcard from "@/Components/Visual/Flashcard/Flashcard";
import type SmallFlashcard from "@/Components/Visual/SmallFlashcard/SmallFlashcard";
import type Selectable from "@/Components/Visual/Selectable/Selectable";
import html from "@/lib/render";
import { LanguageCode } from "@/lib/types/languages";

export default class FlashcardList extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: FlashcardListProps;
  private cards: Card[] = [];
  private $flashcardElements: (Flashcard | SmallFlashcard | Selectable)[] = [];

  emptyCardMessage: DocumentFragment = html`
    <div class="no-cards-message text-center text-gray-500 w-full min-h-64 grid place-content-center">
      No hay cartas que coincidan con los criterios de búsqueda.
    </div>
  `;

  constructor(props: FlashcardListProps) {
    super();
    // @ts-ignore controller at runtime
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
          : this.emptyCardMessage}
      </div>
    `;
  }

  async buildCard(card: Card) {
    const componentType =
      this.props.cardSize === "small" ? "SmallFlashcard" : "Flashcard";

    let cardElement: Flashcard | SmallFlashcard;

    if (this.props.cardSize === "small") {
      cardElement = await window.slice.build("SmallFlashcard", {
        card,
        frontLanguage: this.props.frontLanguage,
      });
    } else {
      cardElement = await window.slice.build("Flashcard", {
        card,
        showFlipButton: this.props.showFlipButton ?? true,
        showEditButton: this.props.showEditButton ?? true,
        showProgress: this.props.showProgress ?? false,
        frontLanguage: this.props.frontLanguage,
      });
    }

    // Wrap in Selectable if needed
    if (this.props.selectable) {
      // Check if this card should be initially selected
      const isSelected = this.props.selected?.includes(card.id) ?? false;

      const selectable = await window.slice.build("Selectable", {
        content: cardElement,
        selected: isSelected,
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

  setFrontLanguage(lang: LanguageCode) {
    this.props.frontLanguage = lang;
    this.update();
  }

  // Public method to update a card in the list
  async updateCard(cardId: number, updatedCard: Card) {
    const cardIndex = this.cards.findIndex((c) => c.id === cardId);
    if (cardIndex !== -1) {
      this.cards[cardIndex] = updatedCard;
    }

    const elementToUpdate = this.$flashcardElements.find((el) => {
      // Check if it's a Selectable wrapping a card
      if (this.props.selectable && (el as any).props?.content) {
        const card = (el as any).props.content as Flashcard | SmallFlashcard;
        return card.props?.card?.id === cardId;
      }
      // Otherwise it's a direct card element
      return (el as Flashcard | SmallFlashcard).props?.card?.id === cardId;
    });

    if (elementToUpdate) {
      let cardElement: Flashcard | SmallFlashcard;

      if (this.props.selectable) {
        // Get the wrapped card from the Selectable
        cardElement = (elementToUpdate as any).props.content as
          | Flashcard
          | SmallFlashcard;
      } else {
        cardElement = elementToUpdate as Flashcard | SmallFlashcard;
      }

      if (cardElement) {
        cardElement.props.card = updatedCard;

        // Only Flashcard has loadAudio method
        if (
          this.props.cardSize !== "small" &&
          (cardElement as Flashcard).loadAudio
        ) {
          await (cardElement as Flashcard).loadAudio();
        }

        await cardElement.update();
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
      // Check if it's a Selectable wrapping a card
      if (this.props.selectable && (el as any).props?.content) {
        const card = (el as any).props.content as Flashcard | SmallFlashcard;
        return card.props?.card?.id === cardId;
      }
      // Otherwise it's a direct card element
      return (el as Flashcard | SmallFlashcard).props?.card?.id === cardId;
    });

    if (flashcardIndex !== -1) {
      this.$flashcardElements.splice(flashcardIndex, 1);
    }

    const cardsContainer = this.querySelector(
      "#cards-container"
    ) as HTMLElement;
    if (!cardsContainer) return;

    // Query for either flashcard or smallflashcard
    const cardElement = cardsContainer.querySelector(
      `slice-flashcard[data-card-id="${cardId}"], slice-smallflashcard[data-card-id="${cardId}"]`
    );

    if (cardElement) {
      cardElement.remove();
    }

    // Show "no cards" message if all cards are deleted
    if (this.cards.length === 0 && cardsContainer) {
      cardsContainer.innerHTML = "";
      cardsContainer.appendChild(this.emptyCardMessage);
    }
  }
}

customElements.define("slice-flashcardlist", FlashcardList);
