/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPLv3 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase/app";

import { expect } from "chai";
import { Mock } from "./mock";

describe("mock", () => {

    describe("auth", () => {

        it("should return a mock auth", () => {

            const mock = new Mock({});

            expect(mock).to.respondTo("auth");
            expect(mock.auth()).to.exist;
        });
    });

    describe("database", () => {

        it("should return a mock database", () => {

            const mock = new Mock({});

            expect(mock).to.respondTo("database");
            expect(mock.database()).to.exist;
        });
    });

    describe("initializeApp", () => {

        it("should intialize the mock app", () => {

            const options = {
                apiKey: "000000000000000000000000000000000000000",
                authDomain: "nightlight.firebaseapp.com",
                databaseURL: "https://nightlight.firebaseio.com",
                storageBucket: "nightlight.appspot.com"
            };

            const mock = new Mock({});
            const mockApp = mock.initializeApp(options);

            expect(mockApp).to.exist;
            expect(mockApp).to.respondTo("auth");
            expect(mockApp).to.respondTo("database");
            expect(mockApp).to.have.property("name");
            expect(mockApp).to.have.property("options");
            expect(mockApp.options).to.deep.equal(options);
        });
    });
});
