import { ItemView, WorkspaceLeaf, TFile, debounce } from 'obsidian';
import { MediaItem, RawFileData } from './common/media_item';
import { BookItem } from './common/book_item';
import { MarkdownLoader } from './common/markdown_loader';
import ObsidianShelf from './main';

export const VIEW_TYPE_LIBRARY = 'library-view';

type SortOrder =
	'tag-group' | 'title-asc' | 'title-desc' | 'year-asc' | 'year-desc';

const SORT_OPTIONS: Array<{ value: SortOrder; label: string }> = [
	{ value: 'tag-group', label: 'Group by Tag (Chronological)' },
	{ value: 'title-asc', label: 'Title (A-Z)' },
	{ value: 'title-desc', label: 'Title (Z-A)' },
	{ value: 'year-asc', label: 'Date (Oldest)' },
	{ value: 'year-desc', label: 'Date (Newest)' },
];

export class LibraryView extends ItemView {
	public readonly plugin: ObsidianShelf;
	private readonly loader: MarkdownLoader;

	private gridContainer!: HTMLDivElement;
	private selectStatus!: HTMLSelectElement;

	private state = {
		category: '',
		sortOrder: 'tag-group' as SortOrder,
		status: 'all',
		searchQuery: '',
	};

	constructor(leaf: WorkspaceLeaf, plugin: ObsidianShelf) {
		super(leaf);
		this.plugin = plugin;
		this.loader = new MarkdownLoader(this.app);
	}

	getViewType(): string {
		return VIEW_TYPE_LIBRARY;
	}

	getDisplayText(): string {
		return 'My library';
	}

	async onOpen(): Promise<void> {
		const { contentEl } = this;
		contentEl.empty();

		this.renderControls(contentEl);

		this.gridContainer = contentEl.createDiv({ cls: 'media-cards-grid' });

		this.registerEventListeners();
		this.updateContent();
	}

	private renderControls(container: HTMLElement): void {
		const controlsWrapper = container.createDiv({ cls: 'controls-wrapper' });

		const searchInput = controlsWrapper.createEl('input', {
			cls: 'search-input',
			attr: {
				type: 'search',
				placeholder: 'Search by title or #tag...',
			},
		});

		const debouncedSearch = debounce(
			(value: string) => {
				this.state.searchQuery = value.trim().toLowerCase();
				this.updateContent();
			},
			300,
			true,
		);

		searchInput.addEventListener('input', (e) => {
			const target = e.target as HTMLInputElement;
			debouncedSearch(target.value);
		});

		const selectCategory = controlsWrapper.createEl('select', {
			cls: 'select',
		});
		const categories = this.getCategoryOptions();

		categories.forEach(({ value, label }) => {
			selectCategory.createEl('option', { value, text: label });
		});

		this.state.category = selectCategory.value;
		selectCategory.addEventListener('change', () => {
			this.state.category = selectCategory.value;
			this.state.status = 'all';
			this.updateContent();
		});

		this.selectStatus = controlsWrapper.createEl('select', { cls: 'select' });
		this.selectStatus.addEventListener('change', () => {
			this.state.status = this.selectStatus.value;
			this.updateContent();
		});

		const selectSort = controlsWrapper.createEl('select', { cls: 'select' });
		SORT_OPTIONS.forEach(({ value, label }) => {
			selectSort.createEl('option', { value, text: label });
		});

		this.state.sortOrder = selectSort.value as SortOrder;
		selectSort.addEventListener('change', () => {
			this.state.sortOrder = selectSort.value as SortOrder;
			this.updateContent();
		});
	}

	private registerEventListeners(): void {
		const handleVaultChange = () => this.updateContent();

		const handleMetadataChange = (file: TFile) => {
			if (this.state.category && file.path.startsWith(this.state.category)) {
				this.updateContent();
			}
		};

		this.registerEvent(this.app.vault.on('create', handleVaultChange));
		this.registerEvent(this.app.vault.on('delete', handleVaultChange));
		this.registerEvent(this.app.vault.on('rename', handleVaultChange));
		this.registerEvent(
			this.app.metadataCache.on('changed', handleMetadataChange),
		);
	}

	private updateContent(): void {
		if (!this.gridContainer) return;

		this.gridContainer.empty();

		let rawData = this.loader.getParsedFiles(this.state.category);

		this.updateStatusDropdownOptions(rawData);

		rawData = this.filterData(rawData);
		rawData = this.sortMediaData(rawData, this.state.sortOrder);

		const mediaItems: MediaItem[] = rawData.map((file) => new BookItem(file));

		const fragment = document.createDocumentFragment();
		for (const item of mediaItems) {
			this.renderCard(fragment, item);
		}

		this.gridContainer.appendChild(fragment);
	}

	private updateStatusDropdownOptions(rawFiles: RawFileData[]): void {
		const uniqueStatuses = new Set<string>();

		rawFiles.forEach((file) => {
			if (file.status?.trim()) {
				uniqueStatuses.add(file.status.trim());
			}
		});

		this.selectStatus.empty();

		this.selectStatus.createEl('option', {
			value: 'all',
			text: '📌 All Statuses',
		});

		uniqueStatuses.forEach((status) => {
			this.selectStatus.createEl('option', { value: status, text: status });
		});

		if (uniqueStatuses.has(this.state.status)) {
			this.selectStatus.value = this.state.status;
		} else {
			this.state.status = 'all';
			this.selectStatus.value = 'all';
		}
	}

	private filterData(data: RawFileData[]): RawFileData[] {
		return data.filter((item) => {
			if (
				this.state.status !== 'all' &&
				item.status?.trim() !== this.state.status
			) {
				return false;
			}

			if (this.state.searchQuery) {
				const query = this.state.searchQuery.replace(/^#/, '');
				const matchesTitle = item.title.toLowerCase().includes(query);
				const matchesTag = item.tags?.some((tag) =>
					tag.toLowerCase().includes(query),
				);

				return matchesTitle || matchesTag;
			}

			return true;
		});
	}

	private getRatingColor(rating: number | string): string {
		const num = typeof rating === 'number' ? rating : parseFloat(rating);
		if (isNaN(num)) return 'var(--text-normal)';

		const max = 10;
		const ratio = Math.max(0, Math.min(1, num / max));
		const hue = ratio * 120;

		return `hsl(${hue}, 80%, 50%)`;
	}

	private getStatusColor(status: string): string {
		const s = status.toLowerCase();

		if (
			[
				'completed',
				'finished',
				'read',
				'watched',
				'done',
				'прочитано',
				'просмотрено',
				'завершено',
			].some((k) => s.includes(k))
		)
			return 'hsl(120, 80%, 50%)';
		if (
			[
				'progress',
				'reading',
				'watching',
				'playing',
				'current',
				'в процессе',
				'читаю',
				'смотрю',
			].some((k) => s.includes(k))
		)
			return 'hsl(40, 80%, 50%)';
		if (['hold', 'pause', 'отложено', 'пауза'].some((k) => s.includes(k)))
			return 'hsl(30, 80%, 50%)';
		if (['drop', 'abandon', 'stop', 'брошено'].some((k) => s.includes(k)))
			return 'hsl(0, 80%, 50%)';
		if (
			['plan', 'want', 'backlog', 'планах', 'буду'].some((k) => s.includes(k))
		)
			return 'hsl(0, 0%, 60%)';

		return 'var(--text-accent, #3fffb2)';
	}

	private renderCard(container: ParentNode, item: MediaItem): void {
		const cardItem = container.createEl('div', { cls: 'card-item' });

		const titleName = item.getTitleName();
		const imageWrapper = cardItem.createDiv({ cls: 'card-image-wrapper' });

		if (item.poster) {
			imageWrapper.createEl('img', {
				cls: 'card-poster',
				attr: { src: item.poster, alt: titleName, loading: 'lazy' },
			});
		} else {
			imageWrapper.createDiv({ cls: 'card-poster-placeholder' });
		}

		let rating: number | string | null = null;
		if (item.file) {
			const cache = this.app.metadataCache.getFileCache(item.file);
			if (cache && cache.frontmatter) {
				const fm = cache.frontmatter;
				const foundRating = fm['rating'] ?? fm['score'] ?? fm['rate'];

				if (
					typeof foundRating === 'number' ||
					typeof foundRating === 'string'
				) {
					rating = foundRating;
				}
			}
		}

		if (rating == null) {
			const itemRecord = item as unknown as Record<string, unknown>;
			const possibleRating =
				itemRecord['rating'] ??
				itemRecord['score'] ??
				itemRecord['rate'] ??
				(itemRecord['data'] as Record<string, unknown> | undefined)?.['rating'];

			if (
				typeof possibleRating === 'number' ||
				typeof possibleRating === 'string'
			) {
				rating = possibleRating;
			}
		}

		if (item.status || rating != null) {
			const textOverlay = imageWrapper.createDiv({ cls: 'card-text-overlay' });
			const tagsWrapper = textOverlay.createDiv({ cls: 'card-overlay-tags' });

			if (item.status) {
				const statusEl = tagsWrapper.createSpan({
					text: item.status,
					cls: 'card-overlay-status',
				});
				statusEl.style.color = this.getStatusColor(item.status);
			}

			if (rating != null) {
				const ratingEl = tagsWrapper.createSpan({
					text: `★ ${rating}`,
					cls: 'card-overlay-rating',
				});
				ratingEl.style.color = this.getRatingColor(rating);
			}
		}

		cardItem.addEventListener('click', () => {
			if (!item.file) return;

			const leaf = this.app.workspace.getLeaf(false);
			void leaf.openFile(item.file);
		});
	}

	private sortMediaData(
		data: RawFileData[],
		sortType: SortOrder,
	): RawFileData[] {
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
					return (b.year || 0) - (a.year || 0);
				case 'year-asc':
					return (a.year || 0) - (b.year || 0);
				default:
					return 0;
			}
		});
	}

	private groupByTagsAndSort(data: RawFileData[]): RawFileData[] {
		const groups = new Map<string, RawFileData[]>();
		const NO_TAG_KEY = 'Untagged';

		for (const item of data) {
			const primaryTag = item.tags?.[0]?.trim() || NO_TAG_KEY;

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
			items.sort((a, b) => (a.year || 0) - (b.year || 0));
		});

		const sortedGroupKeys = Array.from(groups.keys()).sort((tagA, tagB) => {
			if (tagA === NO_TAG_KEY) return 1;
			if (tagB === NO_TAG_KEY) return -1;

			const minYearA = getMinYear(groups.get(tagA)!);
			const minYearB = getMinYear(groups.get(tagB)!);

			return minYearA === minYearB
				? tagA.localeCompare(tagB)
				: minYearA - minYearB;
		});

		return sortedGroupKeys.flatMap((key) => groups.get(key) || []);
	}

	private getCategoryOptions() {
		const { settings } = this.plugin;
		return [
			{ value: settings.booksPath, label: '📚 Books' },
			{ value: settings.mangaPath, label: '📖 Manga' },
			{ value: settings.moviesPath, label: '🎬 Movies' },
			{ value: settings.animePath, label: '⛩️ Anime' },
			{ value: settings.gamesPath, label: '🎮 Games' },
			{ value: settings.tvShowsPath, label: '📺 TV Shows' },
		];
	}

	public async refreshView(): Promise<void> {
		await this.onOpen();
	}

	async onClose(): Promise<void> {
		this.containerEl.empty();
	}
}
