import type { MultiRouteProps } from "./MultiRoute.types";

export default class MultiRoute extends HTMLElement {
  props: MultiRouteProps;
  renderedComponents: Map<string, HTMLElement>;

  constructor(props: MultiRouteProps);
  init(): void | Promise<void>;
  render(): Promise<void>;
  renderIfCurrentRoute(): Promise<boolean>;
  removeComponent(): void;
}

declare global {
  interface HTMLElementTagNameMap {
    "slice-multi-route": MultiRoute;
  }
}
