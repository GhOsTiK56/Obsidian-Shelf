import { Plugin } from 'obsidian';
import { VIEW_TYPE_LIBRARY, LibraryView } from './library_view';
import {
	DEFAULT_SETTINGS,
	ObsidianShelfSettings,
	SettingTab,
} from './settings';
export default class ObsidianShelf extends Plugin {
	public settings!: ObsidianShelfSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(VIEW_TYPE_LIBRARY, (leaf) => new LibraryView(leaf, this));

		this.addRibbonIcon('library', 'Open library', async () => {
			const leaf = this.app.workspace.getLeaf('tab');

			await leaf.setViewState({
				type: VIEW_TYPE_LIBRARY,
				active: true,
			});

			await this.app.workspace.revealLeaf(leaf);
		});

		this.addSettingTab(new SettingTab(this.app, this));
	}

	public async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<ObsidianShelfSettings>,
		);
	}

	public async saveSettings() {
		await this.saveData(this.settings);
		await this.refreshAllLibraries();
	}

	public async refreshAllLibraries() {
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_LIBRARY)) {
			if (leaf.view instanceof LibraryView) {
				await leaf.view.refreshView();
			}
		}
	}

	onunload() {}
}
