/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "../firebase";
import { MockUntyped as Mock } from "../mock-untyped";
import { content } from "./mock-content-spec";
import { MockCollectionRef } from "./mock-collection-ref";
import { MockFieldPath, MockFieldValue, MockFirestoreContent } from "./mock-firestore-types";
import { MockQuerySnapshot } from "./mock-query-snapshot";

describe("mock-query-snapshot", () => {

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

    describe("docChanges", () => {

        it("should return the doc changes", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");

                const docChanges = snapshot.docChanges;
                expect(docChanges).to.be.an("array");
                expect(docChanges).to.have.length(0);
            });
        });
    });

    describe("docs", () => {

        it("should return the docs", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");

                const docs = snapshot.docs;
                expect(docs).to.be.an("array");
                expect(docs).to.have.length(3);
                expect(docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
            });
        });
    });

    describe("empty", () => {

        it("should return false if there are docs", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("empty", false);
            });
        });

        it("should return true if there are no docs", () => {

            const collectionRef = mock.firestore().collection("jobs") as MockCollectionRef;
            return collectionRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("empty", true);
            });
        });
    });

    describe("forEach", () => {

        it("should enumerate the docs", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");

                const docs: firebase.firestore.DocumentSnapshot[] = [];
                snapshot.forEach(doc => docs.push(doc));

                expect(docs).to.be.an("array");
                expect(docs).to.have.length(3);
                expect(docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
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

    describe("query", () => {

        it("should return the ref", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("query", mockRef);
            });
        });
    });

    describe("size", () => {

        it("should return the number of docs", () => {

            return mockRef.get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 3);
            });
        });
    });
});
