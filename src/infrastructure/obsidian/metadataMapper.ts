import { FrontMatterCache, TFile } from 'obsidian';
import {
	MediaItem,
	MediaItemProps,
	MediaType,
	Status,
} from '../../domain/entities/mediaItem';

export class MetadataMapper {
	static mapMetadata(
		frontmatter: FrontMatterCache | undefined,
		file: TFile,
	): MediaItem {
		const props: MediaItemProps = {
			title: this.parseString(frontmatter?.['title']) ?? file.basename,
			status: this.parseStatus(frontmatter?.['status']),
			author: this.parseString(frontmatter?.['author']),
			poster: this.parseString(frontmatter?.['poster']),
			type: this.parseType(frontmatter?.['type']),
			rating: this.parseNumber(frontmatter?.['rating']),
			year: this.parseNumber(frontmatter?.['year']),
			tags: this.parseStringArray(frontmatter?.['tags']),
			path: file.path,
		};

		return new MediaItem(props);
	}

	private static parseString(value: unknown): string | undefined {
		return typeof value === 'string' ? value : undefined;
	}

	static parseNumber(value: unknown): number | undefined {
		return typeof value === 'number' && !isNaN(value) ? value : undefined;
	}

	private static parseStatus(
		value: unknown,
		fallback: Status = Status.PLANNED,
	): Status {
		if (
			typeof value === 'string' &&
			Object.values(Status).includes(value as Status)
		) {
			return value as Status;
		}
		return fallback;
	}

	private static parseType(value: unknown): MediaType | undefined {
		if (
			typeof value === 'string' &&
			Object.values(MediaType).includes(value as MediaType)
		) {
			return value as MediaType;
		}

		return undefined;
	}

	private static parseStringArray(value: unknown): string[] | undefined {
		if (Array.isArray(value)) {
			return value.filter((item): item is string => typeof item === 'string');
		}
		if (typeof value === 'string') {
			return [value];
		}
		return undefined;
	}
}
