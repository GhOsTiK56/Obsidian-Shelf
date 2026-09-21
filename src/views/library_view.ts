import { ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings } from './settings_tab';
import { MediaItem } from '../entities/media_item';
import { LibraryRepository } from '../infrastructure/library_repository';
import { PosterResolver } from '../infrastructure/poster_resolver';
import { MediaType } from '../common';

export const LIBRARY_VIEW = 'library-view';

export class LibraryView extends ItemView {
	private readonly libraryRepository: LibraryRepository;
	private readonly getSettings: () => PluginSettings;
	private readonly posterResolver: PosterResolver;

	private gridContainer!: HTMLElement;

	private state = {
		category: MediaType.TV_SERIES,
	};

	public constructor(
		leaf: WorkspaceLeaf,
		libraryRepository: LibraryRepository,
		getSettings: () => PluginSettings,
		posterResolver: PosterResolver,
	) {
		super(leaf);
		this.libraryRepository = libraryRepository;
		this.getSettings = getSettings;
		this.posterResolver = posterResolver;
	}

	public getViewType() {
		return LIBRARY_VIEW;
	}

	public getDisplayText() {
		return 'Obsidian shelf';
	}

	public async onOpen() {
		const root = this.contentEl;

		root.empty();
		root.addClass('container');

		this.getCategorySelector(root);

		this.gridContainer = root.createDiv({
			cls: 'grid-container',
		});

		await this.updateContent();
	}

	private getCategorySelector(container: HTMLElement) {
		const categoryOptions = [
			{ value: MediaType.BOOK, label: '📚 Books' },
			{ value: MediaType.MOVIE, label: '🎬 Movies' },
			{ value: MediaType.TV_SERIES, label: '📺 TV Series' },
			{ value: MediaType.ANIME, label: '⛩️ Anime' },
			{ value: MediaType.MANGA, label: '📖 Manga' },
		];

		const wrapper = container.createDiv({
			cls: 'controls-wrapper',
		});

		const select = wrapper.createEl('select', {
			cls: 'select',
		});

		categoryOptions.forEach(({ value, label }) => {
			const option = select.createEl('option', {
				text: label,
			});

			option.value = value;
		});

		select.value = this.state.category;

		select.addEventListener('change', () => {
			this.state.category = select.value as MediaType;
			void this.updateContent();
		});
	}

	private getFolderByCategory(category: MediaType): string {
		const settings = this.getSettings();

		switch (category) {
			case MediaType.BOOK:
				return settings.BooksPath || DEFAULT_SETTINGS.BooksPath;

			case MediaType.MOVIE:
				return settings.MoviesPath || DEFAULT_SETTINGS.MoviesPath;

			case MediaType.TV_SERIES:
				return settings.TV_SeriesPath || DEFAULT_SETTINGS.TV_SeriesPath;

			case MediaType.ANIME:
				return settings.AnimePath || DEFAULT_SETTINGS.AnimePath;

			case MediaType.MANGA:
				return settings.MangaPath || DEFAULT_SETTINGS.MangaPath;
		}
	}

	private async updateContent() {
		this.gridContainer.empty();

		const folder = this.getFolderByCategory(this.state.category);

		const mediaItems = await this.libraryRepository.getAll(folder);

		for (const item of mediaItems) {
			this.createCard(this.gridContainer, item);
		}
	}

	private createCard(container: HTMLElement, item: MediaItem): void {
		const poster = this.posterResolver.resolve(item);

		if (!poster) return;

		const card = container.createDiv({ cls: 'shelf-card' });

		const img = card.createEl('img', {
			cls: 'shelf-card__image',
		});

		img.src = this.app.vault.getResourcePath(poster);
		img.loading = 'lazy';

		card.addEventListener('click', () => {
			void this.openFile(item.path);
		});
	}

	private async openFile(path: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			return;
		}

		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(file);
	}

	public async onClose() {}
}
