import html from "@/lib/render";
import type { StartPracticeModalProps } from "./StartPracticeModal.types";
import Dialog from "../Dialog/Dialog";
import { DifficultyBand } from "@/Components/Service/DB/models/common";
import eventManager from "@/Components/Service/EventManager/EventManager";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import type SButtonSelect from "../SButtonSelect/SButtonSelect";
import type { Card } from "@/Components/Service/DB/models/card";
import type { Deck } from "@/Components/Service/DB/models/deck";

export default class StartPracticeModal extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  props: StartPracticeModalProps;
  private _selectedDifficulty: DifficultyBand = "basic";
  private _deck: Deck | null = null;
  private timed: boolean = false;
  private cards: Card[] = [];
  private availableCards: Card[] = [];
  private $dialog: Dialog | null = null;
  private $startPracticeButton: HTMLElement | null = null;
  private $difficultySelect: SButtonSelect | null = null;
  private $timerCheckbox: HTMLElement | null = null;
  private $availableCardsText: HTMLElement | null = null;
  private db = openDatabase();

  constructor(props: StartPracticeModalProps) {
    super();

    this.props = props;

    // Subscribe to start practice event
    eventManager.subscribe("modal:startPractice:open", async ({ deckId }) => {
      const deck = await this.db.get("decks", deckId);
      if (deck) {
        this.deck = deck;
        await this.update();
        this.open = true;
      } else if (deckId === -1) {
        // Handle random practice deck
        const randomDeck = {
          id: -1,
          emoji: "🎲",
          name: "Mazo aleatorio",
          difficulty: "intermediate" as const,
          cardCount: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
          cardIds: [],
        };
        this.deck = randomDeck;
        await this.update();
        this.open = true;
      }
    });
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

  // Setter for deck that loads cards
  set deck(value: Deck | null) {
    this._deck = value;
    this.props.deck = value;
    this.loadCards();
  }

  get deck(): Deck | null {
    return this._deck;
  }

  // Setter for selected difficulty that filters cards
  set selectedDifficulty(value: DifficultyBand) {
    this._selectedDifficulty = value;
    this.filterCardsByDifficulty();
  }

  get selectedDifficulty(): DifficultyBand {
    return this._selectedDifficulty;
  }

  // Load all cards from the deck
  private async loadCards() {
    if (!this._deck) {
      this.cards = [];
      this.availableCards = [];
      return;
    }

    if (this._deck.id === -1) {
      // Random practice: load all cards
      this.cards = await this.db.getAll("cards");
    } else {
      // Specific deck: load cards by IDs
      const loadedCards: Card[] = [];
      for (const cardId of this._deck.cardIds) {
        const card = await this.db.get("cards", cardId);
        if (card) {
          loadedCards.push(card);
        }
      }
      this.cards = loadedCards;
    }

    // Filter by current difficulty
    this.filterCardsByDifficulty();
  }

  // Filter cards based on minimum difficulty level
  private filterCardsByDifficulty() {
    const difficultyOrder: Record<DifficultyBand, number> = {
      basic: 1,
      intermediate: 2,
      advanced: 3,
    };

    const minLevel = difficultyOrder[this._selectedDifficulty];

    this.availableCards = this.cards.filter((card) => {
      const cardLevel = difficultyOrder[card.difficulty];
      return cardLevel >= minLevel;
    });

    // Update UI with available card count
    this.updateAvailableCardsUI();
  }

  private updateAvailableCardsUI() {
    if (this.$availableCardsText) {
      const count = this.availableCards.length;
      const isRandom = this._deck?.id === -1;
      const displayCount = isRandom ? Math.min(count, 20) : count;

      let displayText = `${displayCount} ${
        displayCount === 1 ? "carta disponible" 
        : displayCount === 0 ? "cartas disponibles. Selecciona una difficultad más baja para practicar."
        : "cartas disponibles"

      }`;

      this.$availableCardsText.textContent = displayText;
      // Update text color based on availability
      if (displayCount === 0) {
        this.$availableCardsText.classList.add("text-red-500");
        this.$availableCardsText.classList.remove("text-font-secondary");
      } else {
        this.$availableCardsText.classList.remove("text-red-500");
        this.$availableCardsText.classList.add("text-font-secondary");
      }
    }
  }

  async getTemplate() {
    const deck =
      this.props.deck || ({ name: "", emoji: "🃏", difficulty: "" } as any);

    this.$difficultySelect = await window.slice.build("SButtonSelect", {
      options: [
        { label: "Básico", value: "basic" },
        { label: "Intermedio", value: "intermediate" },
        { label: "Avanzado", value: "advanced" },
      ],
      onSelect: (option: string) => {
        this.selectedDifficulty = option as DifficultyBand;
      },
      selectedValue: this._selectedDifficulty,
      singleSelect: true,
      label: "Dificultad mínima",
    });

    this.$timerCheckbox = await window.slice.build("Checkbox", {
      label: "Cronometrar práctica",
      onChange: (checked: boolean) => {
        this.timed = checked;
      },
    });

    this.$startPracticeButton = await window.slice.build("Button", {
      value: "Iniciar práctica",
      onClickCallback: () => {
        this.startPractice();
      },
    });

    const content = html`
      <div class="p-4 flex flex-col items-start gap-6 w-full">
        <div class="flex gap-4 items-center">
          <div class="text-5xl">${deck.emoji}</div>
          <div class="flex flex-col">
            <h3 class="text-2xl font-bold text-font-primary">${deck.name}</h3>
            <p class="card-count text-sm text-font-secondary">
              ${deck.cardCount}
              ${deck.cardCount === 1 ? "carta total" : "cartas totales"}
            </p>
          </div>
        </div>

        <div class="w-full">${this.$difficultySelect}</div>

        <!-- Available cards indicator -->
        <div class="w-full">
          <p
            class="available-cards-text text-sm text-font-secondary font-semibold"
          >
            Calculando...
          </p>
        </div>

        <div class="w-full">${this.$timerCheckbox}</div>

        <div class="w-full flex justify-end">${this.$startPracticeButton}</div>
      </div>
    `;

    this.$dialog = (await window.slice.build("Dialog", {
      content,
    })) as Dialog;

    // Get reference to available cards text element
    this.$availableCardsText = this.$dialog.querySelector(
      ".available-cards-text"
    );

    // Update the available cards UI after dialog is built
    this.updateAvailableCardsUI();

    return html`${this.$dialog}`;
  }

  startPractice() {
    // Don't allow starting if no cards are available
    if (this.availableCards.length === 0) {
      return;
    }

    const deckId = this.props.deck?.id;
    if (deckId === undefined) return;

    // Close the modal
    this.open = false;

    // Navigate to practice page with query params
    const url = `/practice/${deckId}?difficulty=${this._selectedDifficulty}&timed=${this.timed}`;
    window.slice.router.navigate(url);
  }

  set open(value: boolean) {
    if (this.$dialog) this.$dialog.open = value;
  }

  get open(): boolean {
    return !!this.$dialog?.open;
  }
}

customElements.define("slice-startpracticemodal", StartPracticeModal);
