import { Vault } from 'obsidian';
import { MediaType, SortOption, Status } from '../common';
import { MediaItem } from '../entities/media_item';
import { DEFAULT_SETTINGS, PluginSettings } from '../views/settings_tab';
import { LibraryRepository } from '../repositories/library_repository';
import { PosterResolver } from '../infrastructure/poster_resolver';

export interface ShelfCardModel {
	item: MediaItem;
	posterPath: string;
}

interface TagGroup {
	tags: string[];
	cards: ShelfCardModel[];
	firstIndex: number;
}

interface SortUnit {
	cards: ShelfCardModel[];
	sortTitle: string;
	isTagged: boolean;
	tagsKey: string;
	firstIndex: number;
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
		statusFilter: Status | 'all' = 'all',
		searchQuery: string = '',
		genreFilters: readonly string[] = [],
	): Promise<ShelfCardModel[]> {
		const folderPath = this.getFolderByCategory(category);
		const items = await this.getAllMediaItems(folderPath);

		const cards: ShelfCardModel[] = [];
		const normalizedQuery = searchQuery.toLowerCase().trim();
		const normalizedGenreFilters = new Set(
			genreFilters
				.map((genre) => genre.trim().toLowerCase())
				.filter((genre) => genre.length > 0),
		);

		for (const item of items) {
			if (statusFilter !== 'all' && item.status !== statusFilter) {
				continue;
			}

			if (normalizedGenreFilters.size > 0) {
				const matchesGenre =
					item.genres?.some((genre) =>
						normalizedGenreFilters.has(genre.trim().toLowerCase()),
					) ?? false;

				if (!matchesGenre) {
					continue;
				}
			}

			if (normalizedQuery) {
				const matchesTitle = item.title.toLowerCase().includes(normalizedQuery);
				const matchesTags =
					item.tags?.some((tag) =>
						tag.toLowerCase().includes(normalizedQuery),
					) ?? false;

				if (!matchesTitle && !matchesTags) {
					continue;
				}
			}

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
		switch (sortBy) {
			case SortOption.TAGS_TITLE:
				return this.sortCardsByTagsAndTitle(cards);

			case SortOption.TITLE_ASC:
				return cards.sort((a, b) => a.item.title.localeCompare(b.item.title));

			case SortOption.TITLE_DESC:
				return cards.sort((a, b) => b.item.title.localeCompare(a.item.title));

			case SortOption.RATING_DESC:
				return cards.sort(
					(a, b) => (b.item.rating ?? 0) - (a.item.rating ?? 0),
				);

			case SortOption.YEAR_DESC:
				return cards.sort((a, b) => (b.item.year ?? 0) - (a.item.year ?? 0));

			default:
				return cards;
		}
	}

	/**
	 * Sorts untagged cards and tagged groups together alphabetically.
	 *
	 * Untagged cards are individual sorting units.
	 * Cards with identical tag arrays are kept together.
	 * Groups are positioned alphabetically by their earliest title.
	 * Cards inside each group are sorted by year, oldest first.
	 */
	private sortCardsByTagsAndTitle(cards: ShelfCardModel[]): ShelfCardModel[] {
		const tagGroups = new Map<string, TagGroup>();
		const sortUnits: SortUnit[] = [];

		// Separate untagged cards and collect tagged groups.
		for (let index = 0; index < cards.length; index++) {
			const card = cards[index];

			if (!card) {
				continue;
			}

			const tags = (card.item.tags ?? [])
				.map((tag) => tag.trim())
				.filter((tag) => tag.length > 0);

			// Cards without tags remain independent sorting units.
			if (tags.length === 0) {
				sortUnits.push({
					cards: [card],
					sortTitle: card.item.title,
					isTagged: false,
					tagsKey: '',
					firstIndex: index,
				});

				continue;
			}

			// Cards with identical tag arrays belong to the same group.
			const tagsKey = JSON.stringify(tags);

			let group = tagGroups.get(tagsKey);

			if (!group) {
				group = {
					tags,
					cards: [],
					firstIndex: index,
				};

				tagGroups.set(tagsKey, group);
			}

			group.cards.push(card);
		}

		// Convert each tag group into a sorting unit.
		for (const [tagsKey, group] of tagGroups) {
			// Sort cards inside the group by release year:
			// oldest first, newest last.
			group.cards.sort((a, b) => {
				const yearA = a.item.year;
				const yearB = b.item.year;

				// Cards without a year go to the end.
				if (yearA === undefined && yearB !== undefined) {
					return 1;
				}

				if (yearA !== undefined && yearB === undefined) {
					return -1;
				}

				// Primary sorting: year ascending.
				if (yearA !== undefined && yearB !== undefined && yearA !== yearB) {
					return yearA - yearB;
				}

				// Secondary sorting: alphabetical title.
				return this.compareTitles(a.item.title, b.item.title);
			});

			// Use the title of the oldest card as the group's sorting position.
			// Cards have already been sorted by year (oldest first).
			const sortTitle = group.cards[0]?.item.title ?? '';

			sortUnits.push({
				cards: group.cards,
				sortTitle,
				isTagged: true,
				tagsKey,
				firstIndex: group.firstIndex,
			});
		}

		// Sort all units together alphabetically.
		sortUnits.sort((a, b) => {
			const titleComparison = this.compareTitles(a.sortTitle, b.sortTitle);

			if (titleComparison !== 0) {
				return titleComparison;
			}

			// Untagged cards come before tagged groups
			// when their sorting titles are identical.
			if (a.isTagged !== b.isTagged) {
				return a.isTagged ? 1 : -1;
			}

			// Compare tag arrays when group titles are identical.
			if (a.isTagged && b.isTagged) {
				const tagsComparison = a.tagsKey.localeCompare(b.tagsKey, undefined, {
					sensitivity: 'base',
					numeric: true,
				});

				if (tagsComparison !== 0) {
					return tagsComparison;
				}
			}

			return a.firstIndex - b.firstIndex;
		});

		// Restore the card list by flattening the sorted units.
		return sortUnits.flatMap((unit) => unit.cards);
	}

	/**
	 * Case-insensitive natural alphabetical comparison.
	 */
	private compareTitles(a: string, b: string): number {
		return a.localeCompare(b, undefined, {
			sensitivity: 'base',
			numeric: true,
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
