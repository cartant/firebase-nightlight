/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import "./polyfills";

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised-transpiled";

chai.use(chaiAsPromised);

import "./json-spec";
import "./mock-app-spec";
import "./mock-auth-spec";
import "./mock-data-snapshot-spec";
import "./mock-database-spec";
import "./mock-messaging-spec";
import "./mock-ref-spec";
import "./mock-storage-spec";
import "./mock-untyped-spec";
import "./mock-user-spec";
import "./text-random-string-spec";
