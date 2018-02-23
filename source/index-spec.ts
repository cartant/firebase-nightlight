/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import "./polyfills";

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised-transpiled";

chai.use(chaiAsPromised);

import "./json-spec";
import "./mock-untyped-spec";
import "./text-random-string-spec";

import "./app/mock-app-spec";
import "./auth/mock-auth-spec";
import "./auth/mock-user-spec";
import "./database/mock-data-snapshot-spec";
import "./database/mock-database-spec";
import "./database/mock-ref-spec";
import "./firestore/mock-firestore-spec";
import "./messaging/mock-messaging-spec";
import "./storage/mock-storage-spec";
