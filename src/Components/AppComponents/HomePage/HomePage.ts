import { html } from "@/lib/render";

const sidebarRoutes = [
  { name: "Practicar", path: "/" },
  { name: "Mis cartas y mazos", path: "/flashcards" },
];

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
      iconName: "bars",
    });
    const languageSelect = await window.slice.build("LanguageSelect", {});

    const multiRoute = await window.slice.build("MultiRoute", {
      routes: [
        {
          path: "/",
          component: "PracticePage",
        },
        {
          path: "/flashcards",
          component: "FlashcardsPage",
        }
      ],
    });

    return html`
      <div class="flex flex-col gap-2">
        ${sidebar}
        <div class="flex w-full items-center justify-between px-4 mb-4">
        
        ${sidebarToggle} 
        ${languageSelect}
        </div> 
        ${multiRoute}
      </div>
    `;
  }
}

customElements.define("slice-home-page", HomePage);
