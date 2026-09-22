import {
	debounce,
	DropdownComponent,
	SearchComponent,
	ItemView,
	TFile,
	ViewStateResult,
	WorkspaceLeaf,
} from 'obsidian';
import {
	MEDIA_TYPE_MAP,
	MediaType,
	SORT_OPTION_MAP,
	SortOption,
	Status,
	STATUS_MAP,
} from '../common';
import { LibraryService, ShelfCardModel } from '../services/library_service';

export const LIBRARY_VIEW = 'library-view';

interface LibraryViewState {
	category: MediaType;
	sortBy: SortOption;
	statusFilter: Status | 'all';
	searchQuery: string;
}

export class LibraryView extends ItemView {
	private readonly libraryService: LibraryService;

	private gridContainer!: HTMLElement;

	private state: LibraryViewState = {
		category: MediaType.TV_SERIES,
		sortBy: SortOption.TAGS_YEAR,
		statusFilter: 'all',
		searchQuery: '',
	};

	private debouncedUpdateContent = debounce(
		async () => {
			await this.updateContent();
		},
		300,
		true,
	);

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

		this.registerWatchers();

		await this.updateContent();
	}

	private registerWatchers(): void {
		this.registerEvent(
			this.app.metadataCache.on('changed', (file) => {
				if (this.isRelevantFile(file)) {
					this.debouncedUpdateContent();
				}
			}),
		);

		this.registerEvent(
			this.app.vault.on('create', (file) => {
				if (file instanceof TFile && this.isRelevantFile(file)) {
					this.debouncedUpdateContent();
				}
			}),
		);

		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				if (file.path.endsWith('.md')) {
					this.debouncedUpdateContent();
				}
			}),
		);

		this.registerEvent(
			this.app.vault.on('rename', (file) => {
				if (file instanceof TFile && this.isRelevantFile(file)) {
					this.debouncedUpdateContent();
				}
			}),
		);
	}

	private isRelevantFile(file: TFile): boolean {
		return file.extension === 'md';
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
			statusFilter: this.state.statusFilter,
			searchQuery: this.state.searchQuery,
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

			if (
				savedState.statusFilter === 'all' ||
				Object.values(Status).includes(savedState.statusFilter as Status)
			) {
				this.state.statusFilter = savedState.statusFilter as Status | 'all';
			}

			if (typeof savedState.searchQuery === 'string') {
				this.state.searchQuery = savedState.searchQuery;
			}
		}

		await super.setState(state, result);

		if (this.gridContainer) {
			await this.updateContent();
		}
	}

	private renderControlsBar(container: HTMLElement) {
		const wrapper = container.createDiv({ cls: 'controls-wrapper' });

		new SearchComponent(wrapper)
			.setPlaceholder('Search title or tags...')
			.setValue(this.state.searchQuery)
			.onChange((value) => {
				this.state.searchQuery = value;
				this.app.workspace.requestSaveLayout();
				this.debouncedUpdateContent();
			});

		const statusOptions: Record<string, string> = { all: '🗂️ All Statuses' };
		for (const [key, { label, emoji }] of Object.entries(STATUS_MAP)) {
			statusOptions[key] = `${emoji} ${label}`;
		}

		new DropdownComponent(wrapper)
			.addOptions(statusOptions)
			.setValue(this.state.statusFilter)
			.onChange(async (value) => {
				this.state.statusFilter = value as Status | 'all';
				this.app.workspace.requestSaveLayout();
				await this.updateContent();
			});

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
			this.state.statusFilter,
			this.state.searchQuery,
		);

		for (const card of cards) {
			this.createCard(this.gridContainer, card);
		}
	}

	private createCard(container: HTMLElement, cardModel: ShelfCardModel): void {
		const item = cardModel.item;
		const card = container.createDiv({ cls: 'shelf-card' });

		const posterWrapper = card.createDiv({ cls: 'shelf-card__poster-wrapper' });

		const img = posterWrapper.createEl('img', { cls: 'shelf-card__image' });
		img.src = cardModel.posterPath;
		img.loading = 'lazy';

		if (item.status && STATUS_MAP[item.status]) {
			const config = STATUS_MAP[item.status];
			posterWrapper.createDiv({
				cls: `shelf-card__badge shelf-card__badge--status ${config.colorClass}`,
				text: `${config.emoji} ${config.label}`,
			});
		}

		if (item.rating) {
			posterWrapper.createDiv({
				cls: 'shelf-card__badge shelf-card__badge--rating',
				text: `⭐ ${item.rating}`,
			});
		}

		const info = card.createDiv({ cls: 'shelf-card__info' });

		info.createDiv({
			cls: 'shelf-card__title',
			text: item.title,
			attr: { title: item.title },
		});

		const metaParts: string[] = [];
		if (item.year) metaParts.push(item.year.toString());
		if (item.author) metaParts.push(item.author);

		if (metaParts.length > 0) {
			info.createDiv({
				cls: 'shelf-card__meta',
				text: metaParts.join(' • '),
			});
		}

		card.addEventListener('click', () => {
			void this.openFile(item.path);
		});
	}

	private async openFile(path: string): Promise<void> {
		await this.app.workspace.openLinkText(path, '', true);
	}

	public async onClose() {}
}
