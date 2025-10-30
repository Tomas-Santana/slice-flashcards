import { DifficultyBand } from "@/Components/Service/DB/models/common";
import type { NewCardModalProps } from "./NewCardModal.types";
import type { Card } from "@/Components/Service/DB/models/card";
import type { AudioAsset } from "@/Components/Service/DB/models/audio";
import { Settings } from "@/Components/Service/DB/models/settings";
import { openDatabase } from "@/Components/Service/DB/openDatabase";
import html from "@/lib/render";
import eventManager from "@/Components/Service/EventManager/EventManager";
import { LanguageCode } from "@/lib/types/languages";
import type Dialog from "../Dialog/Dialog";
import type SButtonSelect from "../SButtonSelect/SButtonSelect";
import type CardAudioCombo from "../CardAudioCombo/CardAudioCombo";

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
  _audioAsset: AudioAsset | null = null;
  _cardId: number | null = null;
  private settings: Settings;

  // Form input components
  private $originalTextInput: HTMLElement | null = null;
  private $translationInput: HTMLElement | null = null;
  private $exampleSentenceInput: HTMLElement | null = null;
  private $notesInput: HTMLElement | null = null;
  private $difficultySelect: SButtonSelect | null = null;
  private $audioCombo: CardAudioCombo | null = null;

  constructor(props: NewCardModalProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;

    eventManager.subscribe(
      "modal:newCard:open",
      async (data) => {
        if (data?.cardId) {
          // Edit mode: load card data
          await this.loadCard(data.cardId);
        } else {
          // Create mode: reset to defaults
          this.resetFormFields();
        }
        this.$dialog!.open = true;
      }
    );
    eventManager.subscribe("settings:updated", async () => {
      await this.loadSettings();
      await this.update();
    });
  }

  async init() {
    // Component initialization logic (can be async)
    await this.loadSettings();
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
  }
  async update() {
    const fragment = await this.getTemplate();
    this.innerHTML = "";
    this.appendChild(fragment);
  }
  async loadSettings() {
    this.settings = await this.db.get("settings", "settings");
  }

  async getTemplate() {
    // create form components
    this.$originalTextInput = await window.slice.build("Input", {
      placeholder: `Texto original (${this.settings.baseLanguage})`,
      value: this.cardValues.originalText || "",
      onChange: (value) => {
        this.cardValues.originalText = value;
      },
      conditions: { maxLength: 50 },
    });

    this.$translationInput = await window.slice.build("Input", {
      placeholder: `Traducción (${this.settings.selectedLanguage})`,
      value:
        this.cardValues.translation?.[this.settings.selectedLanguage] || "",
      onChange: (value) => {
        this.cardValues.translation[this.settings.selectedLanguage] = value;
      },
      conditions: { maxLength: 50 },
    });

    this.$exampleSentenceInput = await window.slice.build("Input", {
      placeholder: `Ejemplo de oración (${this.settings.selectedLanguage})`,
      value:
        this.cardValues.exampleSentence?.[this.settings.selectedLanguage] || "",
      onChange: (value) => {
        this.cardValues.exampleSentence[this.settings.selectedLanguage] = value;
      },
      conditions: { maxLength: 50 },
    });

    this.$notesInput = await window.slice.build("Input", {
      placeholder: `Pista (opcional)`,
      value: this.cardValues.notes || "",
      onChange: (value) => {
        this.cardValues.notes = value;
      },
      conditions: { maxLength: 50 },
    });

    this.$difficultySelect = await window.slice.build("SButtonSelect", {
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

    // Get initial audio blob if editing and card has audio
    let initialAudioBlob: Blob | undefined;
    let initialMimeType: string | undefined;
    if (this._cardId && this._audioAsset) {
      initialAudioBlob = this._audioAsset.blob;
      initialMimeType = this._audioAsset.mimeType;
    }

    this.$audioCombo = await window.slice.build("CardAudioCombo", {
      initialAudioBlob,
      initialMimeType,
      onAudioChange: (audioBlob: Blob | null, mimeType?: string) => {
        if (audioBlob && mimeType) {
          console.log("Setting audio asset:", mimeType, audioBlob);
          this._audioAsset = {
            id: this._audioAsset?.id || 0,
            mimeType: mimeType,
            blob: audioBlob,
            createdAt: this._audioAsset?.createdAt || new Date(),
          };
        } else {
          // Clear audio asset when null
          this._audioAsset = null;
        }
      },
    });

    const createButton = await window.slice.build("Button", {
      value: this._cardId ? "Guardar cambios" : "Crear carta",
      onClickCallback: () => {
        if (this._cardId) {
          this.updateCard();
        } else {
          this.createCard();
        }
      },
    });

    const deleteButton = this._cardId
      ? await window.slice.build("SButton", {
          content: "Eliminar carta",
          variant: "danger",
          onClick: async () => {
            if (confirm("¿Estás seguro de que quieres eliminar esta carta?")) {
              await this.deleteCard();
            }
          },
        })
      : null;

    const dialogContent = html`
      <div class="p-4 flex flex-col items-start gap-8 w-full">
        <h3 class="text-2xl font-bold text-font-primary">
          ${this._cardId ? "Editar carta" : "Nueva carta"}
        </h3>
        <div class="flex gap-4 w-full">
          <div class="w-full">${this.$originalTextInput}</div>
          <div class="w-full">${this.$translationInput}</div>
        </div>
        <div class="w-full">${this.$exampleSentenceInput}</div>
        <div class="w-full">${this.$notesInput}</div>
        <div class="w-full">${this.$difficultySelect}</div>
        <div class="w-full">${this.$audioCombo}</div>

        <div class="flex gap-3 items-center">
          ${createButton} ${deleteButton || ""}
        </div>
      </div>
    `;

    this.$dialog = await window.slice.build("Dialog", {
      content: dialogContent,
    });
    const triggerButton = await window.slice.build("Button", {
      value: this.props.triggerLabel,
      onClickCallback: () => {
        eventManager.publish("modal:newCard:open", { });  
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

    let audioId: IDBValidKey | null = null;

    if (this._audioAsset) {
      console.log("Adding audio asset to DB:", this._audioAsset);
      const newAudio: Omit<AudioAsset, "id"> = {
        mimeType: this._audioAsset.mimeType,
        blob: this._audioAsset.blob,
        createdAt: new Date(),
      };
      audioId = await this.db.add("audio", newAudio);
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
      audioAssetId: {} as Record<LanguageCode, number>,
    };
    if (audioId) {
      console.log("Assigning audioId to card:", audioId);
      newCard.audioAssetId[this.settings.selectedLanguage] = Number(audioId);
    }
    const newId = await this.db.add("cards", newCard);

    this.$dialog.open = false;
    // Reset all form fields
    this.resetFormFields();
    eventManager.publish("card:created", { cardId: Number(newId) });
  }

  async updateCard() {
    // Logic to update an existing card in the database
    if (
      !this._cardId ||
      !this.cardValues.originalText ||
      !this.cardValues.translation ||
      !this.cardValues.difficulty
    ) {
      alert("Por favor, completa los campos obligatorios.");
      return;
    }

    let audioId: number | null = null;

    // Handle audio asset
    if (this._audioAsset) {
      if (this._audioAsset.id && this._audioAsset.id !== 0) {
        // Update existing audio
        const updatedAudio: AudioAsset = {
          id: this._audioAsset.id,
          mimeType: this._audioAsset.mimeType,
          blob: this._audioAsset.blob,
          createdAt: this._audioAsset.createdAt,
        };
        await this.db.put("audio", updatedAudio);
        audioId = this._audioAsset.id;
      } else {
        // Add new audio
        const newAudio: Omit<AudioAsset, "id"> = {
          mimeType: this._audioAsset.mimeType,
          blob: this._audioAsset.blob,
          createdAt: new Date(),
        };
        audioId = Number(await this.db.add("audio", newAudio));
      }
    }

    // Get existing card to preserve fields we're not editing
    const existingCard = await this.db.get("cards", this._cardId);
    if (!existingCard) {
      alert("Carta no encontrada.");
      return;
    }

    const updatedCard: Card = {
      ...existingCard,
      originalText: this.cardValues.originalText!,
      translation: this.cardValues.translation!,
      exampleSentence: this.cardValues.exampleSentence!,
      notes: this.cardValues.notes,
      difficulty: this.cardValues.difficulty!,
      updatedAt: new Date(),
    };

    // Ensure audioAssetId exists as an object
    if (!updatedCard.audioAssetId) {
      updatedCard.audioAssetId = {} as Record<LanguageCode, number>;
    }

    if (audioId) {
      updatedCard.audioAssetId[this.settings.selectedLanguage] = audioId;
    } else if (this._audioAsset === null) {
      // Audio was removed
      delete updatedCard.audioAssetId[this.settings.selectedLanguage];
    }

    await this.db.put("cards", updatedCard);

    this.$dialog!.open = false;

    // Store cardId before resetting
    const updatedCardId = this._cardId;
    this.resetFormFields();

    console.log("Publishing card:updated for cardId:", updatedCardId);
    eventManager.publish("card:updated", { cardId: updatedCardId });
  }

  async deleteCard() {
    if (!this._cardId) return;

    // Delete associated audio if exists
    const card = await this.db.get("cards", this._cardId);
    if (card?.audioAssetId?.[this.settings.selectedLanguage]) {
      const audioId = card.audioAssetId[this.settings.selectedLanguage];
      try {
        await this.db.delete("audio", audioId);
      } catch (e) {
        console.error("Error deleting audio:", e);
      }
    }

    // Delete the card
    await this.db.delete("cards", this._cardId);

    this.$dialog!.open = false;

    // Store cardId before resetting
    const deletedCardId = this._cardId;
    this.resetFormFields();

    eventManager.publish("card:deleted", { cardId: deletedCardId });
  }

  async loadCard(cardId: number) {
    this._cardId = cardId;
    const card = await this.db.get("cards", cardId);

    if (!card) {
      alert("Carta no encontrada.");
      return;
    }

    // Load card values
    this.cardValues = {
      originalText: card.originalText,
      translation: card.translation,
      exampleSentence: card.exampleSentence,
      notes: card.notes,
      difficulty: card.difficulty,
      deckIds: card.deckIds,
    };

    // Load audio asset if exists
    const audioId = card.audioAssetId?.[this.settings.selectedLanguage];
    if (audioId) {
      this._audioAsset = await this.db.get("audio", audioId);
    } else {
      this._audioAsset = null;
    }

    // Rebuild template to populate fields
    await this.update();
  }

  resetFormFields() {
    // Reset cardValues to default structure
    this.cardValues = {
      deckIds: [],
      translation: {} as Record<LanguageCode, string>,
      exampleSentence: {} as Record<LanguageCode, string>,
      difficulty: "basic",
      notes: "",
    };
    this._audioAsset = null;
    this._cardId = null;

    // Reset input components
    if (this.$originalTextInput) {
      (this.$originalTextInput as any).value = "";
    }
    if (this.$translationInput) {
      (this.$translationInput as any).value = "";
    }
    if (this.$exampleSentenceInput) {
      (this.$exampleSentenceInput as any).value = "";
    }
    if (this.$notesInput) {
      (this.$notesInput as any).value = "";
    }
    if (this.$difficultySelect) {
      this.$difficultySelect.selected = "basic";
    }
    if (this.$audioCombo) {
      // Trigger discard to reset audio combo
      this.$audioCombo.discardAudio();
    }
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
