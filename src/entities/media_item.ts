import { type MediaItemProps, MediaType, Status } from '../common';

export class MediaItem {
	author?: string;
	rating?: number;
	status: Status;
	tags?: string[];
	title: string;
	type?: MediaType;
	year?: number;
	path: string;

	constructor(props: MediaItemProps) {
		this.author = props.author;
		this.rating = props.rating;
		this.status = props.status;
		this.tags = props.tags;
		this.title = props.title;
		this.type = props.type;
		this.year = props.year;
		this.path = props.path;
	}
}
