import { ItemView, WorkspaceLeaf } from 'obsidian';
import { LibraryRepository } from './libraryRepository';

export const LIBRARY_VIEW = 'library-view';

export class LibraryView extends ItemView {
	public constructor(
		leaf: WorkspaceLeaf,
		private readonly libraryRepository: LibraryRepository,
	) {
		super(leaf);
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

		const mediaItems = this.libraryRepository.getLibrary();

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
