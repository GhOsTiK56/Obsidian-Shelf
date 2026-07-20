import { App, parseFrontMatterEntry } from 'obsidian';
import { RawFileData } from './media_item';

export class MarkdownLoader {
	private app: App;

	public constructor(app: App) {
		this.app = app;
	}

	public getParsedFiles() {
		const targetFolders = ['Ведьмак', 'Дерьмак'];

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
				});
				continue;
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
			};

			parsedFiles.push(fileData);
		}

		return parsedFiles;
	}
}
