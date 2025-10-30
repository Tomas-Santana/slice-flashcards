import type { PracticePageProps } from "./PracticePage.types";
import html from "@/lib/render";
import type { Deck } from "@/Components/Service/DB/models/deck";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import eventManager from "@/Components/Service/EventManager/EventManager";
import type DeckList from "@/Components/Visual/DeckList/DeckList";

export default class PracticePage extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  decks: Deck[] = [];
  private db = openDatabase();
  $deckList: DeckList | null = null;

  constructor(props: PracticePageProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
  }

  async init() {
    // Component initialization logic (can be async)
    await this.loadDecks();
    const fragment = await this.getTemplate();
    this.appendChild(fragment);

    // Subscribe to deck events
    eventManager.subscribe("deck:created", async ({ deckId }) => {
      const newDeck = await this.db.get("decks", deckId);
      this.decks.push(newDeck);
      if (this.$deckList) {
        await this.$deckList.addDeck(newDeck);
      }
    });

    eventManager.subscribe("deck:updated", async ({ deckId }) => {
      const updatedDeck = await this.db.get("decks", deckId);
      // Update deck in array
      const deckIndex = this.decks.findIndex((d) => d.id === deckId);
      if (deckIndex !== -1) {
        this.decks[deckIndex] = updatedDeck;
      }
      // Update deck in component
      if (this.$deckList) {
        await this.$deckList.updateDeck(deckId, updatedDeck);
      }
    });

    eventManager.subscribe("deck:deleted", async ({ deckId }) => {
      // Remove deck from array
      const deckIndex = this.decks.findIndex((d) => d.id === deckId);
      if (deckIndex !== -1) {
        this.decks.splice(deckIndex, 1);
      }
      // Remove deck from component
      if (this.$deckList) {
        this.$deckList.removeDeck(deckId);
      }
    });
  }

  update() {
    // Component update logic (can be async)
  }

  async getTemplate() {
    const pageTitle = await window.slice.build("PageTitle", {
      title: "Mis mazos",
      subtitle: "Practica, crea y administra tus mazos de tarjetas.",
    });
    const newDeckModal = await window.slice.build("NewDeckModal", {
      triggerLabel: "Crear nuevo mazo",
    });

    this.$deckList = await window.slice.build("DeckList", {
      decks: this.decks,
      showRandomPracticeDeck: true,
      showEditButton: true,
      showCardCount: true,
    });

    const cardsSection = await window.slice.build("FlashcardsPage", {});
    const fragment = html`
      <div class="p-4">
      <div class="flex items-center justify-between">
      ${pageTitle} ${newDeckModal}
      </div>
        <div class="flex gap-4 mt-4 overflow-x-scroll pb-4">
          ${this.$deckList}
        </div>
      </div>
      ${cardsSection}
    `;
    return fragment;
  }

  async loadDecks() {
    this.decks = await this.db.getAll("decks");
  }
}

customElements.define("slice-practicepage", PracticePage);
