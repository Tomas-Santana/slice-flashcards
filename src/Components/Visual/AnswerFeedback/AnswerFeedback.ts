import type { AnswerFeedbackProps } from "./AnswerFeedback.types";
import html from "@/lib/render";
import { animate } from "motion";

export default class AnswerFeedback extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: AnswerFeedbackProps;
  private isVisible: boolean = false;

  constructor(props: AnswerFeedbackProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
  }

  async getTemplate() {
    const { result, isCorrect } = this.props;

    // Determine message and style based on result
    let message = "";
    let bgColor = "";
    let textColor = "text-white";

    if (isCorrect) {
      if (result.similarity >= 0.95) {
        message = "¡Perfecto! ✨";
        bgColor = "bg-green-500";
      } else {
        // Correct but not perfect - show difference
        message = `¡Correcto! ✓`;
        bgColor = "bg-green-400";
      }
    } else {
      message = `Incorrecto ✗`;
      bgColor = "bg-red-500";
    }

    // Build details section
    const showDetails = result.similarity < 0.95 || !isCorrect;


    return html`
      <div
        class="feedback-message fixed top-24 ${bgColor} ${textColor} px-8 py-4 rounded-lg shadow-2xl z-50 max-w-md"
        style="left: 50%; opacity: 0; transform: translateX(-50%) translateY(-20px);"
      >
        <div class="text-center font-bold text-xl mb-2">${message}</div>
        ${showDetails
          ? html`
              <div class="text-sm mt-3 space-y-1">
                <div class="opacity-90">
                  <span class="font-semibold">Tu respuesta:</span>
                  ${result.normalizedUserAnswer}
                </div>
                <div class="opacity-90">
                  <span class="font-semibold">Respuesta correcta:</span>
                  ${result.normalizedCorrectAnswer}
                </div>
              </div>
            `
          : ""}
      </div>
    `;
  }

  /**
   * Shows the feedback message with animation
   * Returns a promise that resolves when the message is fully shown and hidden
   */
  async show(): Promise<void> {
    if (this.isVisible) return;
    this.isVisible = true;

    const feedbackEl = this.querySelector(".feedback-message") as HTMLElement;
    if (!feedbackEl) return;

    // Animate in
    await animate(
      feedbackEl,
      {
        opacity: [0, 1],
        y: [-20, 0],
      },
      {
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 25,
      }
    ).finished;

    // Wait for user to read (longer if showing details)
    const displayDuration =
      this.props.result.similarity < 0.95 || !this.props.isCorrect
        ? 2500
        : 1500;
    await new Promise((resolve) => setTimeout(resolve, displayDuration));

    // Animate out
    await animate(
      feedbackEl,
      {
        opacity: [1, 0],
        y: [0, -20],
      },
      {
        duration: 0.3,
        ease: "easeIn",
      }
    ).finished;

    this.isVisible = false;
  }

  update() {
    // Component update logic (can be async)
  }
}

customElements.define("slice-answerfeedback", AnswerFeedback);
