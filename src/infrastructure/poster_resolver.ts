import { TFile, Vault } from 'obsidian';
import { MediaItem } from '../entities/media_item';

export class PosterResolver {
	private readonly postersFolder = 'Cards/posters';

	public constructor(private readonly vault: Vault) {}

	public resolve(item: MediaItem): TFile | undefined {
		if (!item.type) {
			return undefined;
		}

		const markdown = this.vault.getAbstractFileByPath(item.path);

		if (!(markdown instanceof TFile)) {
			return undefined;
		}

		const posterPath = `${this.postersFolder}/${item.type}/${markdown.basename}.webp`;

		const poster = this.vault.getAbstractFileByPath(posterPath);

		return poster instanceof TFile ? poster : undefined;
	}
}
