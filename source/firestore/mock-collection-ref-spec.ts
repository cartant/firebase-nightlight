/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "../firebase";
import { MockUntyped as Mock } from "../mock-untyped";
import { MockCollectionRef } from "./mock-collection-ref";
import { MockFirestoreContent } from "./mock-firestore-types";

describe("mock-collection-ref", () => {

    let mock: Mock;
    let mockRef: MockCollectionRef;
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
        path = "users";

        mock = new Mock({ firestore: store });
        mock.initializeApp({
            databaseURL: "https://mocha-cartant.firebaseio.com"
        });
        mockRef = mock.firestore().collection(path) as any;
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

    describe("id", () => {

        it("should be the ref's id", () => {

            expect(mockRef.id).to.equal("users");
        });
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
