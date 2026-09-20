import { MetadataCache, TFile, TFolder, Vault } from 'obsidian';
import { MetadataMapper } from './metadataMapper';
import { MediaItem } from '../../domain/entities/mediaItem';
import { LibraryRepository } from '../../domain/repositories/libraryRepository';
import { LibraryFilter } from '../../domain/dto/libraryFilter';

export class ObsidianLibraryRepository implements LibraryRepository {
	private readonly vault: Vault;
	private readonly metadataCache: MetadataCache;

	public constructor(vault: Vault, metadataCache: MetadataCache) {
		this.vault = vault;
		this.metadataCache = metadataCache;
	}
	async getAll(filter: LibraryFilter): Promise<MediaItem[]> {
		if (!filter.folder) return [];

		const folder = this.vault.getAbstractFileByPath(filter.folder);

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

	refresh(): Promise<void> {
		throw new Error('Method not implemented.');
	}
}
