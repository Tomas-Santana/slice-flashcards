import { html } from "@/lib/render";
import type { FlashcardsPageProps } from "./FlashcardsPage.types";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import type { Card } from "@/Components/Service/DB/models/card";
import eventManager from "@/Components/Service/EventManager/EventManager";
import { Settings } from "@/Components/Service/DB/models/settings";

export default class FlashcardsPage extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  private db = openDatabase();
  cards: Card[] = [];
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
      await this.addCardToContainer(newCard);
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

    const cardElements = await Promise.all(
      this.cards.map((card) => this.buildCard(card))
    );
    return html`
      <div class="flex flex-col p-4 gap-4">
        <div class="flex justify-between items-center w-full">
          <div>${pageTitle}</div>
          <div class="flex items-center gap-2">
            ${searchInput} ${newCardModal}
          </div>
        </div>

        <div class="flex flex-wrap gap-4" id="cards-container">
          ${cardElements.length > 0
            ? cardElements
            : html`<div
                class="no-cards-message text-center text-gray-500 w-full"
              >
                No hay cartas disponibles. Crea una nueva carta para empezar.
              </div>`}
        </div>
      </div>
    `;
  }

  async addCardToContainer(card: Card) {
    const cardsContainer = this.querySelector(
      "#cards-container"
    ) as HTMLElement;
    // Remove "no cards" message if present
    const noCardsMessage = cardsContainer.querySelector(
      ".no-cards-message"
    ) as HTMLElement;
    if (noCardsMessage) {
      noCardsMessage.remove();
    }

    const selectable = await this.buildCard(card);
    cardsContainer.appendChild(selectable);
  }

  async buildCard(card: Card) {
    const cardElement = await window.slice.build("Flashcard", {
      card,
      showFlipButton: true,
      frontLanguage: this.settings.selectedLanguage,
    });
    return cardElement;
  }
}

customElements.define("slice-flashcardspage", FlashcardsPage);
