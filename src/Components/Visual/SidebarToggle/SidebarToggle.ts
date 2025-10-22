import eventManager from "../../Service/EventManager/EventManager";
import type { SidebarToggleProps } from "./SidebarToggle.types";

export default class SidebarToggle extends HTMLElement {
  static props = {
    // runtime schema placeholder
  };

  props: SidebarToggleProps;
  private $container: HTMLElement | null = null;

  constructor(props: SidebarToggleProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = { label: "Menu", ...props };
    this.$container = this.querySelector(
      ".sidebar-toggle-root"
    ) as HTMLElement | null;
  }

  async init() {
    await this.renderButton();
  }

  async update() {
    const nextProps = (this as any).props as SidebarToggleProps | undefined;
    this.props = { ...this.props, ...(nextProps ?? {}) };
    await this.renderButton();
  }

  private async renderButton() {
    if (!this.$container) return;
    this.$container.innerHTML = "";

    const label = this.props.label ?? ">";

    const button = await window.slice.build("Button", {
      value: label,
      onClickCallback: () => {
        eventManager.publish("sidebar:toggle", {});
      },
    });

    this.$container.appendChild(button);
  }
}

customElements.define("slice-sidebartoggle", SidebarToggle);
