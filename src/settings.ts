import { App, PluginSettingTab, Setting } from 'obsidian';
import ObsidianShelf from './main';

export interface ObsidianShelfSettings {
	booksPath: string;
	mangaPath: string;
	animePath: string;
	gamesPath: string;
	moviesPath: string;
	tvShowsPath: string;
}

export const DEFAULT_SETTINGS: ObsidianShelfSettings = {
	booksPath: 'Books',
	mangaPath: 'Manga',
	animePath: 'Anime',
	gamesPath: 'Games',
	moviesPath: 'Movies',
	tvShowsPath: 'TV Shows',
};

export class SettingTab extends PluginSettingTab {
	plugin: ObsidianShelf;

	constructor(app: App, plugin: ObsidianShelf) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		const saveButton = containerEl.createEl('button', {
			text: 'Save',
			cls: 'mod-cta',
		});

		saveButton.addEventListener('click', () => {
			this.plugin.saveSettings().catch((error) => {});
		});

		const categories: string[] = [
			'Books',
			'Manga',
			'Anime',
			'Games',
			'Movies',
			'TV Shows',
		];

		for (const category of categories) {
			new Setting(containerEl)
				.setName(`${category} cards path`)
				.setDesc(`${category} cards path`)
				.addText((text) =>
					text
						.setPlaceholder(`Enter your path`)
						.setValue(
							this.plugin.settings[
								`${category.toLowerCase()}Path` as keyof typeof this.plugin.settings
							],
						)
						.onChange(async (value) => {
							this.plugin.settings[
								`${category.toLowerCase()}Path` as keyof typeof this.plugin.settings
							] = value;
						}),
				);
		}
	}
}
