import build from "../../../lib/build";

export default class HomePage extends HTMLElement {
   constructor(props) {
      super();
      slice.attachTemplate(this);

      slice.controller.setComponentProps(this, props);
   }

   async init() {
   }
   
}

customElements.define('slice-home-page', HomePage);