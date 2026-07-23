import { ItemView, WorkspaceLeaf } from 'obsidian';
import { logger } from './common/logger';
import { MediaItem } from './media_item';
import { BookItem } from './book_item';
import { MarkdownLoader } from './markdown_loader';

export const VIEW_TYPE_LIBRARY = 'library-view';

export class LibraryView extends ItemView {
	private gridContainer!: HTMLElement;
	private loader!: MarkdownLoader;

	public constructor(leaf: WorkspaceLeaf) {
		super(leaf);
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

		container.createEl('h2', {
			text: 'My library',
			cls: 'library-title',
		});

		const select = container.createEl('select', {
			cls: 'select',
		});

		const categories = [
			{ value: 'Books', text: '📚 Books' },
			{ value: 'Movies', text: '🎬 Movies' },
			{ value: 'Anime', text: '⛩️ Anime' },
			{ value: 'Games', text: '🎮 Games' },
			{ value: 'TV Shows', text: '📺 TV Shows' },
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
			logger.info(`Library changed to: ${select.value}`);
			this.updateContent(select.value);
		};

		logger.info('ItemVew was opened');
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

			if (item.poster) {
				cardItem.createEl('img', {
					cls: 'card-poster',
					attr: { src: item.poster, alt: item.getTitleName() },
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
		}
	}

	async onClose() {
		this.containerEl.empty();
		logger.info('ItemVew was closed');
	}
}
