import { App, FuzzySuggestModal } from "obsidian";

export class SelectTemplateModal extends FuzzySuggestModal<string> {
	onTemplateSelected: (str: string) => void;

    constructor(app: App, onTemplateSelected: (str: string) => void) {
        super(app);

		this.onTemplateSelected = onTemplateSelected;
		this.setPlaceholder("Введите имя шаблона...");
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