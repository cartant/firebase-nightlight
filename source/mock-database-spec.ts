/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase/app";

import { expect } from "chai";
import { Mock } from "./mock";

describe("mock-database", () => {

    let mockDatabase: firebase.database.Database;

    beforeEach(() => {

        const mock = new Mock({});
        const mockApp = mock.initializeApp({
            databaseURL: "https://nightlight.firebaseio.com"
        });
        mockDatabase = mockApp.database();
    });

    describe("goOffline", () => {
    });

    describe("goOnline", () => {
    });

    describe("ref", () => {

        it("should return a mock ref", () => {

            expect(mockDatabase).to.respondTo("ref");

            const mockRef = mockDatabase.ref("path/to/data");

            expect(mockRef).to.exist;
            expect(mockRef).to.have.property("key", "data");
        });

        it("should throw an error if the path contains illegal characters", () => {

            expect(() => { mockDatabase.ref("illegal.$path"); }).to.throw(/illegal/i);
        });
    });

    describe("refFromURL", () => {

        it("should return a mock ref", () => {

            expect(mockDatabase).to.respondTo("refFromURL");

            const mockRef = mockDatabase.refFromURL("https://nightlight.firebaseio.com/path/to/data");

            expect(mockRef).to.exist;
            expect(mockRef).to.have.property("key", "data");
        });
    });
});
