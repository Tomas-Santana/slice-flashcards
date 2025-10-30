import type { PracticeEndFeedbackProps } from "./PracticeEndFeedback.types";
import html from "@/lib/render";

export default class PracticeEndFeedback extends HTMLElement {
  static props = {
    stats: { type: Object, required: true },
  };

  private props!: PracticeEndFeedbackProps;

  constructor(props: PracticeEndFeedbackProps) {
    super();
    this.props = props;
    // @ts-ignore slice is provided by the framework at runtime
    slice.attachTemplate(this);
    // @ts-ignore controller at runtime
    slice.controller.setComponentProps(this, props);
  }

  async init() {
    await this.render();
  }

  async render() {
    const { stats, timeElapsed } = this.props;

    const endButton = await window.slice.build("Button", {
      value: "Volver al inicio",
      onClickCallback: () => {
        window.location.href = "/";
      },
    });

    const summary = html`
      <div class="flex items-center justify-center h-screen">
        <div class="text-center bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h2 class="text-3xl font-bold text-font-primary mb-4">
            ¡Sesión completada!
          </h2>
          <div class="stats-grid grid grid-cols-2 gap-4 my-6">
            <div class="stat-item">
              <div class="text-4xl font-bold text-green-500">
                ${stats.correct}
              </div>
              <div class="text-sm text-font-secondary">Correctas</div>
            </div>
            <div class="stat-item">
              <div class="text-4xl font-bold text-red-500">
                ${stats.incorrect}
              </div>
              <div class="text-sm text-font-secondary">Incorrectas</div>
            </div>
          </div>
          <div class="accuracy mb-6">
            <div class="text-5xl font-bold text-primary-accent">
              ${stats.accuracy}%
            </div>
            <div class="text-sm text-font-secondary">Precisión</div>
          </div>
          ${timeElapsed
            ? html`
                <div class="time-elapsed mb-6">
                  <div class="text-2xl font-mono text-font-primary">
                    ${timeElapsed}
                  </div>
                  <div class="text-sm text-font-secondary">Tiempo total</div>
                </div>
              `
            : ""}
          <div class="actions flex gap-4 justify-center">${endButton}</div>
        </div>
      </div>
    `;

    this.appendChild(summary);
  }

  update() {
    // Component update logic (can be async)
  }
}

customElements.define("slice-practiceendfeedback", PracticeEndFeedback);
