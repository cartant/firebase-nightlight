/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "./firebase";
import { MockUntyped as Mock } from "./mock-untyped";

describe("mock", () => {

    let initializeOptions: any;

    beforeEach(() => {

        initializeOptions = {
            apiKey: "000000000000000000000000000000000000000",
            authDomain: "nightlight.firebaseapp.com",
            databaseURL: "https://nightlight.firebaseio.com",
            storageBucket: "nightlight.appspot.com"
        };
    });

    describe("apps", () => {

        it("should return the intialized apps", () => {

            const mock = new Mock({});

            expect(mock.apps).to.deep.equal([]);

            const mockApp = mock.initializeApp(initializeOptions);

            expect(mock.apps).to.have.length(1);
        });
    });

    describe("SDK_VERSION", () => {

        it("should return a version", () => {

            const mock = new Mock({});

            expect(mock.SDK_VERSION).to.equal("mock");
        });
    });

    describe("app", () => {

        it("should return an app mock", () => {

            const mock = new Mock({});
            const mockApp = mock.initializeApp(initializeOptions);

            expect(mock).to.respondTo("database");
            expect(mock.database()).to.exist;
        });
    });

    describe("auth", () => {

        it("should return an auth mock", () => {

            const mock = new Mock({});
            const mockApp = mock.initializeApp(initializeOptions);

            expect(mock).to.respondTo("auth");
            expect(mock.auth()).to.exist;
        });
    });

    describe("database", () => {

        it("should return a database mock", () => {

            const mock = new Mock({});
            const mockApp = mock.initializeApp(initializeOptions);

            expect(mock).to.respondTo("database");
            expect(mock.database()).to.exist;
        });
    });

    describe("initializeApp", () => {

        it("should intialize an app mock", () => {

            const mock = new Mock({});
            const mockApp = mock.initializeApp(initializeOptions);

            expect(mockApp).to.exist;
            expect(mockApp).to.respondTo("auth");
            expect(mockApp).to.respondTo("database");
            expect(mockApp).to.have.property("name");
            expect(mockApp).to.have.property("options");
            expect(mockApp.options).to.deep.equal(initializeOptions);
        });
    });

    describe("messaging", () => {

        it("should return a messaging mock", () => {

            const mock = new Mock({});
            const mockApp = mock.initializeApp(initializeOptions);

            expect(mock).to.respondTo("messaging");
            expect(mock.messaging()).to.exist;
        });
    });

    describe("storage", () => {

        it("should return a storage mock", () => {

            const mock = new Mock({});
            const mockApp = mock.initializeApp(initializeOptions);

            expect(mock).to.respondTo("storage");
            expect(mock.storage()).to.exist;
        });
    });
});
