/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "../firebase";
import { MockUntyped as Mock } from "../mock-untyped";
import { MockCollectionRef } from "./mock-collection-ref";
import { content } from "./mock-content-spec";
import { MockFieldPath, MockFieldValue, MockFirestoreContent } from "./mock-firestore-types";

describe("mock-collection-ref", () => {

    let fieldPath: MockFieldPath;
    let fieldValue: MockFieldValue;
    let mock: Mock;
    let mockRef: MockCollectionRef;
    let path: string;
    let store: { content: MockFirestoreContent };

    beforeEach(() => {

        fieldPath = { documentId: {} } as any;
        fieldValue = { delete: {} } as any;
        path = "users";
        store = { content };

        mock = new Mock({
            firestore: {
                fieldPath,
                fieldValue,
                ...store
            }
        });
        mock.initializeApp({
            databaseURL: "https://mocha-cartant.firebaseio.com"
        });
        mockRef = mock.firestore().collection(path) as any;
    });

    describe("add", () => {

        it.skip("should be tested", () => {
        });
    });

    describe("doc", () => {

        it("should return the ref's child doc", () => {

            const mockDoc = mockRef.doc("alice");
            expect(mockDoc).to.be.an("object");
            expect(mockDoc).to.have.property("id", "alice");
            expect(mockDoc).to.have.property("path", "users/alice");
            expect(mockDoc.parent).to.have.property("path", "users");
        });
    });

    describe("get", () => {

        it("should get the snapshot", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("empty", false);
                expect(snapshot).to.have.property("query", mockRef);
                expect(snapshot).to.have.property("size", 3);
            });
        });
    });

    describe("id", () => {

        it("should be the ref's id", () => {

            expect(mockRef.id).to.equal("users");
        });
    });

    describe("isEqual", () => {

        it("should determine whether queries are equal", () => {

            expect(mockRef.isEqual(mockRef)).to.be.true;

            const limitedRef = mockRef.limit(100);

            expect(mockRef.isEqual(limitedRef)).to.be.false;
            expect(limitedRef.isEqual(mockRef)).to.be.false;
            expect(limitedRef.isEqual(limitedRef)).to.be.true;
        });

        it("should consider ids as well as queries", () => {

            expect(mockRef.isEqual(mock.firestore().collection("jobs"))).to.be.false;
        });
    });

    describe("onSnapshot", () => {
    });

    describe("parent", () => {

        it("should be the ref's parent", () => {

            expect(mockRef.parent).to.be.null;
        });
    });

    describe("path", () => {

        it("should be the ref's path", () => {

            expect(mockRef.path).to.equal("users");
        });
    });
});
