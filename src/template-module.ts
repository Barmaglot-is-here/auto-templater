import { TFile } from "obsidian";

type FoldderList = Record<string, string>;

export default class TemplateModule {
    private folderList: FoldderList;

    constructor(folderList: FoldderList) {
        this.folderList = folderList;
    }

    public async process(file: TFile) {
        const template = await this.getTemplate(file);

        if (template != null)
            file.vault.modify(file, template);
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

        if (templateFile == null)
            return null;

        return vault.read(templateFile);
    }
}