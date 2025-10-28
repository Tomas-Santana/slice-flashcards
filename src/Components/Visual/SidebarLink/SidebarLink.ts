import type { SidebarLinkProps } from "./SidebarLink.types";
import { html } from "@/lib/render";
import eventManager from "@/Components/Service/EventManager/EventManager";

export default class SidebarLink extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: SidebarLinkProps = {
    href: "",
    label: "",
    onClick: () => {},
  };
  constructor(props: SidebarLinkProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);

		this.props = props;
  }

  async init() {
    const fragment = this.getTemplate();
    this.appendChild(fragment);
  }

  update() {
    // Component update logic (can be async)
  }

  getTemplate() {
    const fragment = html`
      <a
        class="w-full block px-4 py-2 text-font-primary hover:bg-gray-200 rounded"
        href="${this.props.href}"
      >
        ${this.props.label}
      </a>
    `;

    const anchor = fragment.querySelector("a");
    if (anchor) {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        window.slice.router.navigate(this.props.href || "/");
        this.props.onClick();
      });
    }
    
    return fragment;
  }
}

customElements.define("slice-sidebarlink", SidebarLink);
