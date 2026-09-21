import { TFile, Vault } from 'obsidian';
import { MediaItem } from '../entities/media_item';
import { PluginSettings } from '../views/settings_tab';

export class PosterResolver {
	private readonly getSettings: () => PluginSettings;

	public constructor(
		private readonly vault: Vault,
		getSettings: () => PluginSettings,
	) {
		this.getSettings = getSettings;
	}

	public resolve(item: MediaItem): TFile | undefined {
		const settings = this.getSettings();

		if (!item.type) {
			return undefined;
		}

		const markdown = this.vault.getAbstractFileByPath(item.path);

		if (!(markdown instanceof TFile)) {
			return undefined;
		}

		const posterPath = `${settings.PostersPath}/${item.type}/${markdown.basename}.webp`;

		const poster = this.vault.getAbstractFileByPath(posterPath);

		return poster instanceof TFile ? poster : undefined;
	}
}
