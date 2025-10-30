import type { CardFilterFormProps } from './CardFilterForm.types';
import type Select from '../Select/Select';
import type Input from '../Input/Input';
import { FilterCriteria } from '@/lib/types/filter';
import { html } from '@/lib/render';

export default class CardFilterForm extends HTMLElement {
	static props = {
		// Define your component props here (runtime schema)
	};
	props: CardFilterFormProps;

	private $difficultySelect: Select | null = null;
	private $searchInput: Input | null = null;
	private $searchScopeSelect: Select | null = null;
	private criteria: FilterCriteria = { searchFor: 'front', difficultyBands: [] };


	constructor(props: CardFilterFormProps) {
		super();
		// @ts-ignore slice is provided by the framework at runtime
		// @ts-ignore controller at runtime
		slice.controller.setComponentProps(this, props);
		this.props = props;
	}

	async init() {
		// Component initialization logic (can be async)
		const fragment = await this.getTemplate();
		this.appendChild(fragment);

	}

	async getTemplate() {
		// Build Difficulty Select
		this.$difficultySelect = (await window.slice.build('Select', {
			multiple: true,
			options: [
				{ value: 'basic', text: 'Básico' },
				{ value: 'intermediate', text: 'Intermedio' },
				{ value: 'advanced', text: 'Avanzado' },
			],
			label: 'Filtrar por dificultad',
			onOptionSelect: (opt) => {
				this.handleFilterChange({ field: "difficultyBands", value: opt.value });
			},
		}));

		this.$searchInput = (await window.slice.build('Input', {
			placeholder: 'Buscar en tarjetas...',
			type: 'text',
			onChange: (value) => {
				this.handleFilterChange({ field: "searchTerm", value });
			},
		}));

		this.$searchScopeSelect = (await window.slice.build('Select', {
			options: [
				{ value: 'front', text: 'Anverso' },
				{ value: 'back', text: 'Reverso' },
				{ value: 'both', text: 'Ambos' },
			],
			label: 'Buscar en',
			
			onOptionSelect: (opt) => {
				this.handleFilterChange({ field: "searchFor", value: opt.value });
			},
		}));
		this.$searchScopeSelect.value = 'front';

		return html`
			<div class="card-filter-form flex flex-row gap-4">
				<div class="filter-item">${this.$difficultySelect}</div>
				<div class="filter-item">${this.$searchScopeSelect}</div>
				<div class="filter-item flex-grow">${this.$searchInput}</div>
				</div>
		`;
	}

	private handleFilterChange({field, value} : {
		field: "searchTerm" | "difficultyBands" | "searchFor",
		value: string 
	}) {

		switch (field) {
			case "searchTerm":
				this.criteria.searchTerm = value;
				break;
			case "difficultyBands":
				const bandIndex = this.criteria.difficultyBands.indexOf(value as any);
				if (bandIndex > -1) {
					this.criteria.difficultyBands.splice(bandIndex, 1);
				} else {
					this.criteria.difficultyBands.push(value as any);
				}
				break;
			case "searchFor":
				this.criteria.searchFor = value as 'front' | 'back' | 'both';
				break;
		}

		this.props.onFilterChange(this.criteria);

	}

	update() {
		// Component update logic (can be async)
	}
}

customElements.define('slice-cardfilterform', CardFilterForm);
