import type { PracticePageProps } from './PracticePage.types';
import html from '@/lib/render';


export default class PracticePage extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};

	constructor(props: PracticePageProps) {
		super();
		// @ts-ignore slice is provided by the framework at runtime
		slice.attachTemplate(this);
		// @ts-ignore controller at runtime
		slice.controller.setComponentProps(this, props);
	}

	async init() {
		// Component initialization logic (can be async)

		const fragment = await this.getTemplate();
		this.appendChild(fragment);
	}

	update() {
		// Component update logic (can be async)
	}

	async getTemplate() {
		const pageTitle = await window.slice.build('PageTitle', {
			title: 'Practicar',
			subtitle: 'Selecciona uno de tus mazos o haz una práctica con cartas aleatorias.'
		});
		const randomPracticeCard = await window.slice.build('DeckCard', {
			deck: {
				id: -1,
				emoji: '🎲',
				name: 'Práctica Aleatoria',
				difficulty: 'intermediate',
				cardCount: 20,
				createdAt: new Date(),
				updatedAt: new Date(),
			}
		});
		const cardsSection = await window.slice.build("FlashcardsPage", {})
		const fragment = html`
			<div class="p-4">
				${pageTitle}
				<div class="flex gap-4 mt-4">
					${randomPracticeCard}
				</div>
			</div>
			${cardsSection}
		`;
		return fragment;
	}

}

customElements.define('slice-practicepage', PracticePage);
