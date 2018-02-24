/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "../firebase";
import { MockUntyped as Mock } from "../mock-untyped";
import { content } from "./mock-content-spec";
import { MockDocumentRef } from "./mock-document-ref";
import { MockFieldValues, MockFirestoreContent } from "./mock-firestore-types";

describe("mock-document-ref", () => {

    let fieldValues: MockFieldValues;
    let mock: Mock;
    let mockRef: MockDocumentRef;
    let path: string;
    let store: { content: MockFirestoreContent };

    beforeEach(() => {

        fieldValues = { delete: {} } as any;
        path = "users/alice";
        store = { content };

        mock = new Mock({
            firestore: {
                fieldValues,
                ...store
            }
        });
        mock.initializeApp({
            databaseURL: "https://mocha-cartant.firebaseio.com"
        });
        mockRef = mock.firestore().doc(path) as any;
    });

    describe("collection", () => {

        it("should return the ref's child collection", () => {

            const mockCollection = mockRef.collection("pets");
            expect(mockCollection).to.be.an("object");
            expect(mockCollection).to.have.property("id", "pets");
            expect(mockCollection).to.have.property("path", "users/alice/pets");
            expect(mockCollection.parent).to.have.property("path", "users/alice");
        });
    });

    describe("delete", () => {

        it.skip("should be tested", () => {
        });
    });

    describe("get", () => {

        it("should get the snapshot", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("id", "alice");
                expect(snapshot).to.have.property("ref", mockRef);
            });
        });
    });

    describe("id", () => {

        it("should be the ref's id", () => {

            expect(mockRef.id).to.equal("alice");
        });
    });

    describe("isEqual", () => {

        it("should determine whether refs are equal", () => {

            expect(mockRef.isEqual(mockRef)).to.be.true;
            expect(mockRef.isEqual(mock.firestore().doc("users/alice"))).to.be.true;
            expect(mockRef.isEqual(mock.firestore().doc("users/bob"))).to.be.false;
        });
    });

    describe("onSnapshot", () => {
    });

    describe("parent", () => {

        it("should be the ref's parent", () => {

            expect(mockRef.parent).to.be.an("object");
            expect(mockRef.parent).to.have.property("id", "users");
        });
    });

    describe("path", () => {

        it("should be the ref's path", () => {

            expect(mockRef.path).to.equal("users/alice");
        });
    });

    describe("set", () => {

        it.skip("should be tested", () => {
        });
    });

    describe("update", () => {

        it.skip("should be tested", () => {
        });
    });
});
