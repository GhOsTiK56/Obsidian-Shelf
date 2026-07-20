import { ItemView, WorkspaceLeaf } from 'obsidian';

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
			cls: 'library-card',
		});

		card.createEl('h3', {
			text: 'Interstellar',
		});

		card.createEl('p', {
			text: 'Movie • 2014',
		});
	}

	async onClose() {}
}
