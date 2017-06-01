/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import "./polyfills";

const chai = require("chai");
chai.use(require("chai-as-promised"));

import "./json-spec";
import "./mock-app-spec";
/* @ifndef ADMIN */
import "./mock-auth-spec";
/* @endif */
import "./mock-data-snapshot-spec";
import "./mock-database-spec";
/* @ifndef ADMIN */
import "./mock-messaging-spec";
/* @endif */
import "./mock-ref-spec";
import "./mock-spec";
/* @ifndef ADMIN */
import "./mock-storage-spec";
import "./mock-user-spec";
/* @endif */
import "./text-random-string-spec";
