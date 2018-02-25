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
import { MockDocumentSnapshot } from "./mock-document-snapshot";
import { MockFieldPath, MockFieldValue, MockFirestoreContent } from "./mock-firestore-types";

describe("mock-document-snapshot", () => {

    let fieldPath: MockFieldPath;
    let fieldValue: MockFieldValue;
    let mock: Mock;
    let mockRef: MockDocumentRef;
    let path: string;
    let store: { content: MockFirestoreContent };

    beforeEach(() => {

        fieldPath = { documentId: {} } as any;
        fieldValue = { delete: {} } as any;
        path = "users/alice";
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
        mockRef = mock.firestore().doc(path) as any;
    });

    describe("data", () => {

        it("should return the data", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.respondTo("data");
                expect(snapshot.data()).to.deep.equal({
                    name: "alice"
                });
            });
        });
    });

    describe("exists", () => {

        it("should return true for docs that exist", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("exists", true);
            });
        });

        it("should return true for docs that don't exist", () => {

            return mockRef.parent.doc("norman").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("exists", false);
            });
        });
    });

    describe("get", () => {

        it("should get the field", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.respondTo("get");
                expect(snapshot.get("name")).to.equal("alice");
            });
        });
    });

    describe("id", () => {

        it("should return the id", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("id", "alice");
            });
        });
    });

    describe("metadata", () => {

        it("should return the metadata", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("metadata");
                expect(snapshot.metadata).to.deep.equal({
                    fromCache: false,
                    hasPendingWrites: false
                });
            });
        });
    });

    describe("ref", () => {

        it("should return the ref", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("ref", mockRef);
            });
        });
    });
});
