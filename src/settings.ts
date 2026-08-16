import { App, PluginSettingTab, Setting } from 'obsidian';
import ObsidianShelf from './main';
import { logger } from './common/logger';

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
      this.plugin.saveSettings().catch((error) => {
        logger.error(`Failed to save settings: ${error}`);
      })
		});

		new Setting(containerEl)
			.setName('Books cards path')
			.setDesc('Books cards path')
			.addText((text) =>
				text
					.setPlaceholder('Enter your path')
					.setValue(this.plugin.settings.booksPath)
					.onChange(async (value) => {
						this.plugin.settings.booksPath = value;
					}),
			);

		new Setting(containerEl)
			.setName('Manga cards path')
			.setDesc('Manga cards path')
			.addText((text) =>
				text
					.setPlaceholder('Enter your path')
					.setValue(this.plugin.settings.mangaPath)
					.onChange(async (value) => {
						this.plugin.settings.mangaPath = value;
					}),
			);

		new Setting(containerEl)
			.setName('Anime cards path')
			.setDesc('Anime cards path')
			.addText((text) =>
				text
					.setPlaceholder('Enter your path')
					.setValue(this.plugin.settings.animePath)
					.onChange(async (value) => {
						this.plugin.settings.animePath = value;
					}),
			);

		new Setting(containerEl)
			.setName('Movies cards path')
			.setDesc('Movies cards path')
			.addText((text) =>
				text
					.setPlaceholder('Enter your path')
					.setValue(this.plugin.settings.moviesPath)
					.onChange(async (value) => {
						this.plugin.settings.moviesPath = value;
					}),
			);
		new Setting(containerEl)
			.setName('Games cards path')
			.setDesc('Games cards path')
			.addText((text) =>
				text
					.setPlaceholder('Enter your path')
					.setValue(this.plugin.settings.gamesPath)
					.onChange(async (value) => {
						this.plugin.settings.gamesPath = value;
					}),
			);

		new Setting(containerEl)
			.setName('Tv shows cards path')
			.setDesc('Tv shows cards path')
			.addText((text) =>
				text
					.setPlaceholder('Enter your path')
					.setValue(this.plugin.settings.tvShowsPath)
					.onChange(async (value) => {
						this.plugin.settings.tvShowsPath = value;
					}),
			);
	}
}
