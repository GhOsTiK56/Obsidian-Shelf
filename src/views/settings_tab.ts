import { App, PluginSettingTab, SettingDefinitionItem } from 'obsidian';
import ObsidianShelf from '../main';

export interface PluginSettings {
	PostersPath: string;
	BooksPath: string;
	MoviesPath: string;
	TV_SeriesPath: string;
	AnimePath: string;
	MangaPath: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	PostersPath: 'Posters',
	BooksPath: 'Books',
	MoviesPath: 'Movies',
	TV_SeriesPath: 'TV Series',
	AnimePath: 'Anime',
	MangaPath: 'Manga',
};

export class SettingsTab extends PluginSettingTab {
	plugin: ObsidianShelf;

	public constructor(app: App, plugin: ObsidianShelf) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private readonly settingsItems: Array<{
		name: string;
		key: keyof PluginSettings;
	}> = [
		{ name: 'Posters', key: 'PostersPath' },
		{ name: 'Books', key: 'BooksPath' },
		{ name: 'Movies', key: 'MoviesPath' },
		{ name: 'TV Series', key: 'TV_SeriesPath' },
		{ name: 'Anime', key: 'AnimePath' },
		{ name: 'Manga', key: 'MangaPath' },
	];

	public getSettingDefinitions(): SettingDefinitionItem[] {
		return this.settingsItems.map((item) => ({
			name: `${item.name}`,
			desc: `${item.name} path`,
			control: {
				type: 'text',
				key: `${item.key}`,
				placeholder: DEFAULT_SETTINGS[item.key],
			},
		}));
	}
}
