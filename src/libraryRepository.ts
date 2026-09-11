import { App } from 'obsidian';
import { MediaItem } from './mediaItem';

export class LibraryRepository {
	public constructor(app: App) {
		this.app = app;
	}

	private readonly app: App;

	public getLibrary(): MediaItem[] {
		const files = this.app.vault.getMarkdownFiles();

		const result: MediaItem[] = [];

		for (const file of files) {
			const fileCache = this.app.metadataCache.getFileCache(file);

			const mediaItem = MediaItem.fromFrontmatter(fileCache?.frontmatter, file);

			result.push(mediaItem);
		}

		return result;
	}
}
