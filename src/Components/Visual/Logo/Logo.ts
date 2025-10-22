import type { LogoProps } from './Logo.types';


export default class Logo extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};

	$logoParagraph: HTMLParagraphElement | null = null;
	classMap: Record<string, string> = {
		small: "text-sm",
		medium: "text-md",
		large: "text-lg",
		xl: "text-xl",
		"2xl": "text-2xl",
	};
	_props: LogoProps = {};

	constructor({
		size = "medium",
		textColor = "",
	}: LogoProps) {
		super();
		// @ts-ignore slice is provided by the framework at runtime
		window.slice.attachTemplate(this);
		// @ts-ignore controller at runtime
		window.slice.controller.setComponentProps(this, { size, textColor });
	}

	init() {
		// Component initialization logic (can be async)
		this.$logoParagraph = this.querySelector('p');
		if (this.$logoParagraph) {
			const sizeClass = this.classMap[(this as any)._props.size || 'text-md'];
			this.$logoParagraph.classList.add(sizeClass);
			if ((this as any)._props.textColor) {
				this.$logoParagraph.style.color = (this as any)._props.textColor;
			}
		}
	}

	update() {
		// Component update logic (can be async)
	}
}

customElements.define('slice-logo', Logo);
