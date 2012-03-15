#!/usr/bin/python
# -*- coding: utf-8 -*-
#
# Create a new GTG task from arguments:
#   1st argument => title
#   every other argument => part of body
#
# If it is possible to show notifications, only notification (libnotify)
# are shown. Otherwise, the task editor with the new task is shown.
#
# If the first argument is --force-editor, editor is shown every time.
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Created by Izidor Matušov <izidor.matusov@gmail.com>

import dbus
import sys

class GTG:
    """ Unified interface to different versions of GTG D-Bus """

    def __init__(self):
        try:
            self.version = "0.2.9"
            bus = dbus.SessionBus()
            gtg_obj = bus.get_object('org.gnome.GTG', '/org/gnome/GTG')
            self.gtg = dbus.Interface(gtg_obj, 'org.gnome.GTG')
        except dbus.exceptions.DBusException, e:
            # Use older version
            self.version = "0.2.4"
            bus = dbus.SessionBus()
            gtg_obj = bus.get_object('org.GTG', '/org/GTG')
            self.gtg = dbus.Interface(gtg_obj, 'org.GTG')

    def new_task(self, title, message):
        if self.version == "0.2.9":
            return self.gtg.NewTask('Active', title, '', '', '', [], message, [])
        else:
            return self.gtg.new_task('Active', title, '', '', '', [], message, [])

    def open_task(self, task_id):
        if self.version == "0.2.9":
            return self.gtg.OpenTaskEditor(task_id)
        else:
            return self.gtg.open_task_editor(task_id)

def show_notification(title, message):
    try:
        import pynotify
        pynotify.init("GTGTaskButton")
        pynotify.Notification(title, message).show()
        return True
    except ImportError:
        return False

if __name__ == "__main__":
    # Force editor?
    force_editor = False
    if len(sys.argv) > 1:
        if "--force-editor" == sys.argv[1]:
            force_editor = True
            sys.argv.remove("--force-editor")

    # Without arguments do nothing
    if len(sys.argv) == 1:
        sys.exit(1)

    print "Adding a GTG task: %s" % sys.argv

    title = sys.argv[1]
    message = "\n".join(sys.argv[2:])

    try:
        gtg = GTG()
    except dbus.exceptions.DBusException, e:
        show_notification("Failed to find GTG", "There is no D-Bus interface for GTG")
        print "D-Bus exception:", e
        sys.exit(1)

    task = gtg.new_task(title, message)
    # if notification fails, open the task
    if force_editor or not show_notification("New GTG task added", title):
        gtg.open_task(task['id'])
