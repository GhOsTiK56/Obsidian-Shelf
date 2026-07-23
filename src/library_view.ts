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
		logger.info('ItemVew was closed');
	}
}
