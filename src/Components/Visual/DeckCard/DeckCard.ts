import html from "@/lib/render";
import { getRandomColor } from "@/lib/utils/randomColor";
import type { DeckCardProps } from "./DeckCard.types";
import type StartPracticeModal from "../StartPracticeModal/StartPracticeModal";
import type SButton from "../SButton/SButton";
import eventManager from "@/Components/Service/EventManager/EventManager";

export default class DeckCard extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  props: DeckCardProps;
  $modal: StartPracticeModal;
  $editBtn: SButton | null = null;
  $cardContainer: HTMLElement | null = null;

  constructor(props: DeckCardProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
    this.attachEventListeners();
  }

  update() {
    // Component update logic (can be async)
  }

  private attachEventListeners() {
    this.$cardContainer = this.querySelector(".deck-card-container");

    if (this.$cardContainer) {
      this.$cardContainer.addEventListener("click", () => {
        this.$modal.open = true;
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
    this.$modal = (await window.slice.build("StartPracticeModal", {
      deck: this.props.deck,
    })) as StartPracticeModal;

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
        class="deck-card-container p-6 rounded shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer w-96 h-64 flex flex-col justify-center items-center gap-4"
      >
        <!-- Top section with emoji and edit button -->
        <div class="flex justify-between items-start">
        <div></div>
          <div class="text-5xl">${this.props.deck.emoji}</div>
          <div>${this.$editBtn || ""}</div>
        </div>

        <!-- Middle section with deck name -->
        <div class="flex-1 flex items-center justify-center">
          <h3 class="text-2xl font-bold text-font-primary text-center">
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
      ${this.$modal}
    `;
  }
}

customElements.define("slice-deckcard", DeckCard);
