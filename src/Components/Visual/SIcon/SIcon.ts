import type { SIconProps } from './SIcon.types';


export default class SIcon extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};
	props: SIconProps;

	constructor(props: SIconProps) {
		super();
		// @ts-ignore slice is provided by the framework at runtime
		slice.attachTemplate(this);
		// @ts-ignore controller at runtime
		slice.controller.setComponentProps(this, props);
		this.props = props;
		const iconElement = this.querySelector('i')!;
		iconElement.className = this.props.class;
		const iconStyle = this.props.style ? `fa-${this.props.style}` : 'fa-solid';
		iconElement.classList.add(iconStyle, `fa-${this.props.name}`);
	}

	init() {
		// Component initialization logic (can be async)
	}

	update() {
		// Component update logic (can be async)
	}
}

customElements.define('slice-sicon', SIcon);
