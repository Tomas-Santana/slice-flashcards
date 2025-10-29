import type { CardAudioComboProps } from "./CardAudioCombo.types";
import html from "@/lib/render";

export default class CardAudioCombo extends HTMLElement {
  static props = {
    onAudioChange: { type: "function", default: null },
    initialAudioBlob: { type: "object", default: null },
    initialMimeType: { type: "string", default: "" },
  };
  props: CardAudioComboProps;

  private $inputSection: HTMLElement | null = null;
  private $playerSection: HTMLElement | null = null;
  private $fileInput: HTMLElement | null = null;
  private $audioRecorder: HTMLElement | null = null;
  private $audioPlayer: HTMLElement | null = null;
  private currentAudioBlob: Blob | null = null;
  private currentMimeType: string = "";
  private currentAudioUrl: string = "";

  constructor(props: CardAudioComboProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    const fragment = await this.getTemplate();
    this.appendChild(fragment);

    this.$inputSection = this.querySelector(".cac-input-section");
    this.$playerSection = this.querySelector(".cac-player-section");

    // Check if we have initial audio blob
    if (this.props.initialAudioBlob) {
      this.currentAudioBlob = this.props.initialAudioBlob;
      this.currentMimeType =
        this.props.initialMimeType || "audio/ogg;codecs=opus";
      this.currentAudioUrl = URL.createObjectURL(this.props.initialAudioBlob);
      await this.updatePlayerAndShow();
    } else {
      // Initially show input section, hide player section
      this.showInputSection();
    }
  }

  async getTemplate() {
    // Build FileInput component
    this.$fileInput = await window.slice.build("FileInput", {
      accept: "audio/*",
      multiple: false,
      onFileSelect: (file: File) => this.handleFileSelect(file),
    });

    // Build AudioRecorder component
    this.$audioRecorder = await window.slice.build("AudioRecorder", {
      onRecordingComplete: (blob: Blob, mimeType: string) =>
        this.handleRecordingComplete(blob, mimeType),
    });

    // Build initial placeholder AudioPlayer (hidden, will be replaced when audio is set)
    // Use a data URI or don't build it at all initially
    this.$audioPlayer = document.createElement("div");
    this.$audioPlayer.classList.add("ap-placeholder");

    // Build close/discard button with X icon
    const closeIcon = await window.slice.build("SIcon", {
      name: "xmark",
      class: "",
    });

    const closeBtn = await window.slice.build("SButton", {
      content: closeIcon,
      size: "icon",
      variant: "ghost",
      class: "cac-discard-btn",
      onClick: async () => this.discardAudio(),
    });

    return html`
      <div
        class="cardaudiocombo flex flex-col gap-3 p-3 bg-surface-primary rounded-md"
      >
        <!-- Input section: FileInput + AudioRecorder -->
        <div class="cac-input-section flex flex-col gap-3">
          <div class="font-bold text-font-primary">Audio</div>
          <div class="flex flex-col gap-2">
            <div class="text-sm text-font-secondary">Adjunta un archivo</div>
            ${this.$fileInput}
          </div>
          <div class="flex flex-col gap-2">
            <div class="text-sm text-font-secondary">O graba un audio</div>
            ${this.$audioRecorder}
          </div>
        </div>

        <!-- Player section: AudioPlayer + discard button -->
        <div class="cac-player-section flex items-center gap-2">
          <div class="flex-1">${this.$audioPlayer}</div>
          ${closeBtn}
        </div>
      </div>
    `;
  }

  handleFileSelect(file: File) {
    // Create blob and URL from file
    this.currentAudioBlob = file;
    this.currentMimeType = file.type;
    this.currentAudioUrl = URL.createObjectURL(file);

    // Update player and show it
    this.updatePlayerAndShow();
  }

  handleRecordingComplete(blob: Blob, mimeType: string) {
    console.log("Recording complete:", mimeType, blob);
    // Store the recorded audio
    this.currentAudioBlob = blob;
    // Fallback to 'audio/ogg;codecs=opus' if mimeType is empty
    this.currentMimeType = mimeType || "audio/ogg;codecs=opus";
    this.currentAudioUrl = URL.createObjectURL(blob);
    console.log("Created blob URL:", this.currentAudioUrl);

    // Update player and show it
    this.updatePlayerAndShow();
  }

  async updatePlayerAndShow() {
    if (!this.currentAudioUrl) {
      console.error("No audio URL available");
      return;
    }

    console.log("Building AudioPlayer with URL:", this.currentAudioUrl);
    // Rebuild the audio player with the new audio URL
    const newPlayer = await window.slice.build("AudioPlayer", {
      audioUrl: this.currentAudioUrl,
      compact: false,
    });

    // Replace the old player
    if (this.$audioPlayer && this.$audioPlayer.parentElement) {
      this.$audioPlayer.parentElement.replaceChild(
        newPlayer,
        this.$audioPlayer
      );
      this.$audioPlayer = newPlayer;
    }

    // Show player section, hide input section
    this.showPlayerSection();

    // Notify parent component
    if (this.props.onAudioChange) {
      this.props.onAudioChange(this.currentAudioBlob, this.currentMimeType);
    }
  }

  discardAudio() {
    // Revoke the object URL to free memory
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
    }

    // Clear audio state
    this.currentAudioBlob = null;
    this.currentMimeType = "";
    this.currentAudioUrl = "";

    // Show input section, hide player section
    this.showInputSection();

    // Notify parent component that audio was cleared
    if (this.props.onAudioChange) {
      this.props.onAudioChange(null);
    }
  }

  showInputSection() {
    if (this.$inputSection) {
      this.$inputSection.classList.remove("hidden");
    }
    if (this.$playerSection) {
      this.$playerSection.classList.add("hidden");
    }
  }

  showPlayerSection() {
    if (this.$inputSection) {
      this.$inputSection.classList.add("hidden");
    }
    if (this.$playerSection) {
      this.$playerSection.classList.remove("hidden");
    }
  }

  update() {
    // Component update logic (can be async)
  }

  disconnectedCallback() {
    // Clean up object URL when component is removed
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl);
    }
  }
}

customElements.define("slice-cardaudiocombo", CardAudioCombo);
