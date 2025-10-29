import html from "@/lib/render";
import type { DialogProps } from "./Dialog.types";

export default class Dialog extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  props: DialogProps;

  private $dialog: HTMLDialogElement | null = null;

  constructor(props: DialogProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  init() {
    // Component initialization logic (can be async)
    const frag = this.getTemplate();
    this.appendChild(frag);

    this.$dialog = this.querySelector("dialog");

    // Close when clicking backdrop
    if (this.$dialog) {
      this.$dialog.addEventListener("click", (e) => {
        if (e.target === this.$dialog) {
          this.open = false;
        }
      });

      this.$dialog.addEventListener("close", () => {
        this.props.onClose?.();
      });
    }

    // Apply initial state
    if ((this as any).props?.open) {
      this.open = true;
    }
  }

  getTemplate() {
    return html`
      <dialog
        class="rounded p-0 shadow-xl md:w-[80vw] w-full"
      >
        <div class="bg-white rounded-xl overflow-hidden">
          ${this.props.content ?? ""}
        </div>
      </dialog>
    `;
  }
  update() {
    // Component update logic (can be async)
  }

  // Public API: open/close + property setter
  set open(value: boolean) {
    if (value) this.openDialog();
    else this.closeDialog();
  }

  get open(): boolean {
    return !!this.$dialog?.open;
  }

  private openDialog() {
    if (!this.$dialog) return;
    if (!this.$dialog.open) {
      // Use modal so backdrop is shown
      this.$dialog.showModal();
    }
  }

  private closeDialog() {
    if (!this.$dialog) return;
    if (this.$dialog.open) {
      this.$dialog.close();
    }
  }
}

customElements.define("slice-dialog", Dialog);
