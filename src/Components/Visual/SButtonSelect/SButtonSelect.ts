import type SToggleButton from "../SToggleButton/SToggleButton";
import type { SButtonSelectProps } from "./SButtonSelect.types";
import html from "@/lib/render";

export default class SButtonSelect extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
    label: { type: "string", default: "", required: false },
  };
  props: SButtonSelectProps;
  $buttons: SToggleButton[] = [];

  constructor(props: SButtonSelectProps) {
    super();
    this.props = props;
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
  }

  async init() {
    // Component initialization logic (can be async)
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
  }

  async update() {
    // Component update logic (can be async)
    this.innerHTML = "";
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
  }

  async getTemplate() {
    // a button group where only one button can be selected at a time
    this.$buttons = await Promise.all(
      this.props.options.map(
        async (option, idx) =>
          await window.slice.build("SToggleButton", {
            content: option.label,
            // Pass a managed click handler: parent will control selection state
            onClick: () => {
              if (this.props.singleSelect) {
                // Deselect all others, select only the clicked one
                this.$buttons.forEach((btn, bIdx) => {
                  btn.toggled = bIdx === idx;
                });
              } else {
                // Toggle only the clicked one (multi-select)
                const clicked = this.$buttons[idx];
                clicked.toggled = !clicked.toggled;
              }
              // Notify selection (always send clicked value)
              this.props.onSelect(option.value);
            },
            selected: this.props.selectedValue === option.value,
          })
      )
    );

    const hasLabel =
      !!this.props.label && String(this.props.label).trim().length > 0;
    const frag = html`
      <div class="flex flex-col gap-2">
        ${hasLabel
          ? html`<label class="text-md text-font-secondary font-bold"
              >${this.props.label}</label
            >`
          : ""}
        <div class="flex gap-2">${this.$buttons}</div>
      </div>
    `;
    return frag;
  }

  set selected(value: any) {
    this.$buttons.forEach((btn, idx) => {
      const option = this.props.options[idx];
      btn.toggled = option.value === value;
    });
    this.props?.onSelect && this.props.onSelect(value);
  }
}

customElements.define("slice-sbuttonselect", SButtonSelect);
