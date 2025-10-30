import { Settings } from "@/Components/Service/DB/models/settings";
import type { LanguageSelectProps } from "./LanguageSelect.types";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import { LANGUAGE_NAME_MAP, LanguageCode } from "@/lib/types/languages";
import html from "@/lib/render";
import eventManager from "@/Components/Service/EventManager/EventManager";

export default class LanguageSelect extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  private db = openDatabase();
  private settings: Settings;

  constructor(props: LanguageSelectProps) {
    super();
  }

  async init() {
    // Component initialization logic (can be async)
    const settings = await this.db.get("settings", "settings");
    this.settings = settings;

    const fragment = await this.getTemplate();
    this.appendChild(fragment);

    this.querySelector("select")?.addEventListener("change", (event) => {
      const target = event.target as HTMLSelectElement;
      this.onLanguageSelect(target.value);
    });
  }

  async getTemplate() {
    // Template rendering logic (can be async)
    const options = [
      {
        value: this.settings.selectedLanguage,
        text: LANGUAGE_NAME_MAP[this.settings.selectedLanguage],
      },
    ];

    this.settings.languages.forEach((lang) => {
      if (lang !== this.settings.selectedLanguage) {
        options.push({ value: lang, text: LANGUAGE_NAME_MAP[lang] });
      }
    });

    return html`
      <div class="flex gap-2">
        <label for="language-select" class="self-center text-font-primary"
          >Idioma objetivo:</label
        >
        <select
          id="language-select"
          class="language-select border border-gray-300 rounded px-3 py-2"
        >
          ${options.map(
            (option) =>
              html`<option value="${option.value}">${option.text}</option>`
          )}
        </select>
      </div>
    `;
  }

  async onLanguageSelect(code: string) {
    this.settings.languages = this.settings.languages.filter(
      (lang) => lang !== code
    );
    // add the previous selected language to the available languages
    this.settings.languages.push(this.settings.selectedLanguage);
    // set the new selected language
    this.settings.selectedLanguage = code as LanguageCode;

    await this.db.put("settings", this.settings);

    eventManager.publish("settings:updated", { ...this.settings });
  }

  update() {
    // Component update logic (can be async)
  }
}

customElements.define("slice-languageselect", LanguageSelect);
