import { Notice, Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	ObsidianShelfSettings,
} from './infrastructure/obsidian/settings';
import { LIBRARY_VIEW, LibraryView } from './presentation/views/libraryView';
import { ObsidianLibraryRepository } from './infrastructure/obsidian/obsidianLibraryRepository';
import { ObsidianShelfSettingTab } from './presentation/views/obsidianShelfSettingTab';
import { LoadLibrary } from './application/use-cases/loadLibrary';

export default class ObsidianShelf extends Plugin {
	settings!: ObsidianShelfSettings;

	async onload() {
		await this.loadSettings();
		const libraryRepository = new ObsidianLibraryRepository(
			this.app.vault,
			this.app.metadataCache,
		);

		const loadLibraryUseCase = new LoadLibrary(libraryRepository);

		this.registerView(
			LIBRARY_VIEW,
			(leaf) => new LibraryView(leaf, loadLibraryUseCase),
		);

		this.addRibbonIcon('library-big', 'Obsidian shelf', async () => {
			const leaf = this.app.workspace.getLeaf('tab');

			await leaf.setViewState({
				type: LIBRARY_VIEW,
				active: true,
			});

			await this.app.workspace.revealLeaf(leaf);
			new Notice('Obsidian shelf is now open!');
		});

		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Obsidian shelf status bar text');

		this.addSettingTab(new ObsidianShelfSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ObsidianShelfSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
