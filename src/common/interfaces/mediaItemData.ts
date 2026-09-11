import { Status } from '../enums';

export interface MediaItemData {
	author?: string;
	poster?: string;
	rating?: number;
	status: Status;
	tags?: string[];
	title: string;
	type?: string;
	year?: number;
}
