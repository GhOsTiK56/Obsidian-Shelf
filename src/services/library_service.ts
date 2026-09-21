import { Vault } from 'obsidian';
import { MediaType, SortOption } from '../common';
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

	public async getShelfCards(
		category: MediaType,
		sortBy: SortOption,
	): Promise<ShelfCardModel[]> {
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

		return this.sortCards(cards, sortBy);
	}

	private sortCards(
		cards: ShelfCardModel[],
		sortBy: SortOption,
	): ShelfCardModel[] {
		return cards.sort((a, b) => {
			switch (sortBy) {
				case SortOption.TAGS_YEAR: {
					const tagsA = a.item.tags || [];
					const tagsB = b.item.tags || [];

					const maxLength = Math.max(tagsA.length, tagsB.length);

					for (let i = 0; i < maxLength; i++) {
						const tagA = tagsA[i] || '';
						const tagB = tagsB[i] || '';

						if (tagA !== tagB) {
							return tagA.localeCompare(tagB);
						}
					}

					const yearA = a.item.year ?? 0;
					const yearB = b.item.year ?? 0;

					return yearA - yearB;
				}

				case SortOption.TITLE_ASC:
					return a.item.title.localeCompare(b.item.title);

				case SortOption.TITLE_DESC:
					return b.item.title.localeCompare(a.item.title);

				case SortOption.RATING_DESC:
					return (b.item.rating ?? 0) - (a.item.rating ?? 0);

				case SortOption.YEAR_DESC:
					return (b.item.year ?? 0) - (a.item.year ?? 0);

				default:
					return 0;
			}
		});
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
