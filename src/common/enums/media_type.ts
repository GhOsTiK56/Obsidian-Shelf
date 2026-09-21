export enum MediaType {
	BOOK = 'book',
	MOVIE = 'movie',
	TV_SERIES = 'tv_series',
	ANIME = 'anime',
	MANGA = 'manga',
}

export interface MediaTypeConfig {
	label: string;
	emoji: string;
}

export const MEDIA_TYPE_MAP: Record<MediaType, MediaTypeConfig> = {
	[MediaType.BOOK]: { label: 'Books', emoji: '📚' },
	[MediaType.MOVIE]: { label: 'Movies', emoji: '🎬' },
	[MediaType.TV_SERIES]: { label: 'TV Series', emoji: '📺' },
	[MediaType.ANIME]: { label: 'Anime', emoji: '⛩️' },
	[MediaType.MANGA]: { label: 'Manga', emoji: '📖' },
};
