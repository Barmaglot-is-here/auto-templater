import {App, PluginSettingTab, setIcon, Setting} from "obsidian";
import DateSorterPlugin from "./main";
import { EDIT_MODE, EDIT_MODE_DESCR } from "strings";
import PluginData from "plugin-data";

export interface DateSorterPluginSettings {
	showContextMenuOptions: boolean;
}

export const DEFAULT_SETTINGS: DateSorterPluginSettings = {
	showContextMenuOptions: true,
}

export class SettingTab extends PluginSettingTab {
	private pluginData: PluginData;

	constructor(app: App, plugin: DateSorterPlugin) {
		super(app, plugin);

		this.pluginData = plugin.data;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		this.showMainSettings(containerEl);
		this.showFolderList(containerEl);
	}

	showMainSettings(containerEl: HTMLElement) : void{
		new Setting(containerEl)
			.setName(EDIT_MODE)
			.setDesc(EDIT_MODE_DESCR)
			.addToggle(toggle => toggle
				.setValue(this.pluginData.settings.showContextMenuOptions)
				.onChange(value => {
					this.pluginData.showContextMenuOptions(value);
				}));
	}

	showFolderList(containerEl: HTMLElement) :void {
		const folderList = this.pluginData.folderList;

		const section = containerEl.createDiv({
			cls: 'date-sorter-template-list'
		});

		new Setting(section).setName("Привязанные шаблоны").setHeading();

		const list = section.createDiv({
			cls: 'date-sorter-template-list-items'
		});

		Object.entries(folderList).forEach(([folderPath, templatePath]) => {
			const item = list.createDiv({
				cls: 'date-sorter-template-list-item'
			});

			const info = item.createDiv({
				cls: 'date-sorter-template-list-item-info'
			});

			info.createDiv({
				cls: 'date-sorter-template-list-folder',
				text: folderPath
			});

			info.createDiv({
				cls: 'date-sorter-template-list-template',
				text: templatePath
			});

			const deleteButton = item.createEl('button', {
				cls: 'date-sorter-template-list-delete'
			});

			deleteButton.setAttribute('aria-label', 'Удалить');
			setIcon(deleteButton, 'trash-2');

			deleteButton.addEventListener('click', () => {
				this.pluginData.excludeFolder(folderPath);

				item.remove();
			});
		});
	}
}
