import { LibraryFilter } from '../dto/libraryFilter';
import { MediaItem } from '../entities/mediaItem';

export interface LibraryRepository {
	getAll(folder: LibraryFilter): Promise<MediaItem[]>;
	getByPath(): Promise<MediaItem>;
	refresh(): Promise<void>;
}
