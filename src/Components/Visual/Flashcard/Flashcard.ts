import type { FlashcardProps } from "./Flashcard.types";
import html from "@/lib/render";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import { AudioAsset } from "@/Components/Service/DB/models/audio";
import eventManager from "@/Components/Service/EventManager/EventManager";
import type SButton from "../SButton/SButton";
import type ProgressVisualizer from "../ProgressVisualizer/ProgressVisualizer";

export default class Flashcard extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: FlashcardProps;
  db = openDatabase();
  audioAsset: AudioAsset | null = null;
  private _audioUrl: string | null = null;
  private $inner: HTMLElement | null = null;
  private $showBtn: SButton | null = null;
  private $hideBtn: SButton | null = null;
  private $notesBtn: SButton | null = null;
  private $notesPanel: HTMLElement | null = null;
  private $audioEl: HTMLAudioElement | null = null;
  private $playBtn: SButton | null = null;
  private $editBtn: SButton | null = null;
  private $progressViz: ProgressVisualizer | null = null;

  constructor(props: FlashcardProps) {
    super();

    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    this.setAttribute("data-card-id", this.props.card.id.toString());
    // Ensure the custom element displays inline-block to respect child dimensions
    this.classList.add("w-96", "h-64", "inline-block");
    await this.render();
  }

  async update() {
    // Revoke old audio URL if exists
    if (this._audioUrl) {
      try {
        URL.revokeObjectURL(this._audioUrl);
      } catch {}
      this._audioUrl = null;
    }

    await this.render();
  }

  private async render() {
    // Load audio (if any) before rendering so template can include the control
    await this.loadAudio();

    const fragment = await this.getTemplate();

    if (this.innerHTML) {
      this.innerHTML = "";
    }
    this.appendChild(fragment);

    // Wire up event listeners
    this.attachEventListeners();
  }

  private attachEventListeners() {
    // Grab refs
    this.$inner = this.querySelector(".fc-inner");
    this.$notesPanel = this.querySelector(".fc-notes-panel");
    this.$audioEl = this.querySelector(".fc-audio") as HTMLAudioElement | null;

    if (this.$showBtn && this.$inner) {
      this.$showBtn.addEventListener("click", () => {
        this.$inner!.classList.add("fc-flipped");
      });
    }
    if (this.$hideBtn && this.$inner) {
      this.$hideBtn.addEventListener("click", () => {
        this.$inner!.classList.remove("fc-flipped");
      });
    }

    if (this.$notesBtn && this.$notesPanel) {
      this.$notesBtn.addEventListener("click", () => {
        this.$notesPanel!.classList.toggle("hidden");
      });
    }

    if (this.$playBtn && this.$audioEl) {
      this.$playBtn.addEventListener("click", () => {
        this.$audioEl && this.$audioEl.play().catch(() => {});
      });
    }

    if (this.$editBtn) {
      this.$editBtn.addEventListener("click", () => {
        eventManager.publish("modal:newCard:open", {
          cardId: this.props.card.id,
        });
      });
    }
  }

  async getTemplate() {
    const card = this.props.card;
    const lang = this.props.frontLanguage;
    const translation = card.translation?.[lang] ?? "";
    const example = card.exampleSentence?.[lang] ?? "";
    const notes = card.notes ?? "";
    
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
    const difficultyEmoji = difficultyConfig[difficulty]?.emoji || "";

    // Build SButton components
    const flipIcon = await window.slice.build("SIcon", {
      name: "rotate",
      class: "",
    });

    const flipIcon2 = await window.slice.build("SIcon", {
      name: "rotate",
      class: "",
    });

    this.$showBtn = await window.slice.build("SButton", {
      content: flipIcon2,
      variant: "ghost",
      class: "fc-show-btn",
      size: "icon",
    });

    this.$hideBtn = await window.slice.build("SButton", {
      content: flipIcon,
      variant: "ghost",
      class: "fc-hide-btn",
      size: "icon",
    });

    const playIcon = await window.slice.build("SIcon", {
      name: "play",
      class: "",
    });

    this.$playBtn = await window.slice.build("SButton", {
      content: playIcon,
      size: "icon",
      variant: "ghost",
      class: "fc-audio-play",
    });

    const notesIcon = await window.slice.build("SIcon", {
      name: "lightbulb",
      class: "",
    });

    this.$notesBtn = await window.slice.build("SButton", {
      content: notesIcon,
      size: "icon",
      variant: "ghost",
      class: "fc-notes-btn",
    });

    const editIcon = await window.slice.build("SIcon", {
      name: "pen-to-square",
      class: "",
    });

    this.$editBtn =
      this.props.showEditButton !== false
        ? await window.slice.build("SButton", {
            content: editIcon,
            size: "icon",
            variant: "ghost",
            class: "fc-edit-btn",
          })
        : null;

    // Build progress visualizer if needed
    if (this.props.showProgress) {
      const progressScore = card.progressScore?.[lang] ?? 0;
      this.$progressViz = await window.slice.build("ProgressVisualizer", {
        progress: progressScore,
      });
    }

    // Build the card body with fixed dimensions
    const cardFrag = html`
      <div class="fc-outer w-96 h-64 inline-block">
        <div class="fc-inner rounded shadow border bg-white w-96 h-64">
          <!-- Front face -->
          <div
            class="fc-face fc-front p-6 flex flex-col h-full ${difficultyColor} relative"
            style="backface-visibility: hidden;"
          >
            <!-- Progress visualizer in top-right (front face only) -->
            ${this.$progressViz && hasTranslation
              ? html`<div
                  class="absolute top-2 right-2 z-10 scale-50 origin-top-right"
                  style="backface-visibility: hidden;"
                >
                  ${this.$progressViz}
                </div>`
              : ""}
            <div class="flex-1 flex flex-col min-h-0">
              ${hasTranslation
                ? html`
                    <div
                      class="text-2xl font-semibold text-font-primary flex items-center gap-2"
                    >
                      <span>${translation}</span>
                      ${difficultyEmoji
                        ? html`<span class="text-2xl">${difficultyEmoji}</span>`
                        : ""}
                    </div>
                    ${example
                      ? html`<div
                          class="mt-3 text-base text-font-secondary italic line-clamp-3"
                        >
                          ${example}
                        </div>`
                      : ""}
                    ${notes
                      ? html`<div
                          class="fc-notes-panel mt-3 p-3 rounded bg-white bg-opacity-60 text-sm text-font-secondary hidden overflow-auto"
                        >
                          ${notes}
                        </div>`
                      : ""}
                  `
                : html`
                    <div class="flex flex-col items-start justify-center h-full gap-3">
                      <div class="text-lg text-font-secondary text-left">
                        No hay traducción disponible para este idioma
                      </div>
                      <div class="text-sm text-font-secondary text-left italic">
                        Por favor, edita la carta para añadir una traducción
                      </div>
                    </div>
                  `}
            </div>

            <!-- Bottom section with buttons -->
            <div class="mt-auto pt-4 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                ${this._audioUrl ? this.$playBtn : ""}
                ${notes ? this.$notesBtn : ""} ${this.$editBtn || ""}
                ${this._audioUrl
                  ? html`<audio
                      class="fc-audio hidden"
                      src="${this._audioUrl}"
                      preload="metadata"
                    ></audio>`
                  : ""}
              </div>
              ${this.props.showFlipButton ? this.$showBtn : ""}
            </div>
          </div>

          <!-- Back face -->
          <div
            class="fc-face fc-back p-6 absolute inset-0 ${difficultyColor} rounded-md flex flex-col items-center justify-center h-full"
          >
            <div class="text-3xl font-semibold text-font-primary text-center">
              ${card.originalText}
            </div>
            ${this.props.showFlipButton
              ? html`<div class="absolute bottom-6 left-6">
                  ${this.$hideBtn}
                </div>`
              : ""}
          </div>
        </div>
      </div>
    `;

    // If selectable, wrap the card in a Selectable
    if (this.props.selectable) {
      // Extract a single root element from fragment to pass as content
      const container = document.createElement("div");
      container.appendChild(cardFrag);
      const rootEl = container.firstElementChild as HTMLElement;
      const selectable = await (window as any).slice.build("Selectable", {
        onSelectChange: this.props.onSelectChange,
        content: rootEl,
      });
      return html`${selectable}`;
    }

    return cardFrag;
  }

  async loadAudio() {
    const audioId = this.props.card.audioAssetId?.[this.props.frontLanguage];
    if (audioId) {
      this.audioAsset = await this.db.get("audio", audioId);
      if (this.audioAsset?.blob) {
        try {
          this._audioUrl = URL.createObjectURL(this.audioAsset.blob);
        } catch {}
      }
    }
  }

  flip() {
    if (this.$inner) {
      this.$inner.classList.toggle("fc-flipped");
    }
  }

  disconnectedCallback() {
    if (this._audioUrl) {
      try {
        URL.revokeObjectURL(this._audioUrl);
      } catch {}
      this._audioUrl = null;
    }
  }
}

customElements.define("slice-flashcard", Flashcard);
