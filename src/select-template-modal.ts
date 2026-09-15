import { App, FuzzySuggestModal } from "obsidian";
import { SEARCH_PLACEHOLDER } from "strings";

export class SelectTemplateModal extends FuzzySuggestModal<string> {
	onTemplateSelected: (str: string) => void;

    constructor(app: App, onTemplateSelected: (str: string) => void) {
        super(app);

		this.onTemplateSelected = onTemplateSelected;
		this.setPlaceholder(SEARCH_PLACEHOLDER);
    }

	getItems(): string[] {
		const files = this.app.vault.getMarkdownFiles();
		
        return files.map(file => file.path);
	}

	getItemText(item: string): string {
		return item;
	}

	onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
		this.onTemplateSelected(item);
	}
}