/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "../firebase";
import { MockUntyped as Mock } from "../mock-untyped";

describe("mock-firestore", () => {

    let mockFirestore: firebase.firestore.Firestore;

    beforeEach(() => {

        const mock = new Mock({});
        const mockApp = mock.initializeApp({
            databaseURL: "https://nightlight.firebaseio.com"
        });
        mockFirestore = mockApp.firestore();
    });

    describe("app", () => {

        it("should return a mock app", () => {

            expect(mockFirestore).to.have.property("app");
            expect(mockFirestore.app).to.exist;
        });
    });

    describe("collection", () => {

        it("should return a mock ref", () => {

            expect(mockFirestore).to.respondTo("collection");

            const mockRef = mockFirestore.collection("users");

            expect(mockRef).to.exist;
            expect(mockRef).to.have.property("id", "users");
        });

        it("should throw an error if the path contains illegal characters", () => {

            expect(() => { mockFirestore.collection("__users__"); }).to.throw(/illegal/i);
        });
    });

    describe("doc", () => {

        it("should return a mock ref", () => {

            expect(mockFirestore).to.respondTo("doc");

            const mockRef = mockFirestore.doc("users/alice");

            expect(mockRef).to.exist;
            expect(mockRef).to.have.property("id", "alice");
        });

        it("should throw an error if the path contains illegal characters", () => {

            expect(() => { mockFirestore.doc("__users__/__alice__"); }).to.throw(/illegal/i);
        });
    });
});
