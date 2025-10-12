import build from "../../../lib/build";

export default class HomePage extends HTMLElement {
   constructor(props: any) {
      super();
      window.slice.attachTemplate(this);

      window.slice.controller.setComponentProps(this, props);
   }

   async init() {

      const demoComponent = await window.slice.build('Demo', { exampleProp: 'Hello from HomePage' });

      this.appendChild(demoComponent);
   }
   
}

customElements.define('slice-home-page', HomePage);