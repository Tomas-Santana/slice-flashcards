import { html } from "@/lib/render";
import type { FlashcardsPageProps } from "./FlashcardsPage.types";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import type { Card } from "@/Components/Service/DB/models/card";
import eventManager from "@/Components/Service/EventManager/EventManager";
import { Settings } from "@/Components/Service/DB/models/settings";
import type FlashcardList from "@/Components/Visual/FlashcardList/FlashcardList";

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

    const searchInput = await window.slice.build("Input", {
      placeholder: "Buscar cartas...",
      onChange: (value: string) => {
        // Logic to handle search input change
      },
      type: "search",
    });

    this.$flashcardList = await window.slice.build("FlashcardList", {
      cards: this.cards,
      frontLanguage: this.settings.selectedLanguage,
      showFlipButton: true,
      showEditButton: true,
      selectable: true,
      onCardSelected: (cardId: number, selected: boolean) => {
        console.log(`Card ${cardId} selected: ${selected}`);
      }
    });

    return html`
      <div class="flex flex-col p-4 gap-4">
        <div class="flex justify-between items-center w-full">
          <div>${pageTitle}</div>
          <div class="flex items-center gap-2">
            ${searchInput} ${newCardModal}
          </div>
        </div>

        ${this.$flashcardList}
      </div>
    `;
  }
}

customElements.define("slice-flashcardspage", FlashcardsPage);
