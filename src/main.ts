import { Notice, Plugin } from 'obsidian';
import { ObsidianLibraryRepository } from './infrastructure/obsidian/obsidianLibraryRepository';
import { LoadLibrary } from './application/use-cases/loadLibrary';
import { LIBRARY_VIEW, LibraryView } from './presentation/views/libraryView';
import {
	DEFAULT_SETTINGS,
	PluginSettings,
	SettingsTab,
} from './presentation/views/SettingsTab';

export default class ObsidianShelf extends Plugin {
	settings!: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SettingsTab(this.app, this));

		await this.addRibbon();

		const libraryRepository = new ObsidianLibraryRepository(
			this.app.vault,
			this.app.metadataCache,
		);

		const loadLibraryUseCase = new LoadLibrary(libraryRepository);

		this.registerView(
			LIBRARY_VIEW,
			(leaf) => new LibraryView(leaf, loadLibraryUseCase, () => this.settings),
		);

		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Obsidian shelf status bar text');
	}

	public async addRibbon() {
		this.addRibbonIcon('library-big', 'Obsidian shelf', async () => {
			const leaf = this.app.workspace.getLeaf('tab');

			await leaf.setViewState({
				type: LIBRARY_VIEW,
				active: true,
			});

			await this.app.workspace.revealLeaf(leaf);
			new Notice('Obsidian shelf is now open!');
		});
	}

	async loadSettings() {
		const loadedData = (await this.loadData()) as Partial<PluginSettings>;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);

		if (!this.settings.BooksPath || this.settings.BooksPath.trim() === '') {
			this.settings.BooksPath = DEFAULT_SETTINGS.BooksPath;
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
