import { ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings } from './settings_tab';
import { MediaItem } from '../entities/media_item';
import { LibraryRepository } from '../infrastructure/library_repository';
import { PosterResolver } from '../infrastructure/poster_resolver';

export const LIBRARY_VIEW = 'library-view';

export class LibraryView extends ItemView {
	private readonly libraryRepository: LibraryRepository;
	private readonly getSettings: () => PluginSettings;
	private readonly posterResolver: PosterResolver;

	public constructor(
		leaf: WorkspaceLeaf,
		libraryRepository: LibraryRepository,
		getSettings: () => PluginSettings,
		posterResolver: PosterResolver,
	) {
		super(leaf);
		this.libraryRepository = libraryRepository;
		this.getSettings = getSettings;
		this.posterResolver = posterResolver;
	}

	public getViewType() {
		return LIBRARY_VIEW;
	}

	public getDisplayText() {
		return 'Obsidian shelf';
	}

	public async onOpen() {
		const container = this.contentEl;
		container.empty();
		container.addClass('container');

		const settings = this.getSettings();

		const folderFilter = settings.TV_SeriesPath?.trim()
			? settings.TV_SeriesPath
			: DEFAULT_SETTINGS.TV_SeriesPath;

		const mediaItems = await this.libraryRepository.getAll(folderFilter);

		for (const mediaItem of mediaItems) {
			this.createCard(container, mediaItem);
		}
	}

	private createCard(container: HTMLElement, item: MediaItem): void {
		const poster = this.posterResolver.resolve(item);

		if (!poster) return;

		const img = container.createEl('img', {
			cls: 'card',
		});

		img.src = this.app.vault.getResourcePath(poster);
		img.loading = 'lazy';

		img.addEventListener('click', () => {
			void this.openFile(item.path);
		});
	}

	private async openFile(path: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(path);

		if (!(file instanceof TFile)) {
			return;
		}

		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(file);
	}

	public async onClose() {}
}
