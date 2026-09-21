import {
	DropdownComponent,
	ItemView,
	ViewStateResult,
	WorkspaceLeaf,
} from 'obsidian';
import {
	MEDIA_TYPE_MAP,
	MediaType,
	SORT_OPTION_MAP,
	SortOption,
} from '../common';
import { LibraryService, ShelfCardModel } from '../services/library_service';

export const LIBRARY_VIEW = 'library-view';

interface LibraryViewState {
	category: MediaType;
	sortBy: SortOption;
}

export class LibraryView extends ItemView {
	private readonly libraryService: LibraryService;
	private gridContainer!: HTMLElement;
	private state: LibraryViewState = {
		category: MediaType.TV_SERIES,
		sortBy: SortOption.TAGS_YEAR,
	};

	public constructor(leaf: WorkspaceLeaf, libraryService: LibraryService) {
		super(leaf);
		this.libraryService = libraryService;
	}

	public async onOpen() {
		const root = this.contentEl;

		root.empty();
		root.addClass('container');

		this.renderControlsBar(root);

		this.gridContainer = root.createDiv({
			cls: 'grid-container',
		});

		await this.updateContent();
	}

	public getViewType() {
		return LIBRARY_VIEW;
	}

	public getDisplayText() {
		return 'Obsidian shelf';
	}

	public getState(): Record<string, unknown> {
		return {
			category: this.state.category,
			sortBy: this.state.sortBy,
		};
	}

	public async setState(
		state: unknown,
		result: ViewStateResult,
	): Promise<void> {
		if (state && typeof state === 'object') {
			const savedState = state as Record<string, unknown>;

			if (Object.values(MediaType).includes(savedState.category as MediaType)) {
				this.state.category = savedState.category as MediaType;
			}

			if (Object.values(SortOption).includes(savedState.sortBy as SortOption)) {
				this.state.sortBy = savedState.sortBy as SortOption;
			}
		}

		await super.setState(state, result);

		if (this.gridContainer) {
			await this.updateContent();
		}
	}

	private renderControlsBar(container: HTMLElement) {
		const wrapper = container.createDiv({ cls: 'controls-wrapper' });

		const categoryOptions: Record<string, string> = {};
		for (const [key, { label, emoji }] of Object.entries(MEDIA_TYPE_MAP)) {
			categoryOptions[key] = `${emoji} ${label}`;
		}

		new DropdownComponent(wrapper)
			.addOptions(categoryOptions)
			.setValue(this.state.category)
			.onChange(async (value) => {
				this.state.category = value as MediaType;
				this.app.workspace.requestSaveLayout();
				await this.updateContent();
			});

		const sortOptions: Record<string, string> = {};
		for (const [key, { label, emoji }] of Object.entries(SORT_OPTION_MAP)) {
			sortOptions[key] = `${emoji} ${label}`;
		}

		new DropdownComponent(wrapper)
			.addOptions(sortOptions)
			.setValue(this.state.sortBy)
			.onChange(async (value) => {
				this.state.sortBy = value as SortOption;
				this.app.workspace.requestSaveLayout();
				await this.updateContent();
			});
	}

	private async updateContent() {
		this.gridContainer.empty();

		const cards = await this.libraryService.getShelfCards(
			this.state.category,
			this.state.sortBy,
		);

		for (const card of cards) {
			this.createCard(this.gridContainer, card);
		}
	}

	private createCard(container: HTMLElement, cardModel: ShelfCardModel): void {
		const card = container.createDiv({ cls: 'shelf-card' });

		const img = card.createEl('img', {
			cls: 'shelf-card__image',
		});

		img.src = cardModel.posterPath;
		img.loading = 'lazy';

		card.addEventListener('click', () => {
			void this.openFile(cardModel.item.path);
		});
	}

	private async openFile(path: string): Promise<void> {
		await this.app.workspace.openLinkText(path, '', true);
	}

	public async onClose() {}
}
