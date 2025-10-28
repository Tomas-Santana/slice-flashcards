import type { FlashcardProps } from "./Flashcard.types";
import html from "@/lib/render";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import { AudioAsset } from "@/Components/Service/DB/models/audio";

export default class Flashcard extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: FlashcardProps;
  db = openDatabase();
  audioAsset: AudioAsset | null = null;
  private _audioUrl: string | null = null;
  private $inner: HTMLElement | null = null;
  private $showBtn: HTMLButtonElement | null = null;
  private $hideBtn: HTMLButtonElement | null = null;
  private $notesBtn: HTMLButtonElement | null = null;
  private $notesPanel: HTMLElement | null = null;
  private $audioEl: HTMLAudioElement | null = null;

  constructor(props: FlashcardProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    // Load audio (if any) before rendering so template can include the control
    await this.loadAudio();
    const fragment = await this.getTemplate();
    this.appendChild(fragment);

    // Grab refs and wire events
    this.$inner = this.querySelector(".fc-inner");
    this.$showBtn = this.querySelector(
      ".fc-show-btn"
    ) as HTMLButtonElement | null;
    this.$hideBtn = this.querySelector(
      ".fc-hide-btn"
    ) as HTMLButtonElement | null;
    this.$notesBtn = this.querySelector(
      ".fc-notes-btn"
    ) as HTMLButtonElement | null;
    this.$notesPanel = this.querySelector(
      ".fc-notes-panel"
    ) as HTMLElement | null;
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

    if (this.$audioEl) {
      const playBtn = this.querySelector(
        ".fc-audio-play"
      ) as HTMLButtonElement | null;
      if (playBtn) {
        playBtn.addEventListener("click", () => {
          this.$audioEl && this.$audioEl.play().catch(() => {});
        });
      }
    }
  }

  update() {
    // Component update logic (can be async)
  }

  async getTemplate() {
    const card = this.props.card;
    const lang = this.props.frontLanguage;
    const translation = card.translation?.[lang] ?? "";
    const example = card.exampleSentence?.[lang] ?? "";
    const notes = card.notes ?? "";

    // Build the card body first
    const cardFrag = html`
      <div class="fc-outer">
        <div class="fc-inner rounded shadow border bg-white">
          <div class="fc-face fc-front p-8 flex flex-col">
            <div class="text-2xl font-semibold text-font-primary">
              ${translation}
            </div>
            ${example
              ? html`<div class="mt-2 text-base text-font-secondary italic">
                  ${example}
                </div>`
              : ""}
            <div class="mt-4 flex items-center gap-2">
              ${this._audioUrl
                ? html`
                    <button
                      type="button"
                      class="fc-audio-play px-3 py-1 rounded border border-border text-sm"
                    >
                      Play
                    </button>
                    <audio
                      class="fc-audio hidden"
                      src="${this._audioUrl}"
                      preload="metadata"
                    ></audio>
                  `
                : ""}
              ${notes
                ? html`<button
                    type="button"
                    class="fc-notes-btn px-3 py-1 rounded border border-border text-sm"
                  >
                    Hints
                  </button>`
                : ""}
            </div>
            ${notes
              ? html`<div
                  class="fc-notes-panel mt-2 p-2 rounded bg-primary-bg text-sm text-font-secondary hidden"
                >
                  ${notes}
                </div>`
              : ""}
            ${this.props.showFlipButton
              ? html`<div class="mt-auto pt-6">
                  <button
                    type="button"
                    class="fc-show-btn px-3 py-1 rounded border border-border text-sm"
                  >
                    Show answer
                  </button>
                </div>`
              : ""}
          </div>
          <div
            class="fc-face fc-back p-8 absolute inset-0 bg-white rounded-md flex flex-col"
          >
            <div class="text-2xl font-semibold text-font-primary">
              ${card.originalText}
            </div>
            ${this.props.showFlipButton
              ? html`<div class="mt-auto pt-6">
                  <button
                    type="button"
                    class="fc-hide-btn px-3 py-1 rounded border border-border text-sm"
                  >
                    Hide answer
                  </button>
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
