import { Notice, TFile } from "obsidian";
import { FolderList } from "plugin-data";

export default class TemplateModule {
    private folderList: FolderList;

    constructor(folderList: FolderList) {
        this.folderList = folderList;
    }

    public async process(file: TFile) {
        const template = await this.getTemplate(file);

        if (template == null)
            return;

        await file.vault.process(file, content => {
            if (content.length === 0)
                return template;

            if (!content.endsWith('\n'))
                content += '\n';

            return content + '\n' + template;
        });
    }

    private async getTemplate(file: TFile): Promise<string | null> {
        const parentPath = file.parent?.path;

        if (parentPath == undefined)
            return null;

        const templatePath = this.folderList[parentPath];

        if (templatePath == null)
            return null;

        const vault = file.vault;
        const templateFile = vault.getFileByPath(templatePath);

        if (templateFile == null) {
            new Notice("Шаблон не найден");

            return null;
        }

        return vault.read(templateFile);
    }
}