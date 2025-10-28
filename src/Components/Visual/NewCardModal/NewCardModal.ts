import { DifficultyBand } from "@/Components/Service/DB/models/common";
import type { NewCardModalProps } from "./NewCardModal.types";
import type { Card } from "@/Components/Service/DB/models/card";
import { Settings } from "@/Components/Service/DB/models/settings";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import html from "@/lib/render";
import eventManager from "@/Components/Service/EventManager/EventManager";
import { LanguageCode } from "@/lib/types/languages";
import type Dialog from "../Dialog/Dialog";

export default class NewCardModal extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };
  props: NewCardModalProps;
  private db = openDatabase();
  $dialog: Dialog | null = null;
  cardValues: Partial<Card> = {
    deckIds: [],
    translation: {} as Record<LanguageCode, string>,
    exampleSentence: {} as Record<LanguageCode, string>,
    difficulty: "basic",
    notes: "",
  };
  _cardId: number | null = null;
  private settings: Settings;

  constructor(props: NewCardModalProps) {
    super();
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;

    eventManager.subscribe("modal:newCard:open", async (data) => {
      this.$dialog!.open = true;
    });
  }

  async init() {
    // Component initialization logic (can be async)
    this.settings = await this.db.get("settings", "settings");
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
  }
  async update() {
    const fragment = await this.getTemplate();
    this.innerHTML = "";
    this.appendChild(fragment);
  }

  async getTemplate() {
    // create form components
    const originalTextInput = await window.slice.build("Input", {
      placeholder: `Texto original (${this.settings.baseLanguage})`,
      value: this.cardValues.originalText || "",
      onChange: (value) => {
        this.cardValues.originalText = value;
      },
      conditions: { maxLength: 50 },
    });

    const translationInput = await window.slice.build("Input", {
      placeholder: `Traducción (${this.settings.selectedLanguage})`,
      onChange: (value) => {
        this.cardValues.translation[this.settings.selectedLanguage] = value;
      },
      conditions: { maxLength: 50 },
    });

    const exampleSentenceInput = await window.slice.build("Input", {
      placeholder: `Ejemplo de oración (${this.settings.selectedLanguage})`,
      onChange: (value) => {
        this.cardValues.exampleSentence[this.settings.selectedLanguage] = value;
      },
      conditions: { maxLength: 50 },
    });

    const notesInput = await window.slice.build("Input", {
      placeholder: `Pista (opcional)`,
      onChange: (value) => {
        this.cardValues.notes = value;
      },
      conditions: { maxLength: 50 },
    });

    const difficultySelect = await window.slice.build("SButtonSelect", {
      options: [
        { label: "Básico", value: "basic" },
        { label: "Intermedio", value: "intermediate" },
        { label: "Avanzado", value: "advanced" },
      ],
      onSelect: (option) => {
        this.cardValues.difficulty = option as DifficultyBand;
      },
      selectedValue: this.cardValues.difficulty || "basic",
      singleSelect: true,
      label: "Nivel de dificultad",
    });
    const audioCombo = await window.slice.build("CardAudioCombo", {
      onAudioChange: (audioBlob: Blob | null, mimeType?: string) => {
        
      },

    });

    
    const createButton = await window.slice.build("Button", {
      value: "Crear carta",
      onClickCallback: () => {
        this.createCard();
      },
    });

    const dialogContent = html`
      <div class="p-4 flex flex-col items-start gap-8 w-full">
        <h3 class="text-2xl font-bold text-font-primary">Nueva carta</h3>
        <div class="flex gap-4 w-full">
        <div class="w-full">${originalTextInput}</div>
        <div class="w-full">${translationInput}</div>
        </div>
        <div class="w-full">
          ${exampleSentenceInput} 
        </div>
        <div class="w-full">${notesInput}</div>
        <div class="w-full">${difficultySelect}</div>
        <div class="w-full">${audioCombo}</div>
        
        ${createButton}
      </div>
    `;

    this.$dialog = await window.slice.build("Dialog", {
      content: dialogContent,
    });
    const triggerButton = await window.slice.build("Button", {
      value: this.props.triggerLabel,
      onClickCallback: () => {
        this.$dialog.open = true;
      },
    });

    return html` ${triggerButton} ${this.$dialog} `;
  }

  async createCard() {
    // Logic to create a new card in the database
    if (
      !this.cardValues.originalText ||
      !this.cardValues.translation ||
      !this.cardValues.difficulty
    ) {
      alert("Por favor, completa los campos obligatorios.");
      return;
    }

    const newCard: Omit<Card, "id"> = {
      originalText: this.cardValues.originalText!,
      translation: this.cardValues.translation!,
      exampleSentence: this.cardValues.exampleSentence!,
      notes: this.cardValues.notes,
      difficulty: this.cardValues.difficulty!,
      deckIds: this.cardValues.deckIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const newId = await this.db.add("cards", newCard);

    this.$dialog.open = false;
    // Reset cardValues to default structure to avoid undefined maps on subsequent edits
    this.cardValues = {
      deckIds: [],
      translation: {} as Record<LanguageCode, string>,
      exampleSentence: {} as Record<LanguageCode, string>,
      difficulty: "basic",
      notes: "",
    };
    eventManager.publish("card:created", { cardId: Number(newId) });
  }

  set cardId(value: number | null) {
    this._cardId = value;
    // update cardValues based on cardId
    if (value === null) {
      this.cardValues = {
        deckIds: [],
        translation: {} as Record<LanguageCode, string>,
        exampleSentence: {} as Record<LanguageCode, string>,
        difficulty: "basic",
        notes: "",
      };
      this.update();
      return;
    }
    this.db.get("cards", value).then((card) => {
      if (card) {
        this.cardValues = {
          originalText: card.originalText,
          translation: card.translation,
          exampleSentence: card.exampleSentence,
          notes: card.notes,
          difficulty: card.difficulty,
          deckIds: card.deckIds,
        };
        this.update();
      }
    });
  }
}

customElements.define("slice-newcardmodal", NewCardModal);
