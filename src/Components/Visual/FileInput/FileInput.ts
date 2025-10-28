import type SButton from "../SButton/SButton";
import type { FileInputProps } from "./FileInput.types";
import html from "@/lib/render";

export default class FileInput extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
    accept: { type: "string", default: "" },
    multiple: { type: "boolean", default: false },
    disabled: { type: "boolean", default: false },
    onFileSelect: { type: "function", default: null },
  };
  props: FileInputProps;

  private $input: HTMLInputElement | null = null;
  private $button: SButton | null = null;
  private $status: HTMLElement | null = null;

  constructor(props: FileInputProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;

  }

  async init() {
    // Build and attach DOM
    const frag = await this.getTemplate();
    this.appendChild(frag);

    this.$input = this.querySelector(
      ".slice_fileinput_input"
    ) as HTMLInputElement | null;
    this.$status = this.querySelector(
      ".slice_fileinput_status"
    ) as HTMLElement | null;


    if (this.$input) {
      // Initialize attributes now that element exists
      this.$input.accept = this.props.accept || "";
      this.$input.multiple = !!this.props.multiple;
      this.$input.disabled = !!this.props.disabled;

      this.$input.addEventListener("change", () => {
        const files = this.$input!.files;
        if (!files || files.length === 0) {
          this.updateStatus();
          return;
        }
        // Call onFileSelect once per file (supports multiple)
        if (this.props.onFileSelect) {
          Array.from(files).forEach((f) => this.props.onFileSelect!(f));
        }
        this.updateStatus(files);
      });
    }

    // Initial disabled state + status
    this.syncDisabled();
    this.updateStatus();
  }

  update() {
    // Sync accept/multiple/disabled changes on the fly
    if (this.$input) {
      if (typeof this.props.accept === "string")
        this.$input.accept = this.props.accept || "";
      this.$input.multiple = !!this.props.multiple;
    }
    this.syncDisabled();
  }

  async getTemplate() {
    const acceptAttr = this.props?.accept || "";

    this.$button = await window.slice.build("SButton", {
      content: `Choose file${this.props?.multiple ? "s" : ""}`,
      onClick: async () => {
        if (this.props.disabled) return;
        this.$input!.click();
      }
    });

    return html`
      <div class="slice_fileinput flex flex-col gap-2">
        <input
          class="slice_fileinput_input hidden"
          type="file"
          accept="${acceptAttr}"
        />
        <div class="flex items-center gap-3">
          ${this.$button}
          <div class="slice_fileinput_status text-md text-font-secondary">
            
          </div>
        </div>
      </div>
    `;
  }

  private updateStatus(files?: FileList | null) {
    if (!this.$status) return;
    const f = files ?? this.$input?.files ?? null;
    if (!f || f.length === 0) {
      this.$status.textContent = "No file selected";
      return;
    }
    if (f.length === 1) {
      this.$status.textContent = f[0].name;
      return;
    }
    this.$status.textContent = `${f.length} files selected`;
  }

  private syncDisabled() {
    const disabled = !!this.props?.disabled;
    if (this.$input) this.$input.disabled = disabled;
    if (this.$button) this.$button.disabled = disabled;
    if (this.$button) {
      this.$button.classList.toggle("opacity-50", disabled);
      this.$button.classList.toggle("pointer-events-none", disabled);
    }
  }
}

customElements.define("slice-fileinput", FileInput);
