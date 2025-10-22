import type { StartPageProps } from "./StartPage.types";
import { LANGUAGE_LIST, LanguageCode, LanguageOption } from "../../../lib/types/languages";
import { openDatabase } from "../../../Components/Service/DB/openDatabase";
import { IndexedDBService } from "@/Components/Service/DB/IndexedDB";

export default class StartPage extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  $nameSpan: HTMLSpanElement | null = null;
  $targetSpan: HTMLSpanElement | null = null;
  $formContainer: HTMLDivElement | null = null;
  $header: HTMLElement | null = null;
  _name: string = "";
  _nativeLanguage: { code: string; name: string } = {} as {
    code: string;
    name: string;
  };
  _targetLanguage: { code: string; name: string } = {} as {
    code: string;
    name: string;
  };
  _extraLanguages: { code: string; name: string }[] = [];
  _db: IndexedDBService | null = null;

  constructor(props: StartPageProps) {
    super();
    window.slice.attachTemplate(this);
    window.slice.controller.setComponentProps(this, props);

    this.$nameSpan = this.querySelector("#name-span") as HTMLSpanElement | null;
    this.$header = this.querySelector("header") as HTMLElement | null;
    this.$targetSpan = this.querySelector(
      "#target-span"
    ) as HTMLSpanElement | null;

    this.$formContainer = this.querySelector(
      "#form-container"
    ) as HTMLDivElement | null;
    this._db = openDatabase();
  }

  async init() {
    await this.renderHeader();
    await this.renderForm();
  }
  // Render the header logo
  private async renderHeader() {
    if (!this.$header) return;

    const logo = await window.slice.build("Logo", {
      size: "2xl",
      textColor: "#333",
    });
    this.$header.appendChild(logo);
  }

  // Build and append the full form using helper builders
  private async renderForm() {
    if (!this.$formContainer) return;

    const input = await this.createInput({
      placeholder: "¿Cómo te llamas?",
      value: "",
      required: true,
      conditions: { maxLength: 50, minLength: 2 },
      onChange: (v: string) => (this.name = v),
    });

    const baseSelect = await this.createSelect({
      label: "Idioma nativo",
      multiple: false,
      onOptionSelect: (opt: any) => {
        // set native language (store code + text)
        const v =
          opt && Object.prototype.hasOwnProperty.call(opt, "value")
            ? opt
            : { text: opt.text, value: opt.value };
        this._nativeLanguage = { code: v.value, name: v.text };
      },
    });

    const targetSelect = await this.createSelect({
      label: "Idioma objetivo",
      multiple: false,
      onOptionSelect: (opt: any) => {
        // pass the option object to the setter which expects {text,value}
        this.targetLanguage = opt;
      },
    });

    const extraSelect = await this.createSelect({
      label: "Idiomas adicionales (opcional)",
      multiple: true,
      onOptionSelect: (opt: any) => {
        this._extraLanguages.push({ code: opt.value, name: opt.text });
      },
    });

    const submitButton = await this.createButton({
      value: "Comenzar",
      onClickCallback: async () => await this.onSubmit(),
    });

    input.id = "name";

    this.$formContainer.appendChild(input);
    this.$formContainer.appendChild(baseSelect);
    this.$formContainer.appendChild(targetSelect);
    this.$formContainer.appendChild(extraSelect);
    this.$formContainer.appendChild(submitButton);

    this.$nameSpan!.textContent = this._name.length
      ? this._name + "!"
      : "Amigo!";
  }

  // Helper: create a Select via slice.build with common options
  private async createSelect(opts: {
    label?: string;
    multiple?: boolean;
    onOptionSelect?: (opt: any) => void;
  }) {
    const select = await window.slice.build("Select", {
      options: LANGUAGE_LIST.map((l) => ({ text: `${l.name}`, value: l.code })),
      label: opts.label || "",
      multiple: !!opts.multiple,
      disabled: false,
      onOptionSelect: (opt: any) => {
        try {
          opts.onOptionSelect && opts.onOptionSelect(opt);
        } catch (e) {
          console.warn("onOptionSelect handler error", e);
        }
      },
    });
    return select;
  }

  private async createInput(cfg: any) {
    const input = await window.slice.build("Input", cfg);
    return input;
  }

  private async createButton(cfg: any) {
    const btn = await window.slice.build("Button", cfg);
    return btn;
  }

  update() {
    // Component update logic
  }

  private set name(name: string) {
    // strip name
    this._name = name.trim();
    if (this.$nameSpan) {
      this.$nameSpan.textContent = this._name.length
        ? this._name + "!"
        : "Amigo!";
    }
  }
  private set targetLanguage(lang: { text: string; value: string }) {
    this._targetLanguage = {
      code: lang.value,
      name: lang.text,
    };
    if (this.$targetSpan) {
      const langObj = LANGUAGE_LIST.find((l) => l.code === lang.value);
      this.$targetSpan.textContent = langObj
        ? langObj.name + "?"
        : "un nuevo idioma?";
    }
  }

  private async onSubmit() {
    // Validate required fields
    if (!this._name) {
      alert("Por favor, ingresa tu nombre.");
      return;
    }
    if (!this._nativeLanguage.code) {
      alert("Por favor, selecciona tu idioma nativo.");
      return;
    }
    if (!this._targetLanguage.code) {
      alert("Por favor, selecciona tu idioma objetivo.");
      return;
    }
    
    // Save user data to IndexedDB
    if (this._db) {
      console.log("Saving settings to DB")
      await this._db.put("settings", {
        id: "settings",
        name: this._name,
        baseLanguage: this._nativeLanguage.code as LanguageCode,
        selectedLanguage: this._targetLanguage.code as LanguageCode,
        languages: this._extraLanguages.map((l) => l.code as LanguageCode),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    window.slice.router.navigate("/");
  }
}

customElements.define("slice-startpage", StartPage);
