import type { DeckListProps } from "./DeckList.types";
import html from "@/lib/render";
import type { Deck } from "@/Components/Service/DB/models/deck";
import type DeckCard from "../DeckCard/DeckCard";
import type StartPracticeModal from "../StartPracticeModal/StartPracticeModal";

export default class DeckList extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: DeckListProps;
  private decks: Deck[] = [];
  private $deckElements: DeckCard[] = [];
  private $startPracticeModal: StartPracticeModal | null = null;

  constructor(props: DeckListProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
    this.decks = props.decks || [];
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
    this.$deckElements = await Promise.all(
      this.decks.map((deck) => this.buildDeck(deck))
    );

    // Build random practice deck if enabled
    let randomPracticeDeck = null;
    if (this.props.showRandomPracticeDeck) {
      randomPracticeDeck = await this.buildDeck({
        id: -1,
        emoji: "🎲",
        name: "Mazo aleatorio",
        difficulty: "intermediate",
        cardCount: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
        cardIds: [],
      });
    }

    // Create the StartPracticeModal
    this.$startPracticeModal = await window.slice.build("StartPracticeModal", {
      deck: this.decks[0] || {
        id: -1,
        emoji: "🎲",
        name: "Mazo",
        difficulty: "basic",
        cardCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        cardIds: [],
      },
    });

    return html`
      <div class="flex flex-wrap gap-4" id="decks-container">
        ${this.$deckElements.length > 0 || randomPracticeDeck
          ? html`${randomPracticeDeck || ""} ${this.$deckElements}`
          : html`<div class="no-decks-message text-center text-gray-500 w-full">
              No hay mazos disponibles. Crea un nuevo mazo para empezar.
            </div>`}
      </div>
      ${this.$startPracticeModal}
    `;
  }

  async buildDeck(deck: Deck) {
    // For random practice deck, override props
    const isRandomDeck = deck.id === -1;

    const deckElement = await window.slice.build("DeckCard", {
      deck,
      showEditButton: isRandomDeck ? false : this.props.showEditButton ?? true,
      showCardCount: isRandomDeck ? false : this.props.showCardCount ?? true,
    });

    return deckElement;
  }

  // Public method to set decks and re-render
  async setDecks(decks: Deck[]) {
    this.decks = decks;
    await this.update();
  }

  // Public method to add a deck to the list
  async addDeck(deck: Deck) {
    this.decks.push(deck);
    const decksContainer = this.querySelector(
      "#decks-container"
    ) as HTMLElement;
    if (!decksContainer) return;

    // Remove "no decks" message if present
    const noDecksMessage = decksContainer.querySelector(
      ".no-decks-message"
    ) as HTMLElement;
    if (noDecksMessage) {
      noDecksMessage.remove();
    }

    const deckElement = await this.buildDeck(deck);
    this.$deckElements.push(deckElement);
    decksContainer.appendChild(deckElement);
  }

  // Public method to update a deck in the list
  async updateDeck(deckId: number, updatedDeck: Deck) {
    const deckIndex = this.decks.findIndex((d) => d.id === deckId);
    if (deckIndex !== -1) {
      this.decks[deckIndex] = updatedDeck;
    }

    const elementToUpdate = this.$deckElements.find(
      (el) => el.props?.deck?.id === deckId
    );

    if (elementToUpdate) {
      elementToUpdate.props.deck = updatedDeck;
      await elementToUpdate.update();
    }
  }

  // Public method to remove a deck from the list
  removeDeck(deckId: number) {
    const deckIndex = this.decks.findIndex((d) => d.id === deckId);
    if (deckIndex !== -1) {
      this.decks.splice(deckIndex, 1);
    }

    const deckElementIndex = this.$deckElements.findIndex(
      (el) => el.props?.deck?.id === deckId
    );

    if (deckElementIndex !== -1) {
      this.$deckElements.splice(deckElementIndex, 1);
    }

    const decksContainer = this.querySelector(
      "#decks-container"
    ) as HTMLElement;
    if (!decksContainer) return;

    const deckElement = decksContainer.querySelector(
      `slice-deckcard[data-deck-id="${deckId}"]`
    );

    if (deckElement) {
      deckElement.remove();
    }

    // Show "no decks" message if all decks are deleted
    if (this.decks.length === 0 && decksContainer) {
      decksContainer.innerHTML = `<div class="no-decks-message text-center text-gray-500 w-full">
        No hay mazos disponibles. Crea un nuevo mazo para empezar.
      </div>`;
    }
  }
}

customElements.define("slice-decklist", DeckList);
