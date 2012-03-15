/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * Created by Izidor Matušov <izidor.matusov@gmail.com>
 */

var gtgtask_thunderbird = {
    /*
     * Find subject, author, recipients and content of e-mail for new task
     *
     * This code is based on the code from extension "Event extractor" by Merike Sell,
     * available at https://github.com/merike/event-extract/, released under MPL.
     *
     * @return - array ["--force-editor", subject, author, recipients, content]
     */
    fetchTask: function () {
        var message = gFolderDisplay.selectedMessage;
        var messenger = Components.classes["@mozilla.org/messenger;1"]
                                    .createInstance(Components.interfaces.nsIMessenger);
        var listener = Components.classes["@mozilla.org/network/sync-stream-listener;1"]
                                    .createInstance(Components.interfaces.nsISyncStreamListener);
        var uri = message.folder.getUriForMsg(message);
        messenger.messageServiceFromURI(uri).streamMessage(uri, listener, null, null, false, "");
        var folder = message.folder;

        var title = message.mime2DecodedSubject;
        var author = "From: " + message.mime2DecodedAuthor;
        var recipients = "To: " + message.mime2DecodedRecipients + "\n";

        /*
         * Reference:
         *    getMsgTextFromStream(aStream, aCharset, 
         *      aBytesToRead, aMaxOutputLen, aCompressQuotes, aStripHTMLTags, aContentType)
         */

        var content = folder.getMsgTextFromStream(listener.inputStream, message.Charset,
        65536, 32768, false, true, { });

        return ["--force-editor", title, author, recipients, content];
    },

    /*
     * Create a new task and archive the message
     */
    createTask: function (event) {
        gtgtask_utils.newGTGTask(gtgtask_thunderbird.fetchTask());
        MsgArchiveSelectedMessages(event);
        RestoreFocusAfterHdrButton();
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
            gtgtask_utils.addButtonToToolbar('header-view-toolbar', 'gtgtask-button', 'hdrArchiveButton');
            prefs.setBoolPref("firstRun", false);
        }
    }
}

// add the button only when firefox is fully loaded
addEventListener('load', gtgtask_thunderbird.initGTGButton, false);
