import { App, PluginSettingTab, SettingDefinitionItem } from 'obsidian';
import MyPlugin from './main';

export interface ObsidianShelfSettings {
	mySetting: string;
}

export const DEFAULT_SETTINGS: ObsidianShelfSettings = {
	mySetting: 'default',
};

export class ObsidianShelfSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Enable feature',
				desc: 'Turns the feature on or off.',
				control: { type: 'toggle', key: 'enabled' },
			},
		];
	}
}
