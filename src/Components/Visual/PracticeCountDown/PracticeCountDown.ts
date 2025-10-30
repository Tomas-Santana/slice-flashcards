import type { PracticeCountDownProps } from "./PracticeCountDown.types";
import html from "@/lib/render";
import { animate } from "motion";
import type Dialog from "../Dialog/Dialog";

export default class PracticeCountDown extends HTMLElement {
  static props = {
    // Define your component props here (runtime schema)
  };

  props: PracticeCountDownProps;
  private currentCount: number;
  private $countElement: HTMLElement | null = null;
  private intervalId: number | null = null;
  private $dialog: Dialog | null = null;

  constructor(props: PracticeCountDownProps) {
    super();
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
    this.props = props;
    this.currentCount = props.countFrom || 3;
  }

  async init() {
    const fragment = await this.getTemplate();
    this.appendChild(fragment);

    // Start countdown after a short delay
    setTimeout(() => {
      this.startCountdown();
    }, 500);
  }

  async getTemplate() {
    const content = html`
      <div class="p-12">
        <div class="text-center">
          <h2 class="text-2xl font-bold text-font-primary mb-8">¡Prepárate!</h2>
          <div
            class="countdown-number text-9xl font-bold text-primary-accent"
            style="min-width: 200px; min-height: 200px; display: flex; align-items: center; justify-content: center;"
          >
            ${this.currentCount}
          </div>
        </div>
      </div>
    `;

    this.$dialog = await window.slice.build("Dialog", {
      content,
      onClose: () => {
        // Prevent closing by clicking backdrop during countdown
      },
			startingState: "open",
    });

    return html`${this.$dialog}`;
  }

  async startCountdown() {
    this.$countElement = this.querySelector(".countdown-number");

    if (!this.$countElement) return;

    // Animate initial number
    await this.animateNumber();

    // Start countdown interval
    this.intervalId = window.setInterval(async () => {
      this.currentCount--;

      if (this.currentCount > 0) {
        // Update number and animate
        if (this.$countElement) {
          this.$countElement.textContent = String(this.currentCount);
          await this.animateNumber();
        }
      } else {
        // Show "GO!" message
        await this.showGoMessage();

        // Clear interval
        if (this.intervalId !== null) {
          clearInterval(this.intervalId);
          this.intervalId = null;
        }

        // Call onComplete callback
        if (this.props.onComplete) {
          this.props.onComplete();
        }
      }
    }, 1000);
  }

  async animateNumber() {
    if (!this.$countElement) return;

    // Pulse and scale animation
    await animate(
      this.$countElement as any,
      {
        scale: [0.5, 1.2, 1],
        opacity: [0, 1],
      },
      {
        duration: 0.6,
        type: "spring",
        stiffness: 500,
        damping: 20,
      }
    ).finished;
  }

  async animateEnd() {
    // animation for disappearing the whole countdown component
    if (!this.$dialog) return;

    await animate(
      this.$dialog,
      {
        scale: [1, 0],
        opacity: [1, 0],
      },
      {
        duration: 0.5,
        ease: "easeIn",
      }
    ).finished;

    // Close the dialog
    this.$dialog.open = false;
  }

  async showGoMessage() {
    if (!this.$countElement) return;

    // Change to "GO!"
    this.$countElement.textContent = "¡GO!";
    this.$countElement.classList.remove("text-primary-accent");
    this.$countElement.classList.add("text-green-500");

    // Explosive animation
    await animate(
      this.$countElement as any,
      {
        scale: [0.5, 1.3, 1],
        opacity: [0, 1],
        rotate: [0, 5, -5, 0],
      },
      {
        duration: 0.8,
        type: "spring",
        stiffness: 400,
        damping: 15,
      }
    ).finished;

    // Wait a moment before completing
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  disconnectedCallback() {
    // Clean up interval when component is removed
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  update() {
    // Component update logic (can be async)
  }
}

customElements.define("slice-practicecountdown", PracticeCountDown);
