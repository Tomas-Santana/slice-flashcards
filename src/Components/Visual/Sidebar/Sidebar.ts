import eventManager from "../../Service/EventManager/EventManager";
import type { SidebarProps, SidebarRoute } from "./Sidebar.types";
import { html } from "@/lib/render";

const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

export default class Sidebar extends HTMLElement {
  static props = {
    // runtime schema placeholder
  };

  props: SidebarProps;
  private isOpen: boolean = false;

  toggleUnsub: (() => void) | null = null;
  sidebarLinks: HTMLElement[] = []

  constructor(props: SidebarProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);

    this.props = { routes: [], ...props };
  }

  async init() {
    this.toggleUnsub = eventManager.subscribe("sidebar:toggle", () => {
      this.toggle();
    });

    document.addEventListener("keydown", (e) => {
      this.handleKeyDown(e);
    });

    this.appendChild(await this.getTemplate());

    const shouldOpen = this.props.defaultOpen ?? false;
    this.isOpen = shouldOpen;
    this.updateOpenState();
    this.highlightActiveRoute();
  }

  async update() {
    this.highlightActiveRoute();
    this.updateOpenState();
  }

  disconnectedCallback() {
    if (this.toggleUnsub) this.toggleUnsub();
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && this.isOpen) {
      this.close();
    }
  };

  private async getTemplate() {
    // slice.build sidebar links
    this.sidebarLinks = await Promise.all(
      this.props.routes.map((route: SidebarRoute) =>
        window.slice.build("SidebarLink", {
          label: route.name,
          href: route.path,
          onClick: () => {
            this.navigate(route.path);
            eventManager.publish("sidebar:toggle", {
              isOpen: false,
            });
          },
        })
      )
    );
    const sidebarToggle = await window.slice.build("SidebarToggle", {
      iconName: "x",
    });
    return html`
      <aside
        class="fixed top-0 left-0 h-full w-64 bg-white border-r border-border shadow-lg transform -translate-x-full transition-transform duration-300 ease-in-out z-50"
        aria-hidden="true"
        id="sidebar-panel"
      >
        <div class="flex flex-col h-full">
          <div class="w-full h-min flex justify-end">${sidebarToggle}</div>
          ${this.props.header && html`<div class="p-4 border-b border-border">${this.props.header}</div>`}
          <nav class="flex-1 overflow-y-auto p-4 space-y-2">
            ${this.sidebarLinks}
          </nav>
          ${this.props.footer &&
          html`<div class="p-4 border-t border-border">
            ${this.props.footer}
          </div>`}
        </div>
      </aside>
    `;
  }



  private async navigate(path: string) {
    try {
      await window.slice.router.navigate(path);
      this.close();
      this.highlightActiveRoute(path);
    } catch (err) {
      console.error("[Sidebar] Failed to navigate", err);
    }
  }

  private highlightActiveRoute(activePath?: string) {
    const path = activePath ?? window.location.pathname;
    for (const [routePath, button] of this.sidebarLinks.entries()) {
      const isActive = this.props.routes[routePath].path === path;
      if (isActive) {
        button.classList.add("bg-primary/20", "font-bold");
      } else {
        button.classList.remove("bg-primary/20", "font-bold");
      }
    }
  }

  private toggle() {
    this.isOpen = !this.isOpen;
    this.updateOpenState();
  }

  private close() {
    this.isOpen = false;
    this.updateOpenState();
  }

  private updateOpenState() {
    const panel = this.querySelector("#sidebar-panel");
    if (!panel) return;
    if (this.isOpen) {
      panel.classList.remove("-translate-x-full");
    } else {
      panel.classList.add("-translate-x-full");
    }

    panel.setAttribute(
      "aria-hidden",
      String(!(this.isOpen))
    );

    this.setAttribute("data-open", String(this.isOpen));
  }
}

customElements.define("slice-sidebar", Sidebar);
