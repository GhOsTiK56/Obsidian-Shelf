import { MediaItem } from '../../domain/entities/mediaItem';
import { LibraryRepository } from '../../domain/repositories/libraryRepository';
import { LibraryFilter } from '../dto/libraryFilter';

export class LoadLibrary {
	constructor(private libraryRepository: LibraryRepository) {}

	async execute(filter: LibraryFilter): Promise<MediaItem[]> {
		return await this.libraryRepository.getAll(filter);
	}
}
