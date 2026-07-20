import { Plugin } from 'obsidian';
import { logger } from './common/logger';
import { VIEW_TYPE_LIBRARY, LibraryView } from './library_view';
export default class ObsidianShelf extends Plugin {
	async onload() {
		this.registerView(VIEW_TYPE_LIBRARY, (leaf) => new LibraryView(leaf));

		this.addRibbonIcon('library', 'Open library', async () => {
			const leaf = this.app.workspace.getLeaf('tab');

			await leaf.setViewState({
				type: VIEW_TYPE_LIBRARY,
				active: true,
			});

			await this.app.workspace.revealLeaf(leaf);
		});

		logger.info('Plugin Loaded');
	}

	onunload() {
		logger.info('Plugin Unloaded');
	}
}
