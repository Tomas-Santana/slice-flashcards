import type { PageTitleProps } from './PageTitle.types';
import html from '@/lib/render';


export default class PageTitle extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};
	props: PageTitleProps;

	constructor(props: PageTitleProps) {
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

	getTemplate() {
		return html`
		<div>
			<h2 class="text-3xl font-bold text-font-primary mb-2">
				${this.props.title}
			</h2>
			${this.props.subtitle ? html`
				<h3 class="text-lg text-font-secondary">
					${this.props.subtitle}
				</h3>
			` : ''}
		</div>
		`;
	}


	update() {
		// Component update logic (can be async)
	}
}

customElements.define('slice-pagetitle', PageTitle);
