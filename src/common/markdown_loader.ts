import { App, parseFrontMatterEntry } from 'obsidian';
import { RawFileData } from './media_item';

export class MarkdownLoader {
	private app: App;

	public constructor(app: App) {
		this.app = app;
	}

	public getParsedFiles(shelfName: string): RawFileData[] {
		const targetFolders = [shelfName];

		const files = this.app.vault
			.getMarkdownFiles()
			.filter((file) =>
				targetFolders.some((folder) => file.path.startsWith(folder + '/')),
			);

		const parsedFiles: RawFileData[] = [];

		for (const file of files) {
			const cache = this.app.metadataCache.getFileCache(file);

			if (!cache || !cache.frontmatter) {
				parsedFiles.push({
					title: file.basename,
					type: 'unknown',
					status: 'unknown',
					poster: 'unknown',
					year: 0,
					tags: [],
					file: file,
				});
				continue;
			}

			// Безопасное извлечение тегов из frontmatter
			const rawTags = parseFrontMatterEntry(
				cache.frontmatter,
				'tags',
			) as unknown;
			let tags: string[] = [];

			if (Array.isArray(rawTags)) {
				tags = rawTags.map((t) => String(t));
			} else if (typeof rawTags === 'string') {
				tags = rawTags.split(',').map((t) => t.trim());
			}

			const fileData: RawFileData = {
				title:
					(parseFrontMatterEntry(cache.frontmatter, 'title') as string) ||
					file.basename,
				type:
					(parseFrontMatterEntry(cache.frontmatter, 'type') as string) ||
					'unknown',
				status:
					(parseFrontMatterEntry(cache.frontmatter, 'status') as string) ||
					'unknown',
				poster:
					(parseFrontMatterEntry(cache.frontmatter, 'poster') as string) ||
					'unknown',
				year: (parseFrontMatterEntry(cache.frontmatter, 'year') as number) || 0,
				tags: tags,
				file: file,
			};

			parsedFiles.push(fileData);
		}

		return parsedFiles;
	}
}
