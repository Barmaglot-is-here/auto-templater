import { Events } from "obsidian";
import { DateSorterPluginSettings, DEFAULT_SETTINGS } from "settings";

export type FolderList = Record<string, string>;

export interface PluginDataState {
	settings: DateSorterPluginSettings;
	folderList: FolderList;
}

export default class PluginData extends Events {
    private _settings: DateSorterPluginSettings;
    private _folderList: FolderList;
    
	public get settings(): Readonly<DateSorterPluginSettings> {
		return this._settings;
	}

	public get folderList(): FolderList {
		return this._folderList;
	}

	constructor(data?: Partial<PluginDataState>) {
		super();

		this._settings = {
			...DEFAULT_SETTINGS,
			...data?.settings
		};

		this._folderList = {
			...data?.folderList
		};
	}

    public showContextMenuOptions(state: boolean) {
		this._settings.showContextMenuOptions = state;

        this.trigger('show-context-menu-change', {
			state
		});
    }

    public includeFolder(path: string, templatePath: string) {
        this._folderList[path] = templatePath;

        this.trigger('folder-change', {
			type: 'include',
			path,
			templatePath
		});
    }

    public excludeFolder(path: string) {
        delete this._folderList[path];

        this.trigger('folder-change', {
			type: 'exclude',
			path
		});
    }
}