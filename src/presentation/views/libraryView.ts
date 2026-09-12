import { ItemView, WorkspaceLeaf } from 'obsidian';
import { LoadLibrary } from '../../application/use-cases/loadLibrary';
import { LibraryFilter } from '../../application/dto/libraryFilter';

export const LIBRARY_VIEW = 'library-view';

export class LibraryView extends ItemView {
	private loadLibraryUseCase: LoadLibrary;

	public constructor(leaf: WorkspaceLeaf, loadLibraryUseCase: LoadLibrary) {
		super(leaf);
		this.loadLibraryUseCase = loadLibraryUseCase;
	}

	public getViewType() {
		return LIBRARY_VIEW;
	}

	public getDisplayText() {
		return 'Example value on the top';
	}

	public async onOpen() {
		const container = this.contentEl;
		container.empty();
		container.addClass('container');

    const filterParams = new LibraryFilter();
    filterParams.folder = 'Cards/Books'

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
