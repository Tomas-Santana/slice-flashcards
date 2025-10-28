import type { SButtonProps } from './SButton.types';
import html from '@/lib/render';

const variantClasses = {
	primary: 'bg-primary text-primary-contrast hover:bg-primary-accent border',
	outline: 'border border-border text-font-primary hover:bg-primary-shade',
	secondary: 'bg-secondary text-secondary-contrast hover:bg-secondary-accent',
	danger: 'bg-danger text-danger-contrast hover:bg-danger-accent',
	ghost: 'bg-transparent text-font-primary hover:bg-primary-shade',
};

const sizeClasses = {
	icon: 'p-2 flex items-center justify-center w-10 h-10',
	default: 'px-4 py-2',
};

export default class SButton extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};
	props: SButtonProps;
	_selected: boolean = false;

	constructor(props: SButtonProps) {
		super();
		// @ts-ignore slice is provided by the framework at runtime
		slice.attachTemplate(this);
		// @ts-ignore controller at runtime
		slice.controller.setComponentProps(this, props);

		this.props = props;

	}

	init() {
		// Component initialization logic (can be async)
		const fragment = this.getTemplate();
		this.appendChild(fragment);


	}

	update() {
		// Component update logic (can be async)
	}

	getTemplate() {
		const variantClass = variantClasses[this.props.variant] || variantClasses.primary;
		const sizeClass = sizeClasses[this.props.size] || sizeClasses.default;

		const frag = html`
			<button class="${variantClass} ${sizeClass} rounded-md ${this.props.class || ''}">
				${this.props.content}
			</button>
		`;
		const button = frag.querySelector('button')!;

		if (this.props.onClick) {
			button.addEventListener('click', async () => {
				await this.props.onClick!();
			});
		}

		return frag;
	}


}

customElements.define('slice-sbutton', SButton);
