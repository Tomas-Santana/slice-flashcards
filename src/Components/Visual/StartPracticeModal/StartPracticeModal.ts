import html from "@/lib/render";
import type { StartPracticeModalProps } from "./StartPracticeModal.types";
import Dialog from "../Dialog/Dialog";
import { DifficultyBand } from "@/Components/Service/DB/models/common";
import eventManager from "@/Components/Service/EventManager/EventManager";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import type SButtonSelect from "../SButtonSelect/SButtonSelect";

export default class StartPracticeModal extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  props: StartPracticeModalProps;
  private selectedDifficulty: DifficultyBand = "basic";
  private timed: boolean = false;
  private $dialog: Dialog | null = null;
  private $startPracticeButton: HTMLElement | null = null;
  private $difficultySelect: SButtonSelect | null = null;
  private $timerCheckbox: HTMLElement | null = null;
  private db = openDatabase();

  constructor(props: StartPracticeModalProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;

    // Subscribe to start practice event
    eventManager.subscribe("modal:startPractice:open", async ({ deckId }) => {
      const deck = await this.db.get("decks", deckId);
      if (deck) {
        this.props.deck = deck;
        await this.update();
        this.open = true;
      } else if (deckId === -1) {
        // Handle random practice deck
        const randomDeck = {
          id: -1,
          emoji: "🎲",
          name: "Mazo aleatorio",
          difficulty: "intermediate" as const,
          cardCount: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
          cardIds: [],
        };
        this.props.deck = randomDeck;
        await this.update();
        this.open = true;
      }
    });
  }

  async init() {
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
  }

  async update() {
    const fragment = await this.getTemplate();
    this.innerHTML = "";
    this.appendChild(fragment);
  }

  async getTemplate() {
    const deck =
      this.props.deck || ({ name: "", emoji: "🃏", difficulty: "" } as any);

    this.$difficultySelect = await window.slice.build("SButtonSelect", {
      options: [
        { label: "Básico", value: "basic" },
        { label: "Intermedio", value: "intermediate" },
        { label: "Avanzado", value: "advanced" },
      ],
      onSelect: (option: string) => {
        this.selectedDifficulty = option as DifficultyBand;
      },
      selectedValue: this.selectedDifficulty,
      singleSelect: true,
      label: "Dificultad mínima",
    });

    this.$timerCheckbox = await window.slice.build("Checkbox", {
      label: "Cronometrar práctica",
      onChange: (checked: boolean) => {
        this.timed = checked;
      },
    });

    this.$startPracticeButton = await window.slice.build("Button", {
      value: "Iniciar práctica",
      onClickCallback: () => {
        this.startPractice();
      },
    });

    const content = html`
      <div class="p-4 flex flex-col items-start gap-6 w-full">
        <div class="flex gap-4 items-center">
          <div class="text-5xl">${deck.emoji}</div>
          <div class="flex flex-col">
            <h3 class="text-2xl font-bold text-font-primary">${deck.name}</h3>
            <p class="text-sm text-font-secondary">
              ${deck.cardCount} ${deck.cardCount === 1 ? "carta" : "cartas"}
            </p>
          </div>
        </div>

        <div class="w-full">${this.$difficultySelect}</div>

        <div class="w-full">${this.$timerCheckbox}</div>

        <div class="w-full flex justify-end">${this.$startPracticeButton}</div>
      </div>
    `;

    this.$dialog = (await window.slice.build("Dialog", {
      content,
    })) as Dialog;

    return html`${this.$dialog}`;
  }

  startPractice() {
    const deckId = this.props.deck?.id;
    if (deckId === undefined) return;

    // Close the modal
    this.open = false;

    // Navigate to practice page with query params
    const url = `/practice/${deckId}?difficulty=${this.selectedDifficulty}&timed=${this.timed}`;
    window.slice.router.navigate(url);
  }

  set open(value: boolean) {
    if (this.$dialog) this.$dialog.open = value;
  }

  get open(): boolean {
    return !!this.$dialog?.open;
  }
}

customElements.define("slice-startpracticemodal", StartPracticeModal);
