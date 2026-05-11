import {Plugin, MenuItem, TAbstractFile, TFolder, TFile} from 'obsidian';
import {DEFAULT_SETTINGS, DateSorterPluginSettings, SettingTab} from "./settings";
import TemplateModule from 'template-module'
import { SelectTemplateModal } from 'select-template-modal';

type FoldderList = Record<string, string>;

export default class DateSorterPlugin extends Plugin {
	private	data: Record<string, DateSorterPluginSettings | FoldderList>;
	private templateModule: TemplateModule;

	public get settings(): DateSorterPluginSettings {
		return this.data.settings as DateSorterPluginSettings;
	}

	private get folderList(): FoldderList {
		return this.data.folderList as FoldderList;
	}

	private set folderList(newValue: FoldderList) {
		this.data.folderList = newValue;
	}

	async onload() {
		await this.loadPluginData();
		
		this.templateModule = new TemplateModule(this.folderList);

		if (this.settings.showContextMenuOptions)
			this.setupContextMenu();

		this.setupEvents();

		this.addSettingTab(new SettingTab(this.app, this));
	}

	private async loadPluginData() {
		const data 	= await this.loadData();
		this.data 	= Object.assign({ settings: { ...DEFAULT_SETTINGS } }, data);

		if (!this.folderList)
			this.folderList = {};
	}

	public async savePluginData() {
		await this.saveData(this.data);
	}

	public setupContextMenu() {
		this.registerEvent(			
			this.app.workspace.on('file-menu', this.onFileMenuShow, this)
		);
	}

	public unsetupContextMenu() {
		this.app.workspace.off('file-menu', this.onFileMenuShow)
	}

	private setupEvents() {
		this.registerEvent(
			this.app.metadataCache.on('resolved', this.onFirstLoad, this)
		);

		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				if (file instanceof TFolder)
					this.onExcludeFolderClick(file.path);
			}),
		);

		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFolder)
					this.onFolderRename(oldPath, file.path);
			}),
		);
	}

	private onFileMenuShow(menu: any, file: TAbstractFile) {
		if (!(file instanceof TFolder))
			return;

		if (this.folderList[file.path] == null) {
			const includeFolderMenuItem = (item: MenuItem) => {
				item.setTitle('Прикрепить шаблон');
				item.setIcon('calendar-plus');

				item.onClick(() => this.onIncludeFolderClick(file.path));	
			};

			menu.addItem(includeFolderMenuItem);				
		}
		else {
			const excludeFolderMenuItem = (item: MenuItem) => {
				item.setTitle('Открепить шаблон');
				item.setIcon('calendar-minus');

				item.onClick(() => this.onExcludeFolderClick(file.path));	
			};

			menu.addItem(excludeFolderMenuItem);
		}
	}

	private onIncludeFolderClick(folderPath: string) {
		new SelectTemplateModal(this.app, templatePath => {
			this.folderList[folderPath] = templatePath;

			this.savePluginData();
		}).open();
	}

	private onExcludeFolderClick(folderPath: string) {
		delete this.folderList[folderPath];

		this.savePluginData();
	}

	private onFolderRename(oldPath: string, newPath: string) {
		const value = this.folderList[oldPath] as string;

		delete this.folderList[oldPath];

		this.folderList[newPath] = value;

		this.savePluginData();
	}

	private onFirstLoad() {
		this.registerEvent(
			this.app.vault.on('create', file => {
				if (file instanceof TFile)
					this.onFileCreate(file);
			}),
		);
		
		this.app.metadataCache.off('resolved', this.onFirstLoad);
	}

	private onFileCreate(file: TFile) {
		this.templateModule.process(file);
	}
}
