import type { ProgressVisualizerProps } from "./ProgressVisualizer.types";
import html from "@/lib/render";

export default class ProgressVisualizer extends HTMLElement {
  static props = {
    progress: { type: Number, required: true },
  };

  private props!: ProgressVisualizerProps;

  constructor(props: ProgressVisualizerProps) {
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
    // Clamp progress between 0 and 1
    const progress = Math.max(0, Math.min(1, this.props.progress));
    const percentage = Math.round(progress * 100);

    // SVG circle parameters
    const size = 120;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - progress * circumference;

    const progressBar = html`
      <div class="progress-visualizer flex items-center justify-center">
        <div class="relative" style="width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" class="transform -rotate-90">
            <!-- Background circle -->
            <circle
              cx="${size / 2}"
              cy="${size / 2}"
              r="${radius}"
              stroke="#e5e7eb"
              stroke-width="${strokeWidth}"
              fill="none"
            />
            <!-- Progress circle -->
            <circle
              cx="${size / 2}"
              cy="${size / 2}"
              r="${radius}"
              stroke="currentColor"
              stroke-width="${strokeWidth}"
              fill="none"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"
              stroke-linecap="round"
              class="text-primary-accent transition-all duration-500"
            />
          </svg>
          <!-- Percentage text -->
          <div
            class="absolute inset-0 flex items-center justify-center text-2xl font-bold text-font-primary"
          >
            ${percentage}%
          </div>
        </div>
      </div>
    `;

    this.appendChild(progressBar);
  }

  update() {
    // Component update logic (can be async)
  }
}

customElements.define("slice-progressvisualizer", ProgressVisualizer);
