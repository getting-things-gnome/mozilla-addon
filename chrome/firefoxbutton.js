/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Izidor Matušov <izidor.matusov@gmail.com>
 */

var gtgtask_firefox = {
    /*
     * Find title and body of the new task in the webpage
     *
     * @return - array where 0 => title, 1-$ => body
     */
    fetchTask: function () {
        // select current page
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                            .getService(Components.interfaces.nsIWindowMediator);
        var mainWindow = wm.getMostRecentWindow("navigator:browser");
        var tabBrowser = mainWindow.getBrowser();

        // retrieve information
        var title = tabBrowser.contentDocument.title;
        var url = tabBrowser.contentWindow.content.location.href;
        var selection = tabBrowser.contentWindow.getSelection().toString();

        // skip blank pages
        if (url === "about:blank") {
            return [];
        }

        return [title, selection, url];
    },

    /*
     * Trigger creating a new task
     *
     * The user clicked on button.
     */
    createTask: function () {
        gtgtask_utils.newGTGTask(gtgtask_firefox.fetchTask());
    },

    /*
     * Trigger creating a new task and afterwards show editor
     *
     * The user clicked on context menu.
     */
    createAndEditTask: function () {
        gtgtask_utils.newGTGTask(["--force-editor"].concat(gtgtask_firefox.fetchTask()));
    },

    /*
     * Add our button to toolbar during the first load
     */
    initGTGButton: function () {
        // create object for accessing preferencies for this extension
        var prefs = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefService)
                            .getBranch("extensions.gtgtask.");
                    
        if (prefs.getBoolPref("firstRun")) {
            gtgtask_utils.addButtonToToolbar("nav-bar", "gtgtask-button", "");
            prefs.setBoolPref("firstRun", false);
        }
    }
}

// add the button only when firefox is fully loaded
window.addEventListener("load", gtgtask_firefox.initGTGButton, false);
