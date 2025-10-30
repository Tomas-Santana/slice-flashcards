import type { SmallFlashcardProps } from "./SmallFlashcard.types";
import html from "@/lib/render";

export default class SmallFlashcard extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: SmallFlashcardProps;
  private $inner: HTMLElement | null = null;

  constructor(props: SmallFlashcardProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    this.setAttribute("data-card-id", this.props.card.id.toString());
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
    this.$inner = this.querySelector(".sfc-inner");

    // Toggle flip on click
    if (this.$inner) {
      this.addEventListener("click", () => {
        this.$inner!.classList.toggle("sfc-flipped");
      });
    }
  }

  async getTemplate() {
    const card = this.props.card;
    const lang = this.props.frontLanguage;
    const translation = card.translation?.[lang] ?? "";
    
    // Check if translation exists for this language
    const hasTranslation = translation && translation.trim().length > 0;

    // Difficulty colors and emojis
    const difficultyConfig = {
      basic: { color: "bg-green-100", emoji: "😀" },
      intermediate: { color: "bg-yellow-100", emoji: "😐" },
      advanced: { color: "bg-red-100", emoji: "😡" },
    };

    const difficulty = card.difficulty || "basic";
    const difficultyColor = difficultyConfig[difficulty]?.color || "bg-white";

    return html`
      <div class="sfc-outer cursor-pointer">
        <div class="sfc-inner rounded shadow border bg-white w-32 h-24">
          <!-- Front face -->
          <div
            class="sfc-face sfc-front flex flex-col items-center justify-center p-3 h-full ${difficultyColor}"
          >
            ${hasTranslation
              ? html`
                  <div
                    class="text-lg font-bold text-font-primary text-center line-clamp-2"
                  >
                    ${translation}
                  </div>
                `
              : html`
                  <div class="text-xs text-font-secondary text-center">
                    Sin traducción <br> (<span class="font-semibold">${card.originalText}</span>)
                  </div>
                `}
          </div>

          <!-- Back face -->
          <div
            class="sfc-face sfc-back absolute inset-0 ${difficultyColor} rounded flex flex-col items-center justify-center p-3"
          >
            <div
              class="text-lg font-bold text-font-primary text-center line-clamp-2"
            >
              ${card.originalText}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("slice-smallflashcard", SmallFlashcard);
