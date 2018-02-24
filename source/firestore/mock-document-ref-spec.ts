/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "../firebase";
import { MockUntyped as Mock } from "../mock-untyped";
import { MockDocumentRef } from "./mock-document-ref";
import { MockFirestoreContent } from "./mock-firestore-types";

describe("mock-document-ref", () => {

    let mock: Mock;
    let mockRef: MockDocumentRef;
    let path: string;
    let store: { content: MockFirestoreContent };

    beforeEach(() => {

        store = {
            content: {
                users: {
                    alice: {
                        collections: {},
                        data: {
                            name: "alice"
                        }
                    },
                    bob: {
                        collections: {},
                        data: {
                            name: "bob"
                        }
                    }
                }
            }
        };
        path = "users/alice";

        mock = new Mock({ firestore: store });
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

    describe("id", () => {

        it("should be the ref's id", () => {

            expect(mockRef.id).to.equal("alice");
        });
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
});
