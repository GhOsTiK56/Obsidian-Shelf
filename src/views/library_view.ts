import {
	DropdownComponent,
	ItemView,
	ViewStateResult,
	WorkspaceLeaf,
} from 'obsidian';
import { MEDIA_TYPE_MAP, MediaType } from '../common';
import { LibraryService, ShelfCardModel } from '../services/library_service';

export const LIBRARY_VIEW = 'library-view';

interface LibraryViewState {
	category: MediaType;
}

export class LibraryView extends ItemView {
	private readonly libraryService: LibraryService;
	private gridContainer!: HTMLElement;
	private state: LibraryViewState = {
		category: MediaType.TV_SERIES,
	};

	public constructor(leaf: WorkspaceLeaf, libraryService: LibraryService) {
		super(leaf);
		this.libraryService = libraryService;
	}

	public async onOpen() {
		const root = this.contentEl;

		root.empty();
		root.addClass('container');

		this.renderCategorySelector(root);

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
		};
	}

	public async setState(
		state: unknown,
		result: ViewStateResult,
	): Promise<void> {
		if (state && typeof state === 'object' && 'category' in state) {
			const savedCategory = (state as Record<string, unknown>).category;
			if (Object.values(MediaType).includes(savedCategory as MediaType)) {
				this.state.category = savedCategory as MediaType;
			}
		}

		await super.setState(state, result);

		if (this.gridContainer) {
			await this.updateContent();
		}
	}

	private renderCategorySelector(container: HTMLElement) {
		const wrapper = container.createDiv({
			cls: 'controls-wrapper',
		});

		const options: Record<string, string> = {};
		for (const [key, { label, emoji }] of Object.entries(MEDIA_TYPE_MAP)) {
			options[key] = `${emoji} ${label}`;
		}

		new DropdownComponent(wrapper)
			.addOptions(options)
			.setValue(this.state.category)
			.onChange(async (value) => {
				this.state.category = value as MediaType;

				this.app.workspace.requestSaveLayout();

				await this.updateContent();
			});
	}

	private async updateContent() {
		this.gridContainer.empty();

		const cards = await this.libraryService.getShelfCards(this.state.category);

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
