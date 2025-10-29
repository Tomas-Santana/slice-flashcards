import html from "@/lib/render";
import { getRandomColor } from "@/lib/utils/randomColor";
import type { DeckCardProps } from "./DeckCard.types";
import type StartPracticeModal from "../StartPracticeModal/StartPracticeModal";

export default class DeckCard extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  props: DeckCardProps
  $modal: StartPracticeModal

  constructor(props: DeckCardProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;

    this.addEventListener("click", () => {
      this.$modal.open = true;
    });
  }

  async init() {
    // Component initialization logic (can be async)
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
  }

  update() {
    // Component update logic (can be async)
  }

  async getTemplate() {
    this.$modal = (await window.slice.build("StartPracticeModal", {
      deck: this.props.deck,
    })) as StartPracticeModal;
    return html`
      <div style="background-color: ${getRandomColor(this.props.deck.name) + "88"};" class="p-4 rounded shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer w-64 flex flex-col items-center">
        <div class="text-4xl">${this.props.deck.emoji}</div>
        <h3 class="text-lg font-semibold text-font-primary">${this.props.deck.name}</h3>
        <p class="text-sm text-font-secondary">Dificultad: ${this.props.deck.difficulty}</p>
      </div>
      ${this.$modal}
    `;
  }
}

customElements.define("slice-deckcard", DeckCard);
