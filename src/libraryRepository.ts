import { MetadataCache, Vault } from 'obsidian';
import { MediaItem } from './mediaItem';

export class LibraryRepository {
	public constructor(vault: Vault, metadataCache: MetadataCache) {
		this.vault = vault;
		this.metadataCache = metadataCache;
	}

	private readonly vault: Vault;
	private readonly metadataCache: MetadataCache;

	public getLibrary(): readonly MediaItem[] {
		const files = this.vault.getMarkdownFiles();

		const result: MediaItem[] = [];

		for (const file of files) {
			const fileCache = this.metadataCache.getFileCache(file);

			const mediaItem = MediaItem.fromFrontmatter(fileCache?.frontmatter, file);

			result.push(mediaItem);
		}

		return result;
	}
}
