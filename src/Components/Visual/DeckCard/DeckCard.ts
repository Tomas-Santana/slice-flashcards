import html from "@/lib/render";
import { getRandomColor } from "@/lib/utils/randomColor";
import type { DeckCardProps } from "./DeckCard.types";
import type SButton from "../SButton/SButton";
import eventManager from "@/Components/Service/EventManager/EventManager";

export default class DeckCard extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  props: DeckCardProps;
  $editBtn: SButton | null = null;
  $cardContainer: HTMLElement | null = null;

  constructor(props: DeckCardProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    this.setAttribute("data-deck-id", this.props.deck.id.toString());
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
    this.attachEventListeners();
  }

  async update() {
    const fragment = await this.getTemplate();
    this.innerHTML = "";
    this.appendChild(fragment);
    this.attachEventListeners();
  }

  private attachEventListeners() {
    this.$cardContainer = this.querySelector(".deck-card-container");

    if (this.$cardContainer) {
      this.$cardContainer.addEventListener("click", () => {
        eventManager.publish("modal:startPractice:open", {
          deckId: this.props.deck.id,
        });
      });
    }

    if (this.$editBtn) {
      this.$editBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent triggering the card click
        eventManager.publish("modal:newDeck:open", {
          deckId: this.props.deck.id,
        });
      });
    }
  }

  async getTemplate() {
    // Only create edit button if showEditButton is true (default true)
    const editIcon =
      this.props.showEditButton !== false
        ? await window.slice.build("SIcon", {
            name: "pen-to-square",
            class: "",
          })
        : null;

    this.$editBtn = editIcon
      ? await window.slice.build("SButton", {
          content: editIcon,
          size: "icon",
          variant: "ghost",
          class: "deck-edit-btn",
        })
      : null;

    const difficultyLabels = {
      basic: "Básico",
      intermediate: "Intermedio",
      advanced: "Avanzado",
    };

    const difficultyEmojis = {
      basic: "😀",
      intermediate: "😐",
      advanced: "😡",
    };

    return html`
      <div
        style="background-color: ${getRandomColor(this.props.deck.name) +
        "88"};"
        class="deck-card-container p-6 rounded shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer w-96 h-64 flex flex-col justify-between relative"
      >
        <!-- Top section with emoji and edit button -->
        <div class="h-10 absolute top-4 right-4">${this.$editBtn || ""}</div>

        <!-- Middle section with deck name -->
        <div class="flex flex-col gap-2 items-start justify-start">
          <div class="text-5xl">${this.props.deck.emoji}</div>

          <h3 class="text-2xl font-bold text-font-primary">
            ${this.props.deck.name}
          </h3>
        </div>

        <!-- Bottom section with info -->
        <div
          class="flex items-center justify-between text-sm text-font-secondary"
        >
          <div class="flex items-center gap-2">
            <span>${difficultyLabels[this.props.deck.difficulty]}</span>
            <span class="text-xl"
              >${difficultyEmojis[this.props.deck.difficulty]}</span
            >
          </div>
          ${this.props.showCardCount !== false
            ? html`
                <div class="font-semibold">
                  ${this.props.deck.cardCount}
                  ${this.props.deck.cardCount === 1 ? "carta" : "cartas"}
                </div>
              `
            : ""}
        </div>
      </div>
    `;
  }
}

customElements.define("slice-deckcard", DeckCard);
