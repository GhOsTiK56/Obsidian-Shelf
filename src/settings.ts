import { App, PluginSettingTab, Setting } from 'obsidian';
import ObsidianShelf from './main';

export interface ObsidianShelfSettings {
	booksPath: string;
	mangaPath: string;
	animePath: string;
	moviesPath: string;
	tvSeriesPath: string;
}

export const DEFAULT_SETTINGS: ObsidianShelfSettings = {
	booksPath: 'Books',
	moviesPath: 'Movies',
	tvSeriesPath: 'TV Series',
	animePath: 'Anime',
	mangaPath: 'Manga',
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

		const categoryMap: Array<{
			label: string;
			key: keyof ObsidianShelfSettings;
		}> = [
			{ label: 'Books', key: 'booksPath' },
			{ label: 'Manga', key: 'mangaPath' },
			{ label: 'Anime', key: 'animePath' },
			{ label: 'Movies', key: 'moviesPath' },
			{ label: 'TV Series', key: 'tvSeriesPath' },
		];

		for (const { label, key } of categoryMap) {
			new Setting(containerEl)
				.setName(`${label} cards path`)
				.setDesc(`${label} cards path`)
				.addText((text) =>
					text
						.setPlaceholder(`Enter your path`)
						.setValue(this.plugin.settings[key])
						.onChange(async (value) => {
							this.plugin.settings[key] = value;
						}),
				);
		}
	}
}
