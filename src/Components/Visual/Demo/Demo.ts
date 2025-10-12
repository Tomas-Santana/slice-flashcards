import type { DemoProps } from './Demo.types';

export default class Demo extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};

	constructor(props?: Partial<DemoProps>) {
		super();
		// @ts-ignore slice is provided by the framework at runtime
		slice.attachTemplate(this);
		// @ts-ignore controller at runtime
		slice.controller.setComponentProps(this, props);
	}

	init() {
		// Component initialization logic (can be async)
	}

	update() {
		// Component update logic (can be async)
	}
}

customElements.define('slice-demo', Demo);
