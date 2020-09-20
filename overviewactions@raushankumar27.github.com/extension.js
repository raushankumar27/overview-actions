/* This extension is a derived work of the Gnome Shell.
*
* Copyright (c) 2013 Paolo Tranquilli
*
* This extension is free software; you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation; either version 2 of the License, or
* (at your option) any later version.
*
* This extension is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this extension; if not, write to the Free Software
* Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
*/

const REARRANGE_DELAY = 'rearrange-delay';


const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const Workspace = imports.ui.workspace
const WindowPreview = imports.ui.windowPreview.WindowPreview
const Mainloop = imports.mainloop;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();

const Init = new Lang.Class({
	Name: 'OverviewActions.Init',

	_init: function () {
		this._oldActivate = WindowPreview.prototype._activate;
		this._oldDoRemoveWindow = Workspace.Workspace.prototype._doRemoveWindow;
		this._oldAddWindowClone = Workspace.Workspace.prototype._addWindowClone;
	},



	enable: function() {
		// I'll go with a closure, not sure how to do it otherwise
		let init = this;

		// my handling logic
		const onClicked = function(action, actor) {
			this._selected = true;
			if (action.get_button() == 2) {//middle click
				this.metaWindow.delete(global.get_current_time());
			}
			else if(action.get_button() == 3){ // right click

				let mWin = this.metaWindow,
					workspaceNr = mWin.get_workspace().index() + 1,
					n_workspaces = global.workspace_manager.n_workspaces;
	
				log("rcd","nr", workspaceNr, "n_workspaces", n_workspaces);
	
				// cycle
				if(workspaceNr == n_workspaces) // cycle
					workspaceNr = 0;
				
				mWin.change_workspace_by_index(workspaceNr, false);
	
				if(settings.get_boolean(Prefs.SETTING_OVERLAY_CLOSE)){
					this._selected = true; // cancel d'n'd event
					Main.overview.toggle();
				}
	
			}
			 else {
				init._oldActivate.apply(this);
			}
		};

		// override _addWindowClone to add my event handler
		Workspace.Workspace.prototype._addWindowClone = function(metaWindow) {
			let clone = init._oldAddWindowClone.apply(this, [metaWindow]);
			clone.get_actions()[0].connect('clicked', onClicked.bind(clone));
			return clone;
		}

		// override WindowClone's _activate
		WindowPreview.prototype._activate = () => {};

	},

	disable: function() {
		WindowPreview.prototype._activate = this._oldActivate;
		Workspace.Workspace.prototype._doRemoveWindow = this._oldDoRemoveWindow;
		Workspace.Workspace.prototype._addWindowClone = this._oldAddWindowClone;
	}
});

function init() {
	return new Init();
}
