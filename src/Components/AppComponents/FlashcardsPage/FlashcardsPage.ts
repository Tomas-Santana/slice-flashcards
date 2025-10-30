import { html } from "@/lib/render";
import type { FlashcardsPageProps } from "./FlashcardsPage.types";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import type { Card } from "@/Components/Service/DB/models/card";
import eventManager from "@/Components/Service/EventManager/EventManager";
import { Settings } from "@/Components/Service/DB/models/settings";
import type FlashcardList from "@/Components/Visual/FlashcardList/FlashcardList";
import { FilterCriteria } from "@/lib/types/filter";

export default class FlashcardsPage extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  private db = openDatabase();
  cards: Card[] = [];
  $flashcardList: FlashcardList | null = null;
  settings: Settings | null = null;

  constructor(props: FlashcardsPageProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
  }

  async init() {
    // Component initialization logic (can be async)
    this.settings = await this.db.get("settings", "settings");
    this.cards = await this.db.getAll("cards");

    this.cards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const fragment = await this.getTemplate();
    this.appendChild(fragment);

    eventManager.subscribe("card:created", async ({ cardId }) => {
      const newCard = await this.db.get("cards", cardId);
      this.cards.push(newCard);
      if (this.$flashcardList) {
        await this.$flashcardList.addCard(newCard);
      }
    });

    eventManager.subscribe("card:updated", async ({ cardId }) => {
      const updatedCard = await this.db.get("cards", cardId);
      // Update card in array
      const cardIndex = this.cards.findIndex((c) => c.id === cardId);
      if (cardIndex !== -1) {
        this.cards[cardIndex] = updatedCard;
      }
      // Update card in component
      if (this.$flashcardList) {
        await this.$flashcardList.updateCard(cardId, updatedCard);
      }
    });

    eventManager.subscribe("card:deleted", async ({ cardId }) => {
      // Remove card from array
      const cardIndex = this.cards.findIndex((c) => c.id === cardId);
      if (cardIndex !== -1) {
        this.cards.splice(cardIndex, 1);
      }
      // Remove card from component
      if (this.$flashcardList) {
        this.$flashcardList.removeCard(cardId);
      }
    });
  }

  update() {
    // Component update logic (can be async)
  }

  async getTemplate() {
    const pageTitle = await window.slice.build("PageTitle", {
      title: "Mis cartas",
    });

    const newCardModal = await window.slice.build("NewCardModal", {
      triggerLabel: "Nueva carta",
    });

    // const searchInput = await window.slice.build("Input", {
    //   placeholder: "Buscar cartas...",
    //   onChange: (value: string) => {
    //     // Logic to handle search input change
    //   },
    //   type: "search",
    // });

    const filterForm = await window.slice.build("CardFilterForm", {
      onFilterChange: (criteria) => {
        this.filterCards(criteria);
      },
    });

    this.$flashcardList = await window.slice.build("FlashcardList", {
      cards: this.cards,
      frontLanguage: this.settings.selectedLanguage,
      showFlipButton: true,
      showEditButton: true,
      showProgress: true,
      onCardSelected: (cardId: number, selected: boolean) => {
        console.log(`Card ${cardId} selected: ${selected}`);
      }
    });

    return html`
      <div class="flex flex-col p-4 gap-4">
        <div class="flex justify-between items-center w-full">
          <div>${pageTitle}</div>
          <div class="flex items-center gap-2">
              ${filterForm} ${newCardModal}
          </div>
        </div>

        ${this.$flashcardList}
      </div>
    `;
  }

  filterCards(criteria: FilterCriteria) {
    let filteredCards = [...this.cards];

    // Filter by difficulty bands
    if (criteria.difficultyBands.length > 0) {
      filteredCards = filteredCards.filter(card =>
        criteria.difficultyBands.includes(card.difficulty)
      );
    }

    // Filter by search term
    if (criteria.searchTerm && criteria.searchTerm.trim() !== "") {
      const searchTermLower = criteria.searchTerm.toLowerCase();
      filteredCards = filteredCards.filter(card => {
        const frontMatch = card.translation[this.settings.selectedLanguage]
          .toLowerCase()
          .includes(searchTermLower);
        const backMatch = card.originalText
          .toLowerCase()
          .includes(searchTermLower);
        if (criteria.searchFor === 'front') {
          return frontMatch;
        } else if (criteria.searchFor === 'back') {
          return backMatch;
        } else {
          return frontMatch || backMatch;
        }
      });
    }

    // Update flashcard list
    //sort by createdAt descending
    filteredCards.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    if (this.$flashcardList) {
      this.$flashcardList.setCards(filteredCards);
    }
  }
}

customElements.define("slice-flashcardspage", FlashcardsPage);
