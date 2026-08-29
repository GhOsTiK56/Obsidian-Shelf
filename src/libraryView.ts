import { ItemView, WorkspaceLeaf } from 'obsidian';

export const LIBRARY_VIEW = 'library-view';

export class LibraryView extends ItemView {
	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType() {
		return LIBRARY_VIEW;
	}

	getDisplayText() {
		return 'Example value';
	}

	async onOpen() {
		const container = this.contentEl;
		container.empty();
		container.createEl('h4', { text: 'Example view' });
	}

  async onClose() {
    // Nothing to clean up.
  }
}
