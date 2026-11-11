import { MediaType, Status } from '../enums';

export type MediaItemProps = {
	author?: string;
	genres?: string[];
	poster?: string;
	rating?: number;
	status: Status;
	tags?: string[];
	title: string;
	type?: MediaType;
	year?: number;
	path: string;
};
