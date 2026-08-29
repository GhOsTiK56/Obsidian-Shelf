/* eslint-disable obsidianmd/rule-custom-message */
import { Notice, Plugin } from 'obsidian';
import {
	DEFAULT_SETTINGS,
	ObsidianShelfSettings,
	ObsidianShelfSettingTab,
} from './settings';
import { LIBRARY_VIEW, LibraryView } from './libraryView';

export default class ObsidianShelf extends Plugin {
	settings!: ObsidianShelfSettings;

	async onload() {
		// Configure resources needed by the plugin.
		await this.loadSettings();

		this.registerView(LIBRARY_VIEW, (leaf) => new LibraryView(leaf));

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

		console.log('Plugin loaded');
	}

	onunload() {
		// Release any resources configured by the plugin. Runs when the plugin is disabled.
		console.log('Plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ObsidianShelfSettings>,
		);

		console.log('Settings loaded');
	}

	async saveSettings() {
		await this.saveData(this.settings);

		console.log('Settings saved');
	}
}
