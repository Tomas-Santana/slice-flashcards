import type { SelectableProps } from "./Selectable.types";
import html from "@/lib/render";

export default class Selectable extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  props: SelectableProps;

  private _selected = false;
  private $root: HTMLElement | null = null;
  private $checkboxHost: HTMLElement | null = null;
  private $contentHost: HTMLElement | null = null;
  private $checkboxEl: HTMLElement | null = null;

  constructor(props: SelectableProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    // Build checkbox first so we can place it directly inside the template
    const checkbox = await window.slice.build("Checkbox", {
      checked: !!this.props?.selected,
      onChange: (val: boolean) => {
        this.selected = val;
      },
    });

    const fragment = this.getTemplate(checkbox as HTMLElement);
    this.appendChild(fragment);

    this.$root = this.querySelector(".selectable-root");
    this.$checkboxHost = this.querySelector(".selectable-checkbox-host");
    this.$contentHost = this.querySelector(".selectable-content-host");

    // Apply initial selected state
    this.selected = !!this.props?.selected;
  }

  update() {
    // Component update logic (can be async)
  }

  getTemplate(checkbox?: HTMLElement) {
    const extra = this.props?.class ? this.props.class : "";
    // Keep constant border width to avoid layout shift. Use transparent when unselected.
    const borderBase = this.props?.selected
      ? "border-2 border-primary"
      : "border-2 border-transparent";
    return html`
      <div class="selectable-root relative ${borderBase} rounded-md ${extra}">
        <div class="selectable-checkbox-host absolute top-2 left-2 z-10">
          ${checkbox ?? ""}
        </div>
        <div class="selectable-content-host">${this.props?.content ?? ""}</div>
      </div>
    `;
  }

  get selected() {
    return this._selected;
  }

  set selected(val: boolean) {
    this._selected = !!val;
    // Update checkbox UI if present
    if (this.$checkboxEl) {
      (this.$checkboxEl as any).checked = this._selected;
    }
    // Toggle border styles
    if (this.$root) {
      // keep constant border width; just swap color
      this.$root.classList.add("border-2");
      this.$root.classList.toggle("border-primary", this._selected);
      this.$root.classList.toggle("border-transparent", !this._selected);
    }
    // Notify
    this.props?.onSelectChange?.(this._selected);
  }
}

customElements.define("slice-selectable", Selectable);
