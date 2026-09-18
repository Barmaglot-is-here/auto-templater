import {Plugin, MenuItem, TAbstractFile, TFolder, TFile, Notice, EventRef, Menu} from 'obsidian';
import {DateSorterPluginSettings, SettingTab} from "./settings";
import TemplateModule from 'template-module'
import { SelectTemplateModal } from 'select-template-modal';
import PluginData, { FolderList, PluginDataState } from 'plugin-data';

export default class DateSorterPlugin extends Plugin {
	public data!: PluginData;
	private templateModule!: TemplateModule;
	private fileMenuEventRef: EventRef | null = null;

	private get settings(): DateSorterPluginSettings {
		return this.data.settings;
	}

	private get folderList(): FolderList {
		return this.data.folderList;
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
		const data = await this.loadData() as Partial<PluginDataState> | undefined;

		this.data = new PluginData(data ?? {});
	}

	private async savePluginData() {
		await this.saveData({
			settings: this.settings,
			folderList: this.folderList
		});
	}

	private setupContextMenu() {
		if (this.fileMenuEventRef)
			return;

		this.registerEvent(
			this.fileMenuEventRef = this.app.workspace.on(
				'file-menu', 
				this.onFileMenuShow, 
				this)
		);
	}

	private unsetupContextMenu() {
		if (!this.fileMenuEventRef)
			return;

		this.app.workspace.off('file-menu', this.onFileMenuShow)

		this.fileMenuEventRef = null;
	}

	private setupEvents() {
		this.app.workspace.onLayoutReady(() => {
			this.registerEvent(
				this.app.vault.on('create', file => {
					if (file instanceof TFile) {
						void this.onFileCreate(file);
					}
				})
			);
		});

		this.registerEvent(
			this.app.vault.on('delete', (file) => {
				if (file instanceof TFolder)
					this.data.excludeFolder(file.path);
				else
					this.onFileDelete(file.path);
			}),
		);

		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFolder)
					this.onFolderRename(oldPath, file.path);
				else
					this.onFileRename(oldPath, file.path);
			}),
		);

		this.registerEvent(
			this.data.on('show-context-menu-change', state => {
				if (state) {
					this.setupContextMenu();
				}
				else {
					this.unsetupContextMenu();
				}
			},
			this)
		);

		this.registerEvent(
			this.data.on('folder-change', () => {
				void this.savePluginData();
			})
		);
	}

	private onFileMenuShow = (menu: unknown, file: TAbstractFile) => {
		if (!(file instanceof TFolder))
			return;

		const obsidianMenu = menu as Menu;

		if (this.folderList[file.path] == null) {
			const includeFolderMenuItem = (item: MenuItem) => {
				item.setTitle('Прикрепить шаблон');
				item.setIcon('calendar-plus');

				item.onClick(() => 
					new SelectTemplateModal(this.app, templatePath => {
						this.data.includeFolder(file.path, templatePath);
					}).open());
			};

			obsidianMenu.addItem(includeFolderMenuItem);
		}
		else {
			const excludeFolderMenuItem = (item: MenuItem) => {
				item.setTitle('Открепить шаблон');
				item.setIcon('calendar-minus');

				item.onClick(() => this.data.excludeFolder(file.path));
			};

			obsidianMenu.addItem(excludeFolderMenuItem);
		}
	}

	private onFolderRename(oldPath: string, newPath: string) {
		if (!(oldPath in this.folderList))
			return;

		const templatePath = this.folderList[oldPath] as string;

		delete this.folderList[oldPath];

		this.folderList[newPath] = templatePath;

		void this.savePluginData();
	}

	private onFileRename(oldPath: string, newPath: string) {
		if (!this.hasTemplate(oldPath))
			return;

		this.onTemplateRename(oldPath, newPath);
	}

	private onTemplateRename(oldPath: string, newPath: string) {
		Object.entries(this.folderList).forEach(([folderPath, templatePath]) => {
			if (templatePath == oldPath) {
				this.folderList[folderPath] = newPath;

				new Notice("Обновлён путь до шаблона: " + newPath);

				void this.savePluginData();
			}
		});
	}

	private onFileDelete(path: string) {
		if (!this.hasTemplate(path))
			return;

		this.onTemplateDelete(path);
	}

	private hasTemplate(path: string) : boolean {
		return Object.values(this.folderList).includes(path);
	} 

	private onTemplateDelete(path: string) {
		Object.entries(this.folderList).forEach(([folderPath, templatePath]) => {
			if (templatePath == path) {
				delete this.folderList[folderPath];

				new Notice("Шаблон откреплён от папки: " + path);
			}
		});

		void this.savePluginData();
	}

	private async onFileCreate(file: TFile) {
		if (file.extension !== 'md')
			return;

		try {
			await this.templateModule.process(file);
		} catch (error) {
			console.error(
				'Date Sorter: failed to process file',
				file.path,
				error
			);
		}
	}
}
