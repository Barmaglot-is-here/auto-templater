import {App, PluginSettingTab, SearchComponent, Setting} from "obsidian";
import DateSorterPlugin from "./main";

export interface DateSorterPluginSettings {
	showContextMenuOptions: boolean;
}

export const DEFAULT_SETTINGS: DateSorterPluginSettings = {
	showContextMenuOptions: true,
}

export class SettingTab extends PluginSettingTab {
	private plugin: DateSorterPlugin;

	constructor(app: App, plugin: DateSorterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		
		new Setting(containerEl)
			.setName('Режим редактирования')
			.setDesc('Отображать опции плагина в контекстном меню')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showContextMenuOptions)
				.onChange(value => {
					this.plugin.settings.showContextMenuOptions = value;
					this.plugin.savePluginData();

					if (value)
						this.plugin.setupContextMenu();
					else
						this.plugin.unsetupContextMenu();
				}));
	}
}
