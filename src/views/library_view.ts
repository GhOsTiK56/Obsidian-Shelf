import { ItemView, TFile, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings } from './settings_tab';
import { MediaItem } from '../entities/media_item';
import { LibraryRepository } from '../infrastructure/library_repository';

export const LIBRARY_VIEW = 'library-view';

export class LibraryView extends ItemView {
	private libraryRepository: LibraryRepository;
	private getSettings: () => PluginSettings;

	public constructor(
		leaf: WorkspaceLeaf,
		libraryRepository: LibraryRepository,
		getSettings: () => PluginSettings,
	) {
		super(leaf);
		this.libraryRepository = libraryRepository;
		this.getSettings = getSettings;
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

		const folderFilter = settings.BooksPath?.trim()
			? settings.BooksPath
			: DEFAULT_SETTINGS.BooksPath;

		const mediaItems = await this.libraryRepository.getAll(folderFilter);

		for (const mediaItem of mediaItems)
			if (mediaItem.poster) this.createCard(container, mediaItem);
	}

	private createCard(
		container: HTMLElement,
		item: MediaItem,
	): HTMLImageElement {
		const img = container.createEl('img', {
			cls: 'card',
			attr: { src: item.poster!, loading: 'lazy' },
		});

		img.addEventListener('click', () => {
			void this.openFile(item.path);
		});

		return img;
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
