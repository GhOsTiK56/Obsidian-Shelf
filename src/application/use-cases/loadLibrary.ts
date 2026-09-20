import { MediaItem } from '../../domain/entities/mediaItem';
import { LibraryRepository } from '../../domain/repositories/libraryRepository';
import { LibraryFilter } from '../dto/libraryFilter';

export class LoadLibrary {
	public constructor(private readonly libraryRepository: LibraryRepository) {}

	public async execute(filter: LibraryFilter): Promise<MediaItem[]> {
		return await this.libraryRepository.getAll(filter);
	}
}
