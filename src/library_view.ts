import { ItemView, WorkspaceLeaf } from 'obsidian';
import { MediaItem, RawFileData } from './common/media_item';
import { BookItem } from './common/book_item';
import { MarkdownLoader } from './common/markdown_loader';
import ObsidianShelf from './main';

export const VIEW_TYPE_LIBRARY = 'library-view';

export class LibraryView extends ItemView {
	private gridContainer!: HTMLElement;
	private loader!: MarkdownLoader;
	public plugin: ObsidianShelf;

	private currentCategory: string = '';
	private currentSortOrder: string = 'tag-group';
	private searchQuery: string = ''; // Хранение текущей поисковой строки

	public constructor(leaf: WorkspaceLeaf, plugin: ObsidianShelf) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_LIBRARY;
	}

	getDisplayText(): string {
		return 'My library';
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();

		const controlsWrapper = container.createDiv({
			cls: 'controls-wrapper',
		});

		// 1. Поле ввода для поиска
		const searchInput = controlsWrapper.createEl('input', {
			cls: 'search-input',
			attr: {
				type: 'search',
				placeholder: 'Search by title or #tag...',
			},
		});

		// 2. Селектор категорий
		const selectCategory = controlsWrapper.createEl('select', {
			cls: 'select',
		});

		const categories = [
			{ value: `${this.plugin.settings.booksPath}`, text: '📚 Books' },
			{ value: `${this.plugin.settings.mangaPath}`, text: '📖 Manga' },
			{ value: `${this.plugin.settings.moviesPath}`, text: '🎬 Movies' },
			{ value: `${this.plugin.settings.animePath}`, text: '⛩️ Anime' },
			{ value: `${this.plugin.settings.gamesPath}`, text: '🎮 Games' },
			{ value: `${this.plugin.settings.tvShowsPath}`, text: '📺 TV Shows' },
		];

		categories.forEach((category) => {
			const option = selectCategory.createEl('option');
			option.value = category.value;
			option.text = category.text;
		});

		// 3. Селектор сортировки
		const selectSort = controlsWrapper.createEl('select', {
			cls: 'select',
		});

		const sortOptions = [
			{ value: 'tag-group', text: 'Group by Tag (Chronological)' },
			{ value: 'title-asc', text: 'Title (A-Z)' },
			{ value: 'title-desc', text: 'Title (Z-A)' },
			{ value: 'year-asc', text: 'Date (Oldest)' },
			{ value: 'year-desc', text: 'Date (Newest)' },
		];

		sortOptions.forEach((option) => {
			const opt = selectSort.createEl('option');
			opt.value = option.value;
			opt.text = option.text;
		});

		this.currentCategory = selectCategory.value;
		this.currentSortOrder = selectSort.value;

		this.loader = new MarkdownLoader(this.app);

		this.gridContainer = container.createDiv({
			cls: 'media-cards-grid',
		});

		this.updateContent();

		// Обработчики событий
		searchInput.oninput = () => {
			this.searchQuery = searchInput.value.trim().toLowerCase();
			this.updateContent();
		};

		selectCategory.onchange = () => {
			this.currentCategory = selectCategory.value;
			this.updateContent();
		};

		selectSort.onchange = () => {
			this.currentSortOrder = selectSort.value;
			this.updateContent();
		};
	}

	public async refreshView() {
		await this.onOpen();
	}

	private updateContent() {
		this.gridContainer.empty();

		let mediaData = this.loader.getParsedFiles(this.currentCategory);

		// Фильтрация по названию ИЛИ тегам
		if (this.searchQuery !== '') {
			// Убираем # из начала запроса, если пользователь ищет по тегу через решетку (#fantasy -> fantasy)
			const cleanQuery = this.searchQuery.startsWith('#')
				? this.searchQuery.slice(1)
				: this.searchQuery;

			mediaData = mediaData.filter((item) => {
				const matchesTitle = item.title.toLowerCase().includes(cleanQuery);

				const matchesTag = item.tags?.some((tag) =>
					tag.toLowerCase().includes(cleanQuery),
				);

				return matchesTitle || matchesTag;
			});
		}

		mediaData = this.sortMediaData(mediaData, this.currentSortOrder);

		const mediaList: MediaItem[] = mediaData.map((file) => new BookItem(file));

		for (const item of mediaList) {
			const cardItem = this.gridContainer.createDiv({
				cls: 'card-item',
			});

			const imageWrapper = cardItem.createDiv({
				cls: 'card-image-wrapper',
			});

			if (item.poster) {
				imageWrapper.createEl('img', {
					cls: 'card-poster',
					attr: { src: item.poster, alt: item.getTitleName() },
				});
			} else {
				imageWrapper.createDiv({ cls: 'card-poster-placeholder' });
			}

			const textOverlay = imageWrapper.createDiv({
				cls: 'card-text-overlay',
			});

			if (item.status) {
				textOverlay.createSpan({
					text: item.status,
					cls: 'card-overlay-status',
				});
			}

			cardItem
				.createDiv({
					cls: 'card-content',
				})
				.createEl('p', {
					text: item.getTitleName(),
					cls: 'card-text',
				});

			cardItem.onclick = async () => {
				if (item.file) {
					const leaf = this.app.workspace.getLeaf(false);
					await leaf.openFile(item.file);
				}
			};
		}
	}

	private sortMediaData(data: RawFileData[], sortType: string): RawFileData[] {
		if (sortType === 'tag-group') {
			return this.groupByTagsAndSort(data);
		}

		return [...data].sort((a, b) => {
			switch (sortType) {
				case 'title-asc':
					return a.title.localeCompare(b.title, undefined, {
						numeric: true,
						sensitivity: 'base',
					});
				case 'title-desc':
					return b.title.localeCompare(a.title, undefined, {
						numeric: true,
						sensitivity: 'base',
					});
				case 'year-desc':
					if (a.year === 0) return 1;
					if (b.year === 0) return -1;
					return b.year - a.year;
				case 'year-asc':
					if (a.year === 0) return 1;
					if (b.year === 0) return -1;
					return a.year - b.year;
				default:
					return 0;
			}
		});
	}

	private groupByTagsAndSort(data: RawFileData[]): RawFileData[] {
		const groups = new Map<string, RawFileData[]>();
		const noTagKey = 'Untagged';

		for (const item of data) {
			const firstTag = item.tags?.[0];
			const primaryTag: string =
				firstTag && firstTag.trim() !== '' ? firstTag : noTagKey;

			if (!groups.has(primaryTag)) {
				groups.set(primaryTag, []);
			}
			groups.get(primaryTag)!.push(item);
		}

		const getMinYear = (items: RawFileData[]): number => {
			const validYears = items.map((i) => i.year).filter((y) => y > 0);
			return validYears.length > 0 ? Math.min(...validYears) : Infinity;
		};

		groups.forEach((items) => {
			items.sort((a, b) => {
				if (a.year === 0) return 1;
				if (b.year === 0) return -1;
				return a.year - b.year;
			});
		});

		const sortedGroupKeys = Array.from(groups.keys()).sort((tagA, tagB) => {
			if (tagA === noTagKey) return 1;
			if (tagB === noTagKey) return -1;

			const minYearA = getMinYear(groups.get(tagA)!);
			const minYearB = getMinYear(groups.get(tagB)!);

			if (minYearA === minYearB) {
				return tagA.localeCompare(tagB);
			}
			return minYearA - minYearB;
		});

		const result: RawFileData[] = [];
		for (const key of sortedGroupKeys) {
			result.push(...groups.get(key)!);
		}

		return result;
	}

	async onClose() {
		this.containerEl.empty();
	}
}
