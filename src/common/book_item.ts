import { MediaItem, RawFileData } from './media_item';

export class BookItem extends MediaItem {
	constructor(data: RawFileData) {
		super(data);
	}
}
