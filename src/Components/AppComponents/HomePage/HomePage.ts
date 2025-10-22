import { openDatabase } from "../../Service/DB/openDatabase";
import { IndexedDBService } from "c:/Users/tommy/Documents/URU/componentes/flashcards/src/Components/Service/DB/IndexedDB";

export default class HomePage extends HTMLElement {
  db: IndexedDBService;
  constructor(props: any) {
    super();
    window.slice.attachTemplate(this);

    window.slice.controller.setComponentProps(this, props);
    this.db = openDatabase();
  }

  async init() {
  }

}

customElements.define("slice-home-page", HomePage);
