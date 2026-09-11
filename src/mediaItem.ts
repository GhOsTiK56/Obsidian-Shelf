import { FrontMatterCache, TFile } from 'obsidian';
import { Status } from './common/enums';
import { MediaItemData } from './common/interfaces';

export class MediaItem implements MediaItemData {
	author?: string;
	poster?: string;
	rating?: number;
	status: Status;
	tags?: string[];
	title: string;
	type?: string;
	year?: number;
	file: TFile;

	constructor(data: MediaItemData, file: TFile) {
		this.author = data.author;
		this.poster = data.poster;
		this.rating = data.rating;
		this.status = data.status;
		this.tags = data.tags;
		this.title = data.title;
		this.type = data.type;
		this.year = data.year;
		this.file = file;
	}

	static fromFrontmatter(
		frontmatter: FrontMatterCache | undefined,
		file: TFile,
	): MediaItem {
		const data: MediaItemData = {
			title: this.parseString(frontmatter?.['title']) ?? file.basename,
			status: this.parseStatus(frontmatter?.['status']),
			author: this.parseString(frontmatter?.['author']),
			poster: this.parseString(frontmatter?.['poster']),
			type: this.parseString(frontmatter?.['type']),
			rating: this.parseNumber(frontmatter?.['rating']),
			year: this.parseNumber(frontmatter?.['year']),
			tags: this.parseStringArray(frontmatter?.['tags']),
		};

		return new MediaItem(data, file);
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
