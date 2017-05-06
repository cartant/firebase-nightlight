/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase/app";

import { expect } from "chai";
import { Mock } from "./mock";

describe("mock-app", () => {

    let initializeOptions: any;
    let mock: Mock;
    let mockApp: firebase.app.App;

    beforeEach(() => {

        initializeOptions = {
            apiKey: "000000000000000000000000000000000000000",
            authDomain: "nightlight.firebaseapp.com",
            databaseURL: "https://nightlight.firebaseio.com",
            storageBucket: "nightlight.appspot.com"
        };

        mock = new Mock({});
        mockApp = mock.initializeApp(initializeOptions);
    });

    describe("auth", () => {

        it("should return the auth mock", () => {

            expect(mockApp.auth()).to.exist;
        });
    });

    describe("database", () => {

        it("should return the database mock", () => {

            expect(mockApp.database()).to.exist;
        });
    });

    describe("delete", () => {

        it("should delete the app", () => {

            let filtered = mock.apps.filter((app) => app && (app.name === "[DEFAULT]"));
            expect(filtered).to.not.be.empty;

            return mockApp.delete().then(() => {

                filtered = mock.apps.filter((app) => app && (app.name === "[DEFAULT]"));
                expect(filtered).to.be.empty;
            });
        });
    });

    describe("name", () => {

        it("should return the app name", () => {

            expect(mockApp).to.have.property("name", "[DEFAULT]");
        });
    });

    describe("options", () => {

        it("should return the options", () => {

            expect(mockApp).to.have.property("options");
            expect(mockApp.options).to.deep.equal(initializeOptions);
        });
    });

    describe.skip("messaging", () => {
    });

    describe.skip("storage", () => {
    });
});
