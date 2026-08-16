import { ItemView, WorkspaceLeaf } from 'obsidian';
import { MediaItem } from './common/media_item';
import { BookItem } from './common/book_item';
import { MarkdownLoader } from './common/markdown_loader';
import ObsidianShelf from './main';

export const VIEW_TYPE_LIBRARY = 'library-view';

export class LibraryView extends ItemView {
	private gridContainer!: HTMLElement;
	private loader!: MarkdownLoader;
	public plugin: ObsidianShelf;

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

		const select = container.createEl('select', {
			cls: 'select',
		});

		const categories = [
			{ value: `${this.plugin.settings.booksPath}`, text: '📚 Books' },
			{ value: `${this.plugin.settings.mangaPath}`, text: '📖 Manga'},
			{ value: `${this.plugin.settings.moviesPath}`, text: '🎬 Movies' },
			{ value: `${this.plugin.settings.animePath}`, text: '⛩️ Anime' },
			{ value: `${this.plugin.settings.gamesPath}`, text: '🎮 Games' },
			{ value: `${this.plugin.settings.tvShowsPath}`, text: '📺 TV Shows' },
		];

		categories.forEach((category) => {
			const option = select.createEl('option');
			option.value = category.value;
			option.text = category.text;
		});

		this.loader = new MarkdownLoader(this.app);

		this.gridContainer = container.createDiv({
			cls: 'media-cards-grid',
		});

		this.updateContent(select.value);

		select.onchange = () => {
			this.updateContent(select.value);
		};
	}

	public async refreshView() {
		await this.onOpen();
	}

	private updateContent(category: string) {
		this.gridContainer.empty();

		const mediaData = this.loader.getParsedFiles(category);

		const mediaList: MediaItem[] = mediaData.map((file) => {
			return new BookItem(file);
		});

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

	async onClose() {
		this.containerEl.empty();
	}
}
