import { ItemView, WorkspaceLeaf } from 'obsidian';
import { LoadLibrary } from '../../application/use-cases/loadLibrary';
import { LibraryFilter } from '../../application/dto/libraryFilter';
import { DEFAULT_SETTINGS, PluginSettings } from './SettingsTab';

export const LIBRARY_VIEW = 'library-view';

export class LibraryView extends ItemView {
	private loadLibraryUseCase: LoadLibrary;
	private getSettings: () => PluginSettings;

	public constructor(
		leaf: WorkspaceLeaf,
		loadLibraryUseCase: LoadLibrary,
		getSettings: () => PluginSettings,
	) {
		super(leaf);
		this.loadLibraryUseCase = loadLibraryUseCase;
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

		const filterParams = new LibraryFilter();

		filterParams.folder = settings.BooksPath?.trim()
			? settings.BooksPath
			: DEFAULT_SETTINGS.BooksPath;

		const mediaItems = await this.loadLibraryUseCase.execute(filterParams);

		for (const mediaItem of mediaItems)
			if (mediaItem.poster) this.createCard(container, mediaItem.poster);
	}

	private createCard(container: HTMLElement, poster: string): HTMLImageElement {
		return container.createEl('img', {
			cls: 'card-poster',
			attr: { src: poster, loading: 'lazy' },
		});
	}

	public async onClose() {}
}
