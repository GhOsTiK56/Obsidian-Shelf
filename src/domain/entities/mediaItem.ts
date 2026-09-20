export type MediaItemProps = {
	author?: string;
	poster?: string;
	rating?: number;
	status: Status;
	tags?: string[];
	title: string;
	type?: MediaType;
	year?: number;
	path: string;
};

export enum MediaType {
	BOOK = 'book',
	MOVIE = 'movie',
	TV_SERIES = 'tv_series',
	ANIME = 'anime',
	MANGA = 'manga',
}

export enum Status {
	PLANNED = 'planned',
	COMPLETED = 'completed',
}

export class MediaItem {
	author?: string;
	poster?: string;
	rating?: number;
	status: Status;
	tags?: string[];
	title: string;
	type?: MediaType;
	year?: number;
	path: string;

	constructor(props: MediaItemProps) {
		this.author = props.author;
		this.poster = props.poster;
		this.rating = props.rating;
		this.status = props.status;
		this.tags = props.tags;
		this.title = props.title;
		this.type = props.type;
		this.year = props.year;
		this.path = props.path;
	}
}
