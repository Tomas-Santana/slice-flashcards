import type { LogoProps } from './Logo.types';


export default class Logo extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};

	$logoParagraph: HTMLParagraphElement | null = null;
	sizeMap: Record<string, string> = {
		small: "0.875rem",
		medium: "1rem",
		large: "1.125rem",
		xl: "1.25rem",
		"2xl": "1.5rem",
	};
	props: LogoProps = {};

	constructor({
		size = "medium",
		textColor = "",
	}: LogoProps) {
		super();
		// @ts-ignore slice is provided by the framework at runtime
		window.slice.attachTemplate(this);
		// @ts-ignore controller at runtime
		window.slice.controller.setComponentProps(this, { size, textColor });
		this.props = { size, textColor };
	}

	init() {
		// Component initialization logic (can be async)
		this.$logoParagraph = this.querySelector('p');
		if (this.$logoParagraph) {
			const size = this.sizeMap[(this as any).props.size || '1rem'];
			this.$logoParagraph.style.fontSize = size;
			if ((this as any).props.textColor) {
				this.$logoParagraph.style.color = (this as any).props.textColor;
			}
		}
	}

	update() {
		// Component update logic (can be async)
	}
}

customElements.define('slice-logo', Logo);
