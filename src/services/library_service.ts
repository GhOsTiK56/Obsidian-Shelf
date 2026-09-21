import { Vault } from 'obsidian';
import { MediaType } from '../common';
import { MediaItem } from '../entities/media_item';
import { DEFAULT_SETTINGS, PluginSettings } from '../views/settings_tab';
import { LibraryRepository } from '../repositories/library_repository';
import { PosterResolver } from '../infrastructure/poster_resolver';

export interface ShelfCardModel {
	item: MediaItem;
	posterPath: string;
}

export class LibraryService {
	private readonly getSettings: () => PluginSettings;

	public constructor(
		private readonly libraryRepository: LibraryRepository,
		private readonly posterResolver: PosterResolver,
		private readonly vault: Vault,
		getSettings: () => PluginSettings,
	) {
		this.getSettings = getSettings;
	}

	public async getShelfCards(category: MediaType): Promise<ShelfCardModel[]> {
		const folderPath = this.getFolderByCategory(category);
		const items = await this.getAllMediaItems(folderPath);

		const cards: ShelfCardModel[] = [];

		for (const item of items) {
			const posterFile = this.posterResolver.resolve(item);

			if (posterFile) {
				cards.push({
					item,
					posterPath: this.vault.getResourcePath(posterFile),
				});
			}
		}

		return cards;
	}

	public async getAllMediaItems(inputFolder: string): Promise<MediaItem[]> {
		return await this.libraryRepository.getAll(inputFolder);
	}

	public getFolderByCategory(category: MediaType): string {
		const settings = this.getSettings();

		switch (category) {
			case MediaType.BOOK:
				return settings.BooksPath || DEFAULT_SETTINGS.BooksPath;

			case MediaType.MOVIE:
				return settings.MoviesPath || DEFAULT_SETTINGS.MoviesPath;

			case MediaType.TV_SERIES:
				return settings.TV_SeriesPath || DEFAULT_SETTINGS.TV_SeriesPath;

			case MediaType.ANIME:
				return settings.AnimePath || DEFAULT_SETTINGS.AnimePath;

			case MediaType.MANGA:
				return settings.MangaPath || DEFAULT_SETTINGS.MangaPath;
		}
	}
}
