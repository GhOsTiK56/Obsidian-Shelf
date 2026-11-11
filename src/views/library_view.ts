import {
	debounce,
	DropdownComponent,
	ItemView,
	SearchComponent,
	TFile,
	ViewStateResult,
	WorkspaceLeaf,
} from 'obsidian';
import {
	GENRES,
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
	genreFilters: string[];
}

export class LibraryView extends ItemView {
	private readonly libraryService: LibraryService;

	private gridContainer!: HTMLElement;
	private sentinel!: HTMLElement;
	private observer: IntersectionObserver | null = null;

	private state: LibraryViewState = {
		category: MediaType.TV_SERIES,
		sortBy: SortOption.TAGS_YEAR,
		statusFilter: 'all',
		searchQuery: '',
		genreFilters: [],
	};

	private genreFilterRoot: HTMLElement | null = null;
	private genreFilterMenu: HTMLElement | null = null;
	private genreFilterButton: HTMLButtonElement | null = null;
	private readonly genreFilterCheckboxes = new Map<string, HTMLInputElement>();
	private hasRegisteredGenreOutsideClick = false;

	private allCards: ShelfCardModel[] = [];
	private loadedCount: number = 0;
	private readonly BATCH_SIZE = 40;

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

		this.sentinel = root.createDiv({ cls: 'scroll-sentinel' });

		this.setupIntersectionObserver();
		this.registerWatchers();

		await this.updateContent();
	}

	private setupIntersectionObserver() {
		const options = {
			root: this.contentEl,
			rootMargin: '200px',
			threshold: 0,
		};

		this.observer = new IntersectionObserver((entries) => {
			const firstEntry = entries[0];
			if (firstEntry && firstEntry.isIntersecting) {
				this.loadMoreCards();
			}
		}, options);

		this.observer.observe(this.sentinel);
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
			genreFilters: [...this.state.genreFilters],
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

			if (Array.isArray(savedState.genreFilters)) {
				const savedGenres = new Set(
					savedState.genreFilters.filter(
						(genre): genre is string => typeof genre === 'string',
					),
				);
				this.state.genreFilters = GENRES.filter((genre) =>
					savedGenres.has(genre),
				);
			}
		}

		this.syncGenreFilterControls();

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

		this.renderGenreFilter(wrapper);

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

	/** Creates a small checkbox dropdown without relying on an undocumented API. */
	private renderGenreFilter(container: HTMLElement): void {
		const dropdown = container.createDiv({ cls: 'genre-filter' });

		const button = dropdown.createEl('button', {
			cls: 'genre-filter__button',
			text: this.getGenreFilterButtonText(),
			attr: {
				type: 'button',
				'aria-haspopup': 'true',
				'aria-expanded': 'false',
				'aria-label': 'Filter by genre',
			},
		});

		const menu = dropdown.createDiv({ cls: 'genre-filter__menu' });
		menu.setAttribute('role', 'group');
		menu.setAttribute('aria-label', 'Filter by genre');

		const menuHeader = menu.createDiv({ cls: 'genre-filter__header' });

		const heading = menuHeader.createSpan({ text: 'Filter by genre' });
		heading.addClass('genre-filter__heading');

		const clearButton = menuHeader.createEl('button', {
			text: 'Clear',
			cls: 'genre-filter__clear',
			attr: { type: 'button' },
		});

		const options = menu.createDiv({ cls: 'genre-filter__options' });

		this.genreFilterCheckboxes.clear();

		for (const genre of GENRES) {
			const option = options.createEl('label', {
				cls: 'genre-filter__option',
			});

			const checkbox = option.createEl('input', {
				attr: { type: 'checkbox' },
			});
			checkbox.checked = this.state.genreFilters.includes(genre);
			checkbox.addClass('genre-filter__checkbox');
			this.genreFilterCheckboxes.set(genre, checkbox);

			option.createSpan({ text: genre });

			this.registerDomEvent(checkbox, 'change', () => {
				if (checkbox.checked) {
					if (!this.state.genreFilters.includes(genre)) {
						this.state.genreFilters.push(genre);
					}
				} else {
					this.state.genreFilters = this.state.genreFilters.filter(
						(selectedGenre) => selectedGenre !== genre,
					);
				}

				this.updateGenreFilterButtonText();
				this.app.workspace.requestSaveLayout();
				void this.updateContent();
			});
		}

		this.registerDomEvent(clearButton, 'click', (event) => {
			event.preventDefault();
			this.state.genreFilters = [];
			for (const checkbox of this.genreFilterCheckboxes.values()) {
				checkbox.checked = false;
			}
			this.updateGenreFilterButtonText();
			this.app.workspace.requestSaveLayout();
			void this.updateContent();
		});

		this.registerDomEvent(button, 'click', () => {
			this.setGenreMenuOpen(!menu.hasClass('is-open'));
		});

		this.genreFilterRoot = dropdown;
		this.genreFilterMenu = menu;
		this.genreFilterButton = button;
		this.registerGenreOutsideClickHandler();
	}

	private registerGenreOutsideClickHandler(): void {
		if (this.hasRegisteredGenreOutsideClick) {
			return;
		}

		this.hasRegisteredGenreOutsideClick = true;
		this.registerDomEvent(this.contentEl.ownerDocument, 'pointerdown', (event) => {
			if (
				this.genreFilterRoot &&
				!this.genreFilterRoot.contains(event.target as Node)
			) {
				this.setGenreMenuOpen(false);
			}
		});
	}

	private setGenreMenuOpen(isOpen: boolean): void {
		if (!this.genreFilterMenu || !this.genreFilterButton) {
			return;
		}

		if (isOpen) {
			this.genreFilterMenu.addClass('is-open');
		} else {
			this.genreFilterMenu.removeClass('is-open');
		}
		this.genreFilterButton.setAttribute('aria-expanded', String(isOpen));
	}

	private getGenreFilterButtonText(): string {
		const count = this.state.genreFilters.length;
		return count > 0 ? `🏷️ Genres (${count})` : '🏷️ Genres';
	}

	private updateGenreFilterButtonText(): void {
		if (this.genreFilterButton) {
			this.genreFilterButton.textContent = this.getGenreFilterButtonText();
		}
	}

	private syncGenreFilterControls(): void {
		const selectedGenres = new Set(this.state.genreFilters);
		for (const [genre, checkbox] of this.genreFilterCheckboxes) {
			checkbox.checked = selectedGenres.has(genre);
		}
		this.updateGenreFilterButtonText();
	}

	private async updateContent() {
		this.gridContainer.empty();
		this.loadedCount = 0;

		this.sentinel.removeClass('is-hidden');

		this.allCards = await this.libraryService.getShelfCards(
			this.state.category,
			this.state.sortBy,
			this.state.statusFilter,
			this.state.searchQuery,
			this.state.genreFilters,
		);

		this.loadMoreCards();
	}

	private loadMoreCards() {
		if (this.loadedCount >= this.allCards.length) {
			this.sentinel.addClass('is-hidden');
			return;
		}

		const nextCount = Math.min(
			this.loadedCount + this.BATCH_SIZE,
			this.allCards.length,
		);

		for (let i = this.loadedCount; i < nextCount; i++) {
			const card = this.allCards[i];
			if (card) {
				this.createCard(this.gridContainer, card);
			}
		}

		this.loadedCount = nextCount;
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

	public async onClose() {
		this.setGenreMenuOpen(false);

		if (this.observer) {
			this.observer.disconnect();
			this.observer = null;
		}
	}
}
