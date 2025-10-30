import type { PracticeTimerProps } from "./PracticeTimer.types";
import html from "@/lib/render";

export default class PracticeTimer extends HTMLElement {
  static props = {
    onTick: { type: Function },
  };

  private props: PracticeTimerProps;
  private seconds: number = 0;
  private intervalId: number | null = null;
  private $display: HTMLElement | null = null;
  private isRunning: boolean = false;

  constructor(props: PracticeTimerProps) {
    super();
    this.props = props;
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
  }

  init() {
    this.render();
  }

  private render() {
    const display = html`
      <div class="practice-timer flex items-center gap-2 text-font-secondary">
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="timer-display text-sm font-mono">00:00</span>
      </div>
    `;

    this.appendChild(display);
    this.$display = this.querySelector(".timer-display");
  }

  private formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  private tick() {
    this.seconds++;
    if (this.$display) {
      this.$display.textContent = this.formatTime(this.seconds);
    }

    // Call optional callback
    if (this.props.onTick) {
      this.props.onTick(this.seconds);
    }
  }

  // Public methods
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = window.setInterval(() => this.tick(), 1000);
  }

  pause() {
    if (!this.isRunning) return;

    this.isRunning = false;
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume() {
    this.start();
  }

  reset() {
    this.pause();
    this.seconds = 0;
    if (this.$display) {
      this.$display.textContent = this.formatTime(0);
    }
  }

  getSeconds(): number {
    return this.seconds;
  }

  getFormattedTime(): string {
    return this.formatTime(this.seconds);
  }

  // Cleanup on disconnect
  disconnectedCallback() {
    this.pause();
  }

  update() {
    // Component update logic (can be async)
  }
}

customElements.define("slice-practicetimer", PracticeTimer);
