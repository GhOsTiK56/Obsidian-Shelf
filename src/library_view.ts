import { ItemView, WorkspaceLeaf } from 'obsidian';
import { logger } from './common/logger';
import { MediaItem } from './media_item';
import { BookItem } from './book_item';
import { MarkdownLoader } from './markdown_loader';

export const VIEW_TYPE_LIBRARY = 'library-view';

export class LibraryView extends ItemView {
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

		const gridContainer = container.createDiv({
			cls: 'media-cards-grid',
		});

		const loader = new MarkdownLoader(this.app);
		const mediaData = loader.getParsedFiles();

		const mediaList: MediaItem[] = mediaData.map((file) => {
			return new BookItem(file);
		});

		for (const item of mediaList) {
			const cardItem = gridContainer.createDiv({
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

		logger.info('ItemVew was opened');
	}

	async onClose() {
		this.containerEl.empty();
		logger.info('ItemVew was closed');
	}
}
