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
        mockRef = mock.firestore().collection(path) as MockCollectionRef;
    });

    describe("add", () => {

        it("should add a new doc", () => {

            return mockRef.add({ name: "thomas" }).then(doc => {

                expect(doc).to.be.an("object");
                expect(doc).to.have.property("id");
                expect(doc).to.have.property("parent");
                expect(doc.parent).to.have.property("id", "users");
                return mockRef.get();

            }).then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 4);
            });
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

    describe("endAt", () => {

        it("should end at 'zelda'", () => {

            return mockRef.endAt("zelda").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 3);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
            });
        });

        it("should end at 'mallory'", () => {

            return mockRef.endAt("mallory").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 3);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
            });
        });

        it("should end at 'alice'", () => {

            return mockRef.endAt("alice").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 1);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice"]);
            });
        });

        it("should end at 'abigail'", () => {

            return mockRef.endAt("abigail").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 0);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
            });
        });

        it.skip("should end at the specified field value", () => {
        });
    });

    describe("endBefore", () => {

        it("should end before 'zelda'", () => {

            return mockRef.endBefore("zelda").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 3);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
            });
        });

        it("should end before 'mallory'", () => {

            return mockRef.endBefore("mallory").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 2);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob"]);
            });
        });

        it("should end before 'alice'", () => {

            return mockRef.endBefore("alice").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 0);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
            });
        });

        it("should end before 'abigail'", () => {

            return mockRef.endBefore("abigail").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 0);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
            });
        });

        it.skip("should end before the specified field value", () => {
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
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
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

    describe("limit", () => {

        it("should limit to the first", () => {

            return mockRef.startAt("alice").limit(1).get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 1);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice"]);
            });
        });

        it("should limit to the last", () => {

            return mockRef.endAt("mallory").limit(1).get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 1);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["mallory"]);
            });
        });
    });

    describe("onSnapshot", () => {

        it("should notify observers of an initial snapshot", (callback: any) => {

            mockRef.onSnapshot({
                next: snapshot => {
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("docs");
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
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
                        expect(snapshot).to.have.property("docs");
                        expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
                        expect(snapshot.docs[0].data()).to.deep.equal({
                            name: "alice"
                        });
                        break;
                    case 2:
                        expect(snapshot).to.be.an("object");
                        expect(snapshot).to.have.property("docs");
                        expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
                        expect(snapshot.docs[0].data()).to.deep.equal({
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

            const docRef = mockRef.doc("alice");
            docRef.update({ age: 42 });
        });
    });

    describe("orderBy", () => {

        describe("asc", () => {

            it("should sort in ascending order", () => {

                return mockRef.orderBy("name", "asc").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 3);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
                });
            });
        });

        describe("desc", () => {

            it("should sort in descending order", () => {

                return mockRef.orderBy("name", "desc").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 3);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["mallory", "bob", "alice"]);
                });
            });
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

    describe("startAfter", () => {

        it("should start after 'abigail'", () => {

            return mockRef.startAfter("abigail").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 3);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
            });
        });

        it("should start after 'alice'", () => {

            return mockRef.startAfter("alice").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 2);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["bob", "mallory"]);
            });
        });

        it("should start after 'mallory'", () => {

            return mockRef.startAfter("mallory").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 0);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
            });
        });

        it("should start after 'zelda'", () => {

            return mockRef.startAfter("zelda").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 0);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
            });
        });

        it.skip("should start after the specified field value", () => {
        });
    });

    describe("startAt", () => {

        it("should start at 'abigail'", () => {

            return mockRef.startAt("abigail").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 3);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
            });
        });

        it("should start at 'alice'", () => {

            return mockRef.startAt("alice").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 3);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
            });
        });

        it("should start at 'mallory'", () => {

            return mockRef.startAt("mallory").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 1);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["mallory"]);
            });
        });

        it("should start at 'zelda'", () => {

            return mockRef.startAt("zelda").get().then(snapshot => {

                expect(snapshot).to.exist;
                expect(snapshot).to.be.an("object");
                expect(snapshot).to.have.property("size", 0);
                expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
            });
        });

        it.skip("should start at the specified field value", () => {
        });
    });

    describe("where", () => {

        describe("==", () => {

            it("should get docs where value is 'abigail'", () => {

                return mockRef.where("name", "==", "abigail").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 0);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
                });
            });

            it("should get docs where value is 'alice'", () => {

                return mockRef.where("name", "==", "alice").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 1);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice"]);
                });
            });

            it("should get where value is 'mallory'", () => {

                return mockRef.where("name", "==", "mallory").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 1);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["mallory"]);
                });
            });

            it("should get where value is 'zelda'", () => {

                return mockRef.where("name", "==", "zelda").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 0);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
                });
            });
        });

        describe("<", () => {

            it("should get docs where value is 'abigail'", () => {

                return mockRef.where("name", "<", "abigail").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 0);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
                });
            });

            it("should get docs where value is 'alice'", () => {

                return mockRef.where("name", "<", "alice").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 0);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
                });
            });

            it("should get where value is 'mallory'", () => {

                return mockRef.where("name", "<", "mallory").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 2);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob"]);
                });
            });

            it("should get where value is 'zelda'", () => {

                return mockRef.where("name", "<", "zelda").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 3);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
                });
            });
        });

        describe("<=", () => {

            it("should get docs where value is 'abigail'", () => {

                return mockRef.where("name", "<=", "abigail").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 0);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
                });
            });

            it("should get docs where value is 'alice'", () => {

                return mockRef.where("name", "<=", "alice").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 1);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice"]);
                });
            });

            it("should get where value is 'mallory'", () => {

                return mockRef.where("name", "<=", "mallory").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 3);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
                });
            });

            it("should get where value is 'zelda'", () => {

                return mockRef.where("name", "<=", "zelda").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 3);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
                });
            });
        });

        describe(">", () => {

            it("should get docs where value is 'abigail'", () => {

                return mockRef.where("name", ">", "abigail").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 3);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
                });
            });

            it("should get docs where value is 'alice'", () => {

                return mockRef.where("name", ">", "alice").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 2);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["bob", "mallory"]);
                });
            });

            it("should get where value is 'mallory'", () => {

                return mockRef.where("name", ">", "mallory").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 0);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
                });
            });

            it("should get where value is 'zelda'", () => {

                return mockRef.where("name", ">", "zelda").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 0);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
                });
            });
        });

        describe(">=", () => {

            it("should get docs where value is 'abigail'", () => {

                return mockRef.where("name", ">=", "abigail").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 3);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
                });
            });

            it("should get docs where value is 'alice'", () => {

                return mockRef.where("name", ">=", "alice").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 3);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["alice", "bob", "mallory"]);
                });
            });

            it("should get where value is 'mallory'", () => {

                return mockRef.where("name", ">=", "mallory").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 1);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["mallory"]);
                });
            });

            it("should get where value is 'zelda'", () => {

                return mockRef.where("name", ">=", "zelda").get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 0);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal([]);
                });
            });
        });

        it("should support multiple where clauses", () => {

            return Promise.all([
                mockRef.doc("alice").update({ age: 42 }),
                mockRef.doc("bob").update({ age: 42 })
            ])
            .then(() => mockRef
                .where("age", "==", 42)
                .where("name", ">", "alice")
                .get().then(snapshot => {

                    expect(snapshot).to.exist;
                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("size", 1);
                    expect(snapshot.docs.map(doc => doc.id)).to.deep.equal(["bob"]);
                })
            );
        });
    });
});
