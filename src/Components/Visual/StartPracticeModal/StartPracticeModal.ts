import html from "@/lib/render";
import type { StartPracticeModalProps } from "./StartPracticeModal.types";
import Dialog from "../Dialog/Dialog";
import { DifficultyBand } from "@/Components/Service/DB/models/common";

export default class StartPracticeModal extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  props: StartPracticeModalProps;
	private selectedDifficulty: DifficultyBand = "basic";
  private $dialog: Dialog | null = null;
  private $startPracticeButton: HTMLElement | null = null;
  private $difficultySelect: HTMLElement | null = null;
  private $timerCheckbox: HTMLInputElement | null = null;

  constructor(props: StartPracticeModalProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    this.$difficultySelect = await window.slice.build("Select", {
      options: [
        { text: "Básico", value: "basic" },
        { text: "Intermedio", value: "intermediate" },
        { text: "Avanzado", value: "advanced" },
      ],
      disabled: false,
      label: "Dificultad mínima:",
			onOptionSelect(opt) {
				this.selectedDifficulty = opt.value as DifficultyBand;
			},
    });

    this.$timerCheckbox = await window.slice.build("Checkbox", {
      label: "Cronometrar práctica",
    });

    this.$startPracticeButton = await window.slice.build("Button", {
      value: "Iniciar práctica",
    });
    const frag = await this.getTemplate();
    this.appendChild(frag);
    // Apply initial open state if provided
    if ((this as any).props?.open && this.$dialog) {
      (this.$dialog as any).open = true;
    }
  }

  update() {
    // Component update logic (can be async)
  }

  async getTemplate() {
    const deck =
      this.props.deck || ({ name: "", emoji: "🃏", difficulty: "" } as any);

    const content = html`
      <div class="p-4 flex flex-col items-start gap-4">
        <div class="flex gap-4">
          <div
            class="w-12 h-12 flex items-center justify-center rounded-lg bg-primary-bg overflow-hidden"
          >
            <span class="text-2xl flex items-center justify-center"
              >${deck.emoji}</span
            >
          </div>
          <div class="flex flex-col">
            <p class="text-xl text-font-primary font-bold">${deck.name}</p>
            <p class="text-sm text-font-secondary">
              Dificultad: ${deck.difficulty ?? "—"}
            </p>
          </div>
        </div>
        ${this.$difficultySelect}
				${this.$timerCheckbox}
				<div class="w-full flex justify-end">
					${this.$startPracticeButton}
				</div>
			</div>
		`;

    const dialog = await window.slice.build("Dialog", {
      content,
    });
    this.$dialog = dialog as Dialog;
    return html`${dialog}`;
  }

  set open(value: boolean) {
    if (this.$dialog) this.$dialog.open = value;
  }

  get open(): boolean {
    return !!this.$dialog?.open;
  }
}

customElements.define("slice-startpracticemodal", StartPracticeModal);
