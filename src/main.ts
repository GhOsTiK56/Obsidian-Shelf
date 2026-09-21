import { Notice, Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	PluginSettings,
	SettingsTab,
} from './views/settings_tab';
import { LIBRARY_VIEW, LibraryView } from './views/library_view';
import { LibraryRepository } from './infrastructure/library_repository';
import { PosterResolver } from './infrastructure/poster_resolver';

export default class ObsidianShelf extends Plugin {
	settings!: PluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SettingsTab(this.app, this));

		await this.addRibbon();

		const libraryRepository = new LibraryRepository(
			this.app.vault,
			this.app.metadataCache,
		);

		const posterResolver = new PosterResolver(this.app.vault);

		this.registerView(
			LIBRARY_VIEW,
			(leaf) =>
				new LibraryView(
					leaf,
					libraryRepository,
					() => this.settings,
					posterResolver,
				),
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
