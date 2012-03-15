/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Izidor Matušov <izidor.matusov@gmail.com>
 */

var gtgtask_utils = {
    /*
     * Convert chrome:// file into local file path
     *
     * Based on the comment http://forums.mozillazine.org/viewtopic.php?p=3320618#p3320618
     *
     * @param - aPath - chrome:// URL
     * @return - local file path (/home/user/file.txt)
     */
    chromeToPath: function (aPath) {
        // parse chrome:// to get nsIURI representation
        var ios = Components.classes['@mozilla.org/network/io-service;1']
                        .getService(Components.interfaces["nsIIOService"]);
        var uri = ios.newURI(aPath, "UTF-8", null);

        // resolve representation in local file system (file:///home/user/file.txt)
        var cr = Components.classes['@mozilla.org/chrome/chrome-registry;1']
                        .getService(Components.interfaces["nsIChromeRegistry"]);
        var filepath = cr.convertChromeURL(uri).spec;

        // convert file:// to regular local file system path
        var ph = Components.classes["@mozilla.org/network/protocol;1?name=file"]
                        .createInstance(Components.interfaces.nsIFileProtocolHandler);

        return ph.getFileFromURLSpec(filepath).path;
    },

    /*
     * Runs external Python script which adds a new task
     *
     * @param - args - arguments for python script
     */
    newGTGTask: function (args) {
        // get path to the script
        var cmd = gtgtask_utils.chromeToPath('chrome://gtgtask/content/newtask.py');

        // create Mozilla representation of the script
        var execFile = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsILocalFile);
        execFile.initWithPath(cmd);

        if (execFile.exists()) {
            // run the script
            // use runw rather than run because of diacritic like
            // "žluťučký kůň úpěl ďábelšké ódy"
            var process = Components.classes["@mozilla.org/process/util;1"].
                                createInstance(Components.interfaces.nsIProcess);
            process.init(execFile);
            // blocking, arguments, count of arguments
            process.runw(false, args, args.length);
        }
    },

    /*
     * Add a button to toolbar
     *
     * It was inspired by many different tutorials. It is important
     * to use both of setAttribute() and .currentSet=, although it seems
     * to be redundant. It is *needed*.
     *
     * @param - toolbar - id of toolbar where the button will be added
     * @param - button - id of button to add
     * @param - after - the button is instered after this button, if "", at the last position
     */
    addButtonToToolbar: function (toolbar, button, after) {
        var currentset = document.getElementById(toolbar).currentSet;

        pos = currentset.indexOf(after)
        if (after !== "" && pos >= 0) {
            pos += after.length;
            currentset = currentset.substr(0, pos) + "," + button + currentset.substr(pos, currentset.length);
        }
        else {
            currentset = currentset + "," + button;
        }

        document.getElementById(toolbar).setAttribute("currentset", currentset);
        document.getElementById(toolbar).currentSet = currentset;
        document.persist(toolbar, "currentset");
    }
}
