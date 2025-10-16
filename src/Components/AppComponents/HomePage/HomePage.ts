import build from "../../../lib/build";

export default class HomePage extends HTMLElement {
  constructor(props: any) {
    super();
    window.slice.attachTemplate(this);

    window.slice.controller.setComponentProps(this, props);
  }

  async init() {
    // demo button (debug)
    const demoComponent = await build("Demo", {
      exampleProp: "Hello from HomePage",
    });

    this.appendChild(demoComponent);
    
    
    // button that onclick goes from HomePage to StartupPage
    
    const startupButton= await build("Button", {
      value: 'Ir a Startup',
      onClickCallback: async () => {
        if (window.slice.router)
          window.slice.router.navigate("/startup");
      }
    });
    
    this.appendChild(startupButton);
    
  }
}

customElements.define("slice-home-page", HomePage);
