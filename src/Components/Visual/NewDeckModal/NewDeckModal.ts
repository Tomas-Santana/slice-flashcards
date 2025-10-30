import type { NewDeckModalProps } from "./NewDeckModal.types";
import type { Deck } from "@/Components/Service/DB/models/deck";
import type { Card } from "@/Components/Service/DB/models/card";
import { DifficultyBand } from "@/Components/Service/DB/models/common";
import { Settings } from "@/Components/Service/DB/models/settings";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import html from "@/lib/render";
import eventManager from "@/Components/Service/EventManager/EventManager";
import type Dialog from "../Dialog/Dialog";
import type SButtonSelect from "../SButtonSelect/SButtonSelect";
import type FlashcardList from "../FlashcardList/FlashcardList";

export default class NewDeckModal extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: NewDeckModalProps;
  private db = openDatabase();
  $dialog: Dialog | null = null;
  deckValues: Partial<Deck> = {
    name: "",
    emoji: "📚",
    difficulty: "basic",
    cardIds: [],
    cardCount: 0,
  };
  _deckId: number | null = null;
  private settings: Settings;
  private availableCards: Card[] = [];
  private selectedCardIds: Set<number> = new Set();

  // Form input components
  private $nameInput: HTMLElement | null = null;
  private $emojiInput: HTMLElement | null = null;
  private $difficultySelect: SButtonSelect | null = null;
  private $flashcardList: FlashcardList | null = null;
  private $cardCountElement: HTMLSpanElement;

  constructor(props: NewDeckModalProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;

    eventManager.subscribe(
      "modal:newDeck:open",
      async (data: { deckId?: number }) => {
        if (data?.deckId) {
          // Edit mode: load deck data
          await this.loadDeck(data.deckId);
        } else {
          // Create mode: reset to defaults
          this.resetFormFields();
        }
        this.$dialog!.open = true;
      }
    );
  }

  async init() {
    await this.loadSettings();
    // Load all available cards
    this.availableCards = await this.db.getAll("cards");
    const fragment = await this.getTemplate();
    this.appendChild(fragment);

		this.$cardCountElement = this.querySelector(".card-count") as HTMLSpanElement;

		eventManager.subscribeToMultiple(["card:created", "card:updated", "card:deleted"], async () => {
			// Reload available cards on any card change
			this.availableCards = await this.db.getAll("cards");
			if (this.$flashcardList) {
				await this.$flashcardList.update();
			}
		});

    eventManager.subscribe("settings:updated", async () => {
      await this.loadSettings();
      if (this.$flashcardList && this.settings) {
        this.$flashcardList.setFrontLanguage(this.settings.selectedLanguage);
      }
    });

  }

  async loadSettings() {
    this.settings = await this.db.get("settings", "settings");
  }

  async update() {
    const fragment = await this.getTemplate();
    this.innerHTML = "";
    this.appendChild(fragment);
  }

  async getTemplate() {
    // Create form components
    this.$nameInput = await window.slice.build("Input", {
      placeholder: "Nombre del mazo",
      value: this.deckValues.name || "",
      onChange: (value: string) => {
        this.deckValues.name = value;
      },
      conditions: { maxLength: 50 },
    });

    this.$emojiInput = await window.slice.build("Input", {
      value: this.deckValues.emoji || "📚",
      onChange: (value: string) => {
        this.deckValues.emoji = value;
      },
      conditions: { maxLength: 3 },
    });

    this.$difficultySelect = await window.slice.build("SButtonSelect", {
      options: [
        { label: "Básico", value: "basic" },
        { label: "Intermedio", value: "intermediate" },
        { label: "Avanzado", value: "advanced" },
      ],
      onSelect: (option: string) => {
        this.deckValues.difficulty = option as DifficultyBand;
      },
      selectedValue: this.deckValues.difficulty || "basic",
      singleSelect: true,
      label: "Nivel de dificultad",
    });

    // Create flashcard list with selectable cards
    this.$flashcardList = await window.slice.build("FlashcardList", {
      cards: this.availableCards,
      frontLanguage: this.settings.selectedLanguage,
      showFlipButton: false,
      showEditButton: false,
      selectable: true,
      selected: Array.from(this.selectedCardIds),
			cardSize: "small",
      onCardSelected: (cardId: number, selected: boolean) => {
        if (selected) {
          this.selectedCardIds.add(cardId);
        } else {
          this.selectedCardIds.delete(cardId);
        }
      },
    });

    const createButton = await window.slice.build("Button", {
      value: this._deckId ? "Guardar cambios" : "Crear mazo",
      onClickCallback: () => {
        if (this._deckId) {
          this.updateDeck();
        } else {
          this.createDeck();
        }
      },
    });

    const deleteButton = this._deckId
      ? await window.slice.build("SButton", {
          content: "Eliminar mazo",
          variant: "danger",
          onClick: async () => {
            if (confirm("¿Estás seguro de que quieres eliminar este mazo?")) {
              await this.deleteDeck();
            }
          },
        })
      : null;

    const dialogContent = html`
      <div class="p-4 flex flex-col items-start gap-6 w-full max-h-[80vh]">
        <h3 class="text-2xl font-bold text-font-primary">
          ${this._deckId ? "Editar mazo" : "Nuevo mazo"}
        </h3>

        <div class="flex gap-4 w-full">
          <div class="w-10">${this.$emojiInput}</div>
          <div class="flex-1">${this.$nameInput}</div>
        </div>

        <div class="w-full">${this.$difficultySelect}</div>

        <div class="w-full">
          <h4 class="text-lg font-semibold text-font-primary mb-3">
            Seleccionar cartas
          </h4>
          <div class="max-h-96 overflow-y-auto border rounded-md p-4">
            ${this.$flashcardList}
          </div>
        </div>

        <div class="flex gap-3 items-center">
          ${createButton} ${deleteButton || ""}
        </div>
      </div>
    `;

    this.$dialog = await window.slice.build("Dialog", {
      content: dialogContent,
    });

    const triggerButton = await window.slice.build("Button", {
      value: this.props.triggerLabel,
      onClickCallback: () => {
        this.resetFormFields();
        this.$dialog!.open = true;
      },
    });

    return html` ${triggerButton} ${this.$dialog} `;
  }

  async createDeck() {
    if (!this.deckValues.name) {
      alert("Por favor, ingresa un nombre para el mazo.");
      return;
    }

		if (this.selectedCardIds.size === 0) {
			alert("Por favor, selecciona al menos una carta para el mazo.");
			return;
		}

    const newDeck: Omit<Deck, "id"> = {
      name: this.deckValues.name!,
      emoji: this.deckValues.emoji || "📚",
      difficulty: this.deckValues.difficulty || "basic",
      cardIds: Array.from(this.selectedCardIds),
      cardCount: this.selectedCardIds.size,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newId = await this.db.add("decks", newDeck);

    // Update cards with the new deck ID
    await this.updateCardsWithDeck(
      Array.from(this.selectedCardIds),
      Number(newId),
      true
    );

    this.$dialog!.open = false;
    this.resetFormFields();
    eventManager.publish("deck:created", { deckId: Number(newId) });
  }

  async updateDeck() {
    if (!this._deckId || !this.deckValues.name) {
      alert("Por favor, ingresa un nombre para el mazo.");
      return;
    }

		if (this.selectedCardIds.size === 0) {
			alert("Por favor, selecciona al menos una carta para el mazo.");
			return;
		}

    const existingDeck = await this.db.get("decks", this._deckId);
    if (!existingDeck) {
      alert("Mazo no encontrado.");
      return;
    }

    const updatedDeck: Deck = {
      ...existingDeck,
      name: this.deckValues.name!,
      emoji: this.deckValues.emoji || "📚",
      difficulty: this.deckValues.difficulty || "basic",
      cardIds: Array.from(this.selectedCardIds),
      cardCount: this.selectedCardIds.size,
      updatedAt: new Date(),
    };

    await this.db.put("decks", updatedDeck);

    // Update cards: remove deck ID from cards no longer in the deck, add to new ones
    const oldCardIds = new Set(existingDeck.cardIds);
    const newCardIds = this.selectedCardIds;

    const cardsToRemove = Array.from(oldCardIds).filter(
      (id) => !newCardIds.has(id)
    );
    const cardsToAdd = Array.from(newCardIds).filter(
      (id) => !oldCardIds.has(id)
    );

    await this.updateCardsWithDeck(cardsToRemove, this._deckId, false);
    await this.updateCardsWithDeck(cardsToAdd, this._deckId, true);

    this.$dialog!.open = false;

    const updatedDeckId = this._deckId;
    this.resetFormFields();

    eventManager.publish("deck:updated", { deckId: updatedDeckId });
  }

  async deleteDeck() {
    if (!this._deckId) return;

    const deck = await this.db.get("decks", this._deckId);
    if (deck) {
      // Remove deck ID from all associated cards
      await this.updateCardsWithDeck(deck.cardIds, this._deckId, false);
    }

    await this.db.delete("decks", this._deckId);

    this.$dialog!.open = false;

    const deletedDeckId = this._deckId;
    this.resetFormFields();

    eventManager.publish("deck:deleted", { deckId: deletedDeckId });
  }

  async loadDeck(deckId: number) {
    this._deckId = deckId;
    const deck = await this.db.get("decks", deckId);

    if (!deck) {
      alert("Mazo no encontrado.");
      return;
    }

    this.deckValues = {
      name: deck.name,
      emoji: deck.emoji,
      difficulty: deck.difficulty,
      cardIds: deck.cardIds,
      cardCount: deck.cardCount,
    };

    this.selectedCardIds = new Set(deck.cardIds);

    await this.update();
  }

  resetFormFields() {
    this.deckValues = {
      name: "",
      emoji: "📚",
      difficulty: "basic",
      cardIds: [],
      cardCount: 0,
    };
    this.selectedCardIds.clear();
    this._deckId = null;

    if (this.$nameInput) {
      (this.$nameInput as any).value = "";
    }
    if (this.$emojiInput) {
      (this.$emojiInput as any).value = "📚";
    }
    if (this.$difficultySelect) {
      this.$difficultySelect.selected = "basic";
    }
  }

  // Helper method to update cards' deckIds
  async updateCardsWithDeck(cardIds: number[], deckId: number, add: boolean) {
    for (const cardId of cardIds) {
      const card = await this.db.get("cards", cardId);
      if (card) {
        if (add) {
          if (!card.deckIds.includes(deckId)) {
            card.deckIds.push(deckId);
          }
        } else {
          card.deckIds = card.deckIds.filter((id) => id !== deckId);
        }
        await this.db.put("cards", card);
      }
    }
  }
}

customElements.define("slice-newdeckmodal", NewDeckModal);
