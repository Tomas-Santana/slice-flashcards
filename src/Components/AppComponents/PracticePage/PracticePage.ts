import type { PracticePageProps } from './PracticePage.types';
import html from '@/lib/render';
import type { Deck } from '@/Components/Service/DB/models/deck';
import { openDatabase } from '@/Components/Service/DB/openDatabase';

export default class PracticePage extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};

	decks: Deck[] = [];
	private db = openDatabase();

	constructor(props: PracticePageProps) {
		super();
		// @ts-ignore slice is provided by the framework at runtime
		slice.attachTemplate(this);
		// @ts-ignore controller at runtime
		slice.controller.setComponentProps(this, props);
	}

	async init() {
		// Component initialization logic (can be async)
		await this.loadDecks();
		const fragment = await this.getTemplate();
		this.appendChild(fragment);
	}

	update() {
		// Component update logic (can be async)
	}

	async getTemplate() {
		const pageTitle = await window.slice.build('PageTitle', {
			title: 'Mis mazos',
			subtitle: 'Practica, crea y administra tus mazos de tarjetas.',
		});
		const newDeckModal = await window.slice.build('NewDeckModal', {
			triggerLabel: 'Crear nuevo mazo',
		});

		const randomPracticeCard = await this.getRandomPracticeDeck();

		const deckCards = await Promise.all(
			this.decks.map((deck) =>
				window.slice.build('DeckCard', {
					deck,
					showCardCount: true,
					showEditButton: true,
				})
			)
		);

		
		
		const cardsSection = await window.slice.build("FlashcardsPage", {})
		const fragment = html`
			<div class="p-4">
				${pageTitle} ${newDeckModal}
				<div class="flex gap-4 mt-4 overflow-x-scroll pb-4">
					${randomPracticeCard} ${deckCards}
				</div>
			</div>
			${cardsSection}
		`;
		return fragment;
	}

	async loadDecks() {
		this.decks = await this.db.getAll('decks');
	}

	async getRandomPracticeDeck() {
		const randomPracticeCard = await window.slice.build('DeckCard', {
			deck: {
				id: -1,
				emoji: '🎲',
				name: 'Mazo aleatorio',
				difficulty: 'intermediate',
				cardCount: 20,
				createdAt: new Date(),
				updatedAt: new Date(),
				cardIds: [],
			},
			showCardCount: false,
			showEditButton: false,
		});
		return randomPracticeCard;
	}
}

customElements.define('slice-practicepage', PracticePage);
