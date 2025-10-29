import type { SToggleButtonProps } from './SToggleButton.types';
import html from '@/lib/render';

const selectedVariantClasses = {
	primary: 'bg-secondary-accent text-secondary-contrast border hover:bg-secondary-accent',
	outline: 'border border-border text-font-primary bg-primary-shade',
	secondary: 'bg-primary-accent text-primary-contrast border hover:bg-primary-accent',
	danger: 'bg-danger-accent text-danger-contrast',
	ghost: 'bg-primary-shade text-font-primary',
};

export default class SToggleButton extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};
	props: SToggleButtonProps;

	constructor(props: SToggleButtonProps) {
		super();
		// @ts-ignore controller at runtime
		slice.controller.setComponentProps(this, props);
		this.props = props;
	}

	async init() {
		const fragment = await this.getTemplate();
		this.appendChild(fragment);
	}

	async update() {
		this.innerHTML = '';
		const fragment = await this.getTemplate();
		this.appendChild(fragment);
	}

	async getTemplate() {

		const variantClass = this.props.selected
			? selectedVariantClasses[this.props.variant] || selectedVariantClasses.primary
			: '';

			const onClick = () => {
				if (this.props.onClick) {
					// Managed mode: parent controls selection state
					this.props.onClick();
				} else {
					// Unmanaged mode: toggle self
					this.toggled = !this.toggled;
				}
			}

		const button = await window.slice.build('SButton', {
			...this.props,
			class: `${this.props.class || ''} ${variantClass}`,
			onClick: onClick,
		});

		return button;
	}



	set toggled(value: boolean) {
		this.props.selected = value;
		this.update();
	}

	get toggled() {
		return this.props.selected;
	}
}

customElements.define('slice-stogglebutton', SToggleButton);
