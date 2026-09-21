export enum SortOption {
  TAGS_YEAR = 'tags_year',
	TITLE_ASC = 'title_asc',
	TITLE_DESC = 'title_desc',
	RATING_DESC = 'rating_desc',
	YEAR_DESC = 'year_desc',
}

export interface SortOptionConfig {
	label: string;
	emoji: string;
}

export const SORT_OPTION_MAP: Record<SortOption, SortOptionConfig> = {
  [SortOption.TAGS_YEAR]: { label: 'Tags & Year (Default)', emoji: '🏷️' },
	[SortOption.RATING_DESC]: { label: 'Rating (High to Low)', emoji: '⭐' },
	[SortOption.YEAR_DESC]: { label: 'Year (Newest)', emoji: '📅' },
	[SortOption.TITLE_ASC]: { label: 'Title (A-Z)', emoji: '🔤' },
	[SortOption.TITLE_DESC]: { label: 'Title (Z-A)', emoji: '🔠' },
};
