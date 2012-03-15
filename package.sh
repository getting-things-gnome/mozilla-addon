#!/bin/bash
#
# Package XPI extension
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Created by Izidor Matušov <izidor.matusov@gmail.com>

rm -f ../gtgtask.xpi
zip -r9 ../gtgtask.xpi chrome/ chrome.manifest defaults/ install.rdf
