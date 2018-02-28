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
import { MockFieldPath, MockFieldValue, MockFirestoreContent } from "./mock-firestore-types";

describe("mock-document-ref", () => {

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
        mockRef = mock.firestore().doc(path) as MockDocumentRef;
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

        it("should delete the doc", () => {

            return mockRef.delete()
                .then(() => mockRef.get())
                .then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("exists", false);
                });
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

        it("should notify observers of an initial snapshot", (callback: any) => {

            mockRef.onSnapshot({
                next: snapshot => {
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("data");
                    expect(snapshot.data()).to.deep.equal({
                        name: "alice"
                    });
                    callback();
                }
            });
        });

        it("should notify observers of changes", (callback: any) => {

            let count = 0;

            mockRef.onSnapshot({
                next: snapshot => {
                    switch (++count) {
                    case 1:
                        expect(snapshot).to.be.an("object");
                        expect(snapshot).to.respondTo("data");
                        expect(snapshot.data()).to.deep.equal({
                            name: "alice"
                        });
                        break;
                    case 2:
                        expect(snapshot).to.be.an("object");
                        expect(snapshot).to.respondTo("data");
                        expect(snapshot.data()).to.deep.equal({
                            age: 42,
                            name: "alice"
                        });
                        callback();
                        break;
                    default:
                        throw new Error("Unexpected notification");
                    }
                }
            });

            mockRef.update({ age: 42 });
        });

        it("should notify observers of other refs of changes", (callback: any) => {

            let count = 0;

            const otherRef = mock.firestore().doc(mockRef.path) as MockDocumentRef;
            otherRef.onSnapshot({
                next: snapshot => {
                    switch (++count) {
                        case 1:
                        expect(snapshot).to.be.an("object");
                        expect(snapshot).to.respondTo("data");
                        expect(snapshot.data()).to.deep.equal({
                            name: "alice"
                        });
                        break;
                    case 2:
                        expect(snapshot).to.be.an("object");
                        expect(snapshot).to.respondTo("data");
                        expect(snapshot.data()).to.deep.equal({
                            age: 42,
                            name: "alice"
                        });
                        callback();
                        break;
                    default:
                        throw new Error("Unexpected notification");
                    }
                }
            });

            mockRef.update({ age: 42 });
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

    describe("set", () => {

        it("should set the doc", () => {

            return mockRef.set({ name: "alison" })
                .then(() => mockRef.get())
                .then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("exists", true);
                    expect(snapshot).to.respondTo("data");
                    expect(snapshot.data()).to.deep.equal({ name: "alison" });
                });
        });

        it("should support merging", () => {

            return mockRef.set({ age: 42 }, { merge: true })
                .then(() => mockRef.get())
                .then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("exists", true);
                    expect(snapshot).to.respondTo("data");
                    expect(snapshot.data()).to.deep.equal({ age: 42, name: "alice" });
                });
        });
    });

    describe("update", () => {

        it("should update the doc", () => {

            return mockRef.update({ age: 42 })
                .then(() => mockRef.get())
                .then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("exists", true);
                    expect(snapshot).to.respondTo("data");
                    expect(snapshot.data()).to.deep.equal({ age: 42, name: "alice" });
                });
        });

        it.skip("should error for docs that don't exist", () => {
        });
    });
});
