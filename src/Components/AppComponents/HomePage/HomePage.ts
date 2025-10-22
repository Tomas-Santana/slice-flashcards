import { html } from "@/lib/render";

const sidebarRoutes = [
  { name: "Practicar", path: "/" },
  { name: "Mis cartas y mazos", path: "/flashcards" },
  { name: "Configuración", path: "/settings" }
]

export default class HomePage extends HTMLElement {
  constructor(props: any) {
    super();
    window.slice.attachTemplate(this);

    window.slice.controller.setComponentProps(this, props);
  }

  async init() {
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
  }

  async getTemplate() {
    const sidebarLogo = await window.slice.build("Logo", {
      size: "2xl",
      textColor: "#333",
    });

    const sidebar = await window.slice.build("Sidebar", {
      routes: sidebarRoutes,
      defaultOpen: false,
      header: sidebarLogo,
    });
    const sidebarToggle = await window.slice.build("SidebarToggle", {
      label: "→",
    }); 

    return html`
      <div class="flex flex-col gap-2">
        ${sidebar}
        ${sidebarToggle}
        <div class="flex flex-col items-center justify-center h-screen">
          <div class="w-full h-12 bg-blue-500">
            <h1 class="text-white text-center pt-3">Hello</h1>
          </div>
          <div class="w-24"></div>
        </div>
      </div>
    `;
    
  }
}

customElements.define("slice-home-page", HomePage);
