/**
 * Shared genre values used by every library category.
 * Keep these values in sync with the `genres` frontmatter property.
 */
export const GENRES = [
	'Action',
	'Adventure',
	'Comedy',
	'Crime',
	'Drama',
	'Documentary',
	'Fantasy',
	'Historical',
	'Horror',
	'Mystery',
	'Romance',
	'Science Fiction',
	'Thriller',
	'Psychological',
	'Supernatural',
	'War',
	'Sports',
	'Musical',
	'Slice of Life',
	'Western',
] as const;

export type Genre = (typeof GENRES)[number];
