import build from "../../../lib/build";

export default class HomePage extends HTMLElement {
  constructor(props: any) {
    super();
    window.slice.attachTemplate(this);

    window.slice.controller.setComponentProps(this, props);
    window.slice.setTheme("light");
  }

  async init() {
  }
}

customElements.define("slice-home-page", HomePage);
