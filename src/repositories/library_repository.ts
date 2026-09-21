import { MetadataCache, TFile, TFolder, Vault } from 'obsidian';
import { MediaItem } from '../entities/media_item';
import { MetadataMapper } from '../infrastructure/metadata_mapper';

export class LibraryRepository {
	private readonly vault: Vault;
	private readonly metadataCache: MetadataCache;

	public constructor(vault: Vault, metadataCache: MetadataCache) {
		this.vault = vault;
		this.metadataCache = metadataCache;
	}
	async getAll(inputFolder: string): Promise<MediaItem[]> {
		if (!inputFolder) return [];

		const folder = this.vault.getAbstractFileByPath(inputFolder);

		if (!(folder instanceof TFolder)) {
			return [];
		}

		const mdFiles = this.getMarkdownFilesRecursively(folder);

		const items: MediaItem[] = mdFiles.map((file) => {
			const cache = this.metadataCache.getFileCache(file);
			const frontmatter = cache?.frontmatter;

			return MetadataMapper.mapMetadata(frontmatter, file);
		});

		return items;
	}

	private getMarkdownFilesRecursively(folder: TFolder): TFile[] {
		let files: TFile[] = [];

		for (const child of folder.children) {
			if (child instanceof TFile && child.extension === 'md') {
				files.push(child);
			} else if (child instanceof TFolder) {
				files = files.concat(this.getMarkdownFilesRecursively(child));
			}
		}

		return files;
	}
}
