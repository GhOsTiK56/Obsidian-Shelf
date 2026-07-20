import { ItemView, WorkspaceLeaf } from 'obsidian';
import { logger } from './common/logger';

export const VIEW_TYPE_LIBRARY = 'library-view';

export class LibraryView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
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
		});

		const card = container.createDiv({
      text: 'Library',
			cls: 'library-card',
		});

		for (let i = 0; i < 10; i++) {
			card.createEl('p', {
				text: `text: ${i}`,
        cls: i % 2 == 0 ? 'card_even_numbered' : 'card_non_even_numbered'
			});
		}

		logger.info('ItemVew was opened');
	}

	async onClose() {
		logger.info('ItemVew was closed');
	}
}
