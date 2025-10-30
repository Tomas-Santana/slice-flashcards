import type { PracticeAnswerFormProps } from "./PracticeAnswerForm.types";
import html from "@/lib/render";
import type Input from "../Input/Input";
import type Button from "../Button/Button";
import { compareAnswers } from "@/lib/utils/answerComparison";

export default class PracticeAnswerForm extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: PracticeAnswerFormProps;
  private $input: Input | null = null;
  private $submitButton: Button | null = null;
  private isSubmitting: boolean = false;

  constructor(props: PracticeAnswerFormProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
  }

  async init() {
    const fragment = await this.getTemplate();
    this.appendChild(fragment);
    this.attachEventListeners();
  }

  async getTemplate() {
    // Build Input component
    this.$input = (await window.slice.build("Input", {
      placeholder: "Escribe tu respuesta...",
      type: "text",
      required: true,
    })) as Input;

    // Build Submit button
    this.$submitButton = (await window.slice.build("Button", {
      value: "Verificar",
      onClickCallback: () => {
				this.handleSubmit();
			},
    })) as Button;

    return html`
      <div class="practice-answer-form flex flex-col gap-4 w-full max-w-md">
        <div class="input-wrapper">${this.$input}</div>
        <div class="button-wrapper">${this.$submitButton}</div>
      </div>
    `;
  }

  private attachEventListeners() {
    // Handle Enter key press in input
    if (this.$input) {
      const inputEl = this.$input.querySelector("input");
      if (inputEl) {
        inputEl.addEventListener("keypress", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            this.handleSubmit();
          }
        });
      }
    }
  }

  private async handleSubmit() {
    // Prevent multiple submissions
    if (this.isSubmitting) return;

    // Get user's answer
    const userAnswer = this.$input?.value?.trim() || "";

    if (!userAnswer) {
      // Trigger error on empty input
      this.$input?.triggerError();
      return;
    }

    // Get correct answer from current card
    const correctAnswer = this.props.currentCard.originalText;

    // Mark as submitting
    this.isSubmitting = true;

    // Compare answers using the utility
    const result = compareAnswers(userAnswer, correctAnswer);

    // Call appropriate callback
    if (result.isCorrect) {
      this.props.onCorrectAnswer(result);
    } else {
      this.props.onWrongAnswer(result);
    }

    // Reset form after a short delay
    setTimeout(() => {
      this.clearInput();
      this.isSubmitting = false;
    }, 500);
  }

  /**
   * Clear the input field
   */
  clearInput() {
    if (this.$input) {
      this.$input.clear();
    }
  }

  /**
   * Focus the input field
   */
  focusInput() {
    if (this.$input) {
      const inputEl = this.$input.querySelector("input");
      inputEl?.focus();
    }
  }

  /**
   * Update the current card being tested
   */
  setCurrentCard(card: typeof this.props.currentCard) {
    this.props.currentCard = card;
    this.clearInput();
    this.focusInput();
  }

  /**
   * Get the current input value
   */
  getValue(): string {
    return this.$input?.value?.trim() || "";
  }

  update() {
    // Component update logic (can be async)
  }
}

customElements.define("slice-practiceanswerform", PracticeAnswerForm);
