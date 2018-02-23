/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import * as json from "../json";
import { firebase } from "../firebase";
import { MockUntyped as Mock } from "../mock-untyped";
import { MockValue } from "./mock-database-types";
import { MockRef } from "./mock-ref";

const waitMilliseconds = 40;

function asPromise(ref: firebase.database.ThenableReference): Promise<any> {
    return ref as any as Promise<any>;
}

describe("mock-ref", () => {

    let database: { content: MockValue };
    let mock: Mock;
    let mockRef: MockRef;
    let path: string;

    beforeEach(() => {

        database = {
            content: {
                path: {
                    to: {
                        data: {
                            answer: 42,
                            question: "what do you get if you multiply six by nine?"
                        }
                    }
                }
            }
        };
        path = "path/to/data";

        mock = new Mock({ database });
        mock.initializeApp({
            databaseURL: "https://mocha-cartant.firebaseio.com"
        });
        mockRef = mock.database().ref(path) as any;
    });

    describe("child", () => {

        it("should return a mock child", () => {

            const childRef = mockRef.child("answer");

            expect(childRef).to.be.an("object");
            expect(childRef).to.have.property("key", "answer");
        });
    });

    describe("key", () => {

        it("should be the ref's key", () => {

            expect(mockRef.key).to.equal("data");
        });
    });

    describe("off", () => {

        it("should remove the listener", (callback) => {

            const listener = mockRef.on("value", (snapshot) => {

                throw new Error("Should not be called.");
            }, callback);

            expect(mockRef.stats_().listeners.value).to.equal(1);
            mockRef.off("value", listener);
            expect(mockRef.stats_().listeners.value).to.equal(0);

            setTimeout(callback, waitMilliseconds);
        });

        it("should remove all listeners", (callback) => {

            mockRef.on("value", (snapshot) => {

                throw new Error("Should not be called.");
            }, callback);

            expect(mockRef.stats_().listeners.value).to.equal(1);
            mockRef.off();
            expect(mockRef.stats_().listeners.value).to.equal(0);

            setTimeout(callback, waitMilliseconds);
        });

        it("should remove all listeners of the specified type", (callback) => {

            mockRef.on("value", (snapshot) => {

                throw new Error("Should not be called.");
            }, callback);

            expect(mockRef.stats_().listeners.value).to.equal(1);
            mockRef.off("value");
            expect(mockRef.stats_().listeners.value).to.equal(0);

            setTimeout(callback, waitMilliseconds);
        });
    });

    describe("on", () => {

        describe("value", () => {

            // This event will trigger once with the initial data stored at
            // this location, and then trigger again each time the data
            // changes. The DataSnapshot passed to the callback will be for the
            // location at which on() was called. It won't trigger until the
            // entire contents has been synchronized. If the location has no
            // data, it will be triggered with an empty DataSnapshot (val()
            // will return null).

            it("should listen to the ref's initial value", (callback) => {

                mockRef.on("value", (snapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("key");
                    expect(snapshot).to.have.property("ref");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.not.equal(database.content["path"]["to"]["data"]);
                    expect(snapshot.val()).to.deep.equal(database.content["path"]["to"]["data"]);
                    callback();
                });
            });

            it("should fire after the initial child_added events", (callback) => {

                const keys: string[] = [];

                mockRef.on("value", (snapshot) => {

                    expect(keys).to.have.length(2);
                    expect(keys).to.contain("answer");
                    expect(keys).to.contain("question");
                    callback();
                });
                mockRef.on("child_added", (snapshot) => {

                    keys.push(snapshot.key as string);
                });
            });

            it("should have independent emitters", (callback) => {

                mockRef.on("value", (snapshot) => {

                    callback();
                });

                const parent = mockRef.parent as MockRef;
                parent.on("value", () => {});
                parent.off();
            });

            it("should listen to push", (callback) => {

                let initial = true;
                let pushedRef: firebase.database.ThenableReference;

                mockRef.on("value", (snapshot) => {

                    if (initial) {
                        initial = false;
                        pushedRef = mockRef.push("pushed");
                        asPromise(pushedRef).catch(callback);
                    } else {
                        expect(snapshot).to.be.an("object");
                        expect(snapshot.val()).to.have.property(pushedRef.key as string, "pushed");
                        mockRef.off();
                        callback();
                    }
                });
            });

            it("should listen to remove", (callback) => {

                let initial = true;

                mockRef.on("value", (snapshot) => {

                    if (initial) {
                        initial = false;
                        mockRef.remove().catch(callback);
                    } else {
                        expect(snapshot).to.be.an("object");
                        expect(snapshot.exists()).to.be.false;
                        mockRef.off();
                        callback();
                    }
                });
            });

            it("should listen to set", (callback) => {

                let initial = true;

                mockRef.on("value", (snapshot) => {

                    if (initial) {
                        initial = false;
                        mockRef.set({ set: true }).catch(callback);
                    } else {
                        expect(snapshot).to.be.an("object");
                        expect(snapshot.val()).to.deep.equal({ set: true });
                        mockRef.off();
                        callback();
                    }
                });
            });

            it("should listen to update", (callback) => {

                let initial = true;

                mockRef.on("value", (snapshot) => {

                    if (initial) {
                        initial = false;
                        mockRef.update({ updated: true }).catch(callback);
                    } else {
                        expect(snapshot).to.be.an("object");
                        expect(snapshot.val()).to.have.property("updated", true);
                        mockRef.off();
                        callback();
                    }
                });
            });

            it("should support a context", (callback) => {

                const context = { context: true };

                function listener(this: any, snapshot: firebase.database.DataSnapshot): void {

                    // tslint:disable-next-line
                    expect(this).to.equal(context);
                    callback();
                }

                const result = mockRef.on("value", listener, context);

                expect(result).to.equal(listener);
            });

            it("should support forced errors", (callback) => {

                database.content["path"]["to"]["data"][".error"] = "Boom!";

                mockRef.on("value", (snapshot) => {

                    callback(new Error("Unexpected success."));

                }, (error: Error) => {

                    expect(error).to.match(/Boom!/);
                    callback();
                });
            });

            it("should support forced errors specified on parents", (callback) => {

                database.content["path"][".error"] = "Boom!";

                mockRef.on("value", (snapshot) => {

                    callback(new Error("Unexpected success."));

                }, (error: Error) => {

                    expect(error).to.match(/Boom!/);
                    callback();
                });
            });

            it("should support forced errors specified at the root", (callback) => {

                database.content[".error"] = "Boom!";

                mockRef.on("value", (snapshot) => {

                    callback(new Error("Unexpected success."));

                }, (error: Error) => {

                    expect(error).to.match(/Boom!/);
                    callback();
                });
            });
        });

        describe("child_added", () => {

            // This event will be triggered once for each initial child at this
            // location, and it will be triggered again every time a new child
            // is added. The DataSnapshot passed into the callback will reflect
            // the data for the relevant child. For ordering purposes, it is
            // passed a second argument which is a string containing the key of
            // the previous sibling child by priority order (or null if it is
            // the first child).

            it("should listen to the ref's initial children", (callback) => {

                const keys: string[] = [];
                const previousKeys: string[] = [];
                const values: MockValue[] = [];

                mockRef.on("child_added", (snapshot, previousKey) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("key");
                    expect(snapshot).to.have.property("ref");
                    expect(snapshot).to.respondTo("val");

                    keys.push(snapshot.key as string);
                    previousKeys.push(previousKey as string);
                    values.push(snapshot.val());

                    if (keys.length >= 2) {
                        expect(keys).to.deep.equal(["answer", "question"]);
                        expect(previousKeys).to.deep.equal([null, "answer"]);
                        expect(values).to.deep.equal([
                            database.content["path"]["to"]["data"].answer,
                            database.content["path"]["to"]["data"].question
                        ]);
                        callback();
                    }
                });
            });

            it("should listen to push", (callback) => {

                let count = 0;
                let initial = true;
                let pushedRef: firebase.database.ThenableReference;

                mockRef.on("child_added", (snapshot, previousKey) => {

                    if (initial) {
                        if (++count === Object.keys(database.content["path"]["to"]["data"]).length) {
                            initial = false;
                            pushedRef = mockRef.push("pushed");
                            asPromise(pushedRef).catch(callback);
                        }
                    } else {
                        expect(snapshot).to.be.an("object");
                        expect(snapshot.key).to.equal(pushedRef.key);
                        expect(snapshot.val()).to.equal("pushed");
                        expect(previousKey).to.not.be.undefined;
                        callback();
                    }
                });
            });

            it("should listen to set", (callback) => {

                let count = 0;
                let initial = true;

                mockRef.on("child_added", (snapshot, previousKey) => {

                    if (initial) {
                        if (++count === Object.keys(database.content["path"]["to"]["data"]).length) {
                            initial = false;
                            mockRef.child("name").set("alice").catch(callback);
                        }
                    } else {
                        expect(snapshot).to.be.an("object");
                        expect(snapshot.key).to.equal("name");
                        expect(snapshot.val()).to.equal("alice");
                        expect(previousKey).to.equal("answer");
                        callback();
                    }
                });
            });

            it("should listen to update", (callback) => {

                let count = 0;
                let initial = true;

                mockRef.on("child_added", (snapshot, previousKey) => {

                    if (initial) {
                        if (++count === Object.keys(database.content["path"]["to"]["data"]).length) {
                            initial = false;
                            mockRef.update({ name: "alice" }).catch(callback);
                        }
                    } else {
                        expect(snapshot).to.be.an("object");
                        expect(snapshot.key).to.equal("name");
                        expect(snapshot.val()).to.equal("alice");
                        expect(previousKey).to.equal("answer");
                        callback();
                    }
                });
            });

            it.skip("should emulate the API's synchronous callbacks", (callback) => {

                let called = false;
                const keys: string[] = [];
                const previousKeys: string[] = [];
                const values: MockValue[] = [];

                mockRef.on("child_added", (snapshot, previousKey) => {

                    called = true;

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("key");
                    expect(snapshot).to.have.property("ref");
                    expect(snapshot).to.respondTo("val");

                    keys.push(snapshot.key as string);
                    previousKeys.push(previousKey as string);
                    values.push(snapshot.val());

                    if (keys.length >= 3) {
                        expect(keys).to.deep.equal(["another", "answer", "question"]);
                        expect(previousKeys).to.deep.equal([null, null, "answer"]);
                        expect(values).to.deep.equal([
                            database.content["path"]["to"]["data"].another,
                            database.content["path"]["to"]["data"].answer,
                            database.content["path"]["to"]["data"].question
                        ]);
                        callback();
                    }
                });

                mockRef.update({ another: "another value" });

                expect(called).to.be.true;
            });

            it.skip("should support prevKey with synchronous callbacks", (callback) => {

                let called = false;
                const keys: string[] = [];
                const previousKeys: string[] = [];
                const values: MockValue[] = [];

                mockRef.on("child_added", (snapshot, previousKey) => {

                    called = true;

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("key");
                    expect(snapshot).to.have.property("ref");
                    expect(snapshot).to.respondTo("val");

                    keys.push(snapshot.key as string);
                    previousKeys.push(previousKey as string);
                    values.push(snapshot.val());

                    if (keys.length >= 4) {
                        expect(keys).to.deep.equal(["another", "some", "answer", "question"]);
                        expect(previousKeys).to.deep.equal([null, "another", null, "answer"]);
                        expect(values).to.deep.equal([
                            database.content["path"]["to"]["data"].another,
                            database.content["path"]["to"]["data"].some,
                            database.content["path"]["to"]["data"].answer,
                            database.content["path"]["to"]["data"].question
                        ]);
                        callback();
                    }
                });

                mockRef.update({ another: "another value" });
                mockRef.update({ some: "some value" });

                expect(called).to.be.true;
            });

            it("should not fire for non-matching queries", () => {

                let queryRef: firebase.database.Query;
                let listener: (snapshot: firebase.database.DataSnapshot, prevKey?: string) => any;

                return mockRef
                    .set({ a: 1, b: 2, c: 3 })
                    .then(() => {

                        queryRef = mockRef.orderByKey().startAt("e");
                        listener = queryRef.on("child_added", () => {

                            throw new Error("Should not be called.");
                        });
                        return mockRef.update({ d: 4 });
                    })
                    .then(() => {

                        queryRef.off("child_added", listener);
                    });
            });

            it("should support forced errors", (callback) => {

                database.content["path"]["to"]["data"][".error"] = "Boom!";

                mockRef.on("child_added", (snapshot) => {

                    callback(new Error("Unexpected success."));

                }, (error: Error) => {

                    expect(error).to.match(/Boom!/);
                    callback();
                });
            });

            it("should support forced errors specified on parents", (callback) => {

                database.content["path"][".error"] = "Boom!";

                mockRef.on("child_added", (snapshot) => {

                    callback(new Error("Unexpected success."));

                }, (error: Error) => {

                    expect(error).to.match(/Boom!/);
                    callback();
                });
            });

            it("should support forced errors specified at the root", (callback) => {

                database.content[".error"] = "Boom!";

                mockRef.on("child_added", (snapshot) => {

                    callback(new Error("Unexpected success."));

                }, (error: Error) => {

                    expect(error).to.match(/Boom!/);
                    callback();
                });
            });
        });

        describe("child_changed", () => {

            // This event will be triggered when the data stored in a child (or
            // any of its descendants) changes. Note that a single
            // child_changed event may represent multiple changes to the child.
            // The DataSnapshot passed to the callback will contain the new
            // child contents. For ordering purposes, the callback is also
            // passed a second argument which is a string containing the key of
            // the previous sibling child by priority order (or null if it is
            // the first child).

            it("should listen to set", (callback) => {

                mockRef.on("child_changed", (snapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot.key).to.equal("question");
                    expect(snapshot.val()).to.equal("why?");
                    callback();
                });

                mockRef.child("question").set("why?");
            });

            it("should listen to update", (callback) => {

                mockRef.on("child_changed", (snapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot.key).to.equal("question");
                    expect(snapshot.val()).to.equal("why?");
                    callback();
                });

                mockRef.update({ question: "why?" });
            });

            it("should not fire for non-matching queries", () => {

                let queryRef: firebase.database.Query;
                let listener: (snapshot: firebase.database.DataSnapshot, prevKey?: string) => any;

                return mockRef
                    .set({ a: 1, b: 2, c: 3 })
                    .then(() => {

                        queryRef = mockRef.orderByKey().startAt("e");
                        listener = queryRef.on("child_changed", () => {

                            throw new Error("Should not be called.");
                        });
                        return mockRef.update({ b: 0 });
                    })
                    .then(() => {

                        queryRef.off("child_changed", listener);
                    });
            });
        });

        describe("child_moved", () => {

            // This event will be triggered when a child's priority changes
            // such that its position relative to its siblings changes. The
            // DataSnapshot passed to the callback will be for the data of the
            // child that has moved. It is also passed a second argument which
            // is a string containing the key of the previous sibling child by
            // priority order (or null if it is the firstchild).
        });

        describe("child_removed", () => {

            // This event will be triggered once every time a child is removed.
            // The DataSnapshot passed into the callback will be the old data
            // for the child that was removed. A child will get removed when
            // either:
            //
            // - a client explicitly calls remove() on that child or one of its
            //   ancestors
            // - a client calls set(null) on that child or one of its ancestors
            // - that child has all of its children removed
            // - there is a query in effect which now filters out the child
            //   (because it's priority changed or the max limit was hit)

            it("should listen to remove", (callback) => {

                mockRef.on("child_removed", (snapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot.key).to.equal("answer");
                    expect(snapshot.val()).to.equal(42);
                    callback();
                });

                mockRef.child("answer").remove();
            });

            it("should listen to set", (callback) => {

                mockRef.on("child_removed", (snapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot.key).to.equal("answer");
                    expect(snapshot.val()).to.equal(42);
                    callback();
                });

                mockRef.set({ question: "why?" });
            });

            it("should listen to update", (callback) => {

                mockRef.on("child_removed", (snapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot.key).to.equal("answer");
                    expect(snapshot.val()).to.equal(42);
                    callback();
                });

                mockRef.update({ answer: null });
            });

            it("should not fire for non-matching queries", () => {

                let queryRef: firebase.database.Query;
                let listener: (snapshot: firebase.database.DataSnapshot, prevKey?: string) => any;

                return mockRef
                    .set({ a: 1, b: 2, c: 3 })
                    .then(() => {

                        queryRef = mockRef.orderByKey().startAt("e");
                        listener = queryRef.on("child_removed", () => {

                            throw new Error("Should not be called.");
                        });
                        return mockRef.update({ b: null });
                    })
                    .then(() => {

                        queryRef.off("child_removed", listener);
                    });
            });
        });
    });

    describe("once", () => {

        describe("value", () => {

            it("should support value events and callbacks", (callback) => {

                mockRef.once("value", (snapshot, prevKey) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.have.property("key");
                    expect(snapshot).to.have.property("ref");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.not.equal(database.content["path"]["to"]["data"]);
                    expect(snapshot.val()).to.deep.equal(database.content["path"]["to"]["data"]);
                    callback();
                });
            });

            it("should support value events and promises", () => {

                return mockRef
                    .once("value")
                    .then((snapshot) => {

                        expect(snapshot).to.be.an("object");
                        expect(snapshot).to.have.property("key");
                        expect(snapshot).to.have.property("ref");
                        expect(snapshot).to.respondTo("val");
                        expect(snapshot.val()).to.not.equal(database.content["path"]["to"]["data"]);
                        expect(snapshot.val()).to.deep.equal(database.content["path"]["to"]["data"]);
                    });
            });

            it("should support absolute paths", () => {

                mockRef = mock.database().ref(`https://mock.firebaseio.com/${path}`) as any;
                return mockRef
                    .once("value")
                    .then((snapshot) => {

                        expect(snapshot).to.be.an("object");
                        expect(snapshot).to.have.property("key");
                        expect(snapshot).to.have.property("ref");
                        expect(snapshot).to.respondTo("val");
                        expect(snapshot.val()).to.not.equal(database.content["path"]["to"]["data"]);
                        expect(snapshot.val()).to.deep.equal(database.content["path"]["to"]["data"]);
                    });
            });

            it("should support the root ref", () => {

                mockRef = mock.database().ref() as any;

                return mockRef
                    .once("value")
                    .then((snapshot) => {

                        expect(snapshot).to.be.an("object");
                        expect(snapshot).to.have.property("key");
                        expect(snapshot).to.have.property("ref");
                        expect(snapshot).to.respondTo("val");
                        expect(snapshot.val()).to.not.equal(database.content);
                        expect(snapshot.val()).to.deep.equal(database.content);
                    });
            });

            it("should support forced errors", () => {

                database.content["path"]["to"]["data"][".error"] = "Boom!";

                return mockRef
                    .once("value")
                    .then((snapshot) => {

                        throw new Error("Unexpected success.");
                    })
                    .catch((error) => {

                        expect(error).to.match(/Boom!/);
                    });
            });

            it("should support forced errors specified on parents", () => {

                database.content["path"][".error"] = "Boom!";

                return mockRef
                    .once("value")
                    .then((snapshot) => {

                        throw new Error("Unexpected success.");
                    })
                    .catch((error) => {

                        expect(error).to.match(/Boom!/);
                    });
            });

            it("should support forced errors specified at the root", () => {

                database.content[".error"] = "Boom!";

                return mockRef
                    .once("value")
                    .then((snapshot) => {

                        throw new Error("Unexpected success.");
                    })
                    .catch((error) => {

                        expect(error).to.match(/Boom!/);
                    });
            });
        });
    });

    describe("parent", () => {

        it("should be the ref's parent", () => {

            expect(mockRef.parent).to.be.an("object");
            expect(mockRef.parent).to.have.property("key", "to");
        });
    });

    describe("push", () => {

        let sequenceRef: firebase.database.Reference;

        beforeEach(() => {

            database.content["path"]["to"]["data"]["sequence"] = {};
            sequenceRef = mockRef.child("sequence");
        });

        it("should push a value", () => {

            const pushedRef = sequenceRef.push({
                name: "alice"
            });

            expect(pushedRef).to.be.an("object");
            expect(pushedRef).to.respondTo("then");

            return pushedRef
                .then(() => {

                    return pushedRef.once("value") as PromiseLike<any>;
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({ name: "alice" });
                });
        });

        it("should push values with sequential keys", () => {

            const pushedRefs: firebase.database.ThenableReference[] = [];

            pushedRefs.push(sequenceRef.push({
                name: "alice"
            }));
            pushedRefs.push(sequenceRef.push({
                name: "bob"
            }));

            expect((pushedRefs[0].key as string) < (pushedRefs[1].key as string)).to.be.true;

            return Promise.all(pushedRefs);
        });

        it("should support the root ref", () => {

            mockRef = mock.database().ref() as any;
            const pushedRef = mockRef.push({
                name: "alice"
            });

            expect(pushedRef).to.be.an("object");
            expect(pushedRef).to.respondTo("then");

            return pushedRef
                .then(() => {

                    return pushedRef.once("value") as PromiseLike<any>;
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({ name: "alice" });
                    expect(database.content).to.have.property(pushedRef.key as string);
                    expect(database.content[pushedRef.key as string]).to.not.equal(snapshot.val());
                });
        });

        it("should return a ThenableReference that resolves to a Reference", () => {

            const pushedRef = sequenceRef.push({
                name: "alice"
            });

            return pushedRef
                .then((ref) => {

                    expect(ref.toString()).to.equal(pushedRef.toString());
                });
        });

        it("should be callable with no arguments", () => {

            const pushedRef = sequenceRef.push();

            expect(pushedRef).to.be.an("object");
            expect(pushedRef).to.have.property("key");
            expect(database.content["path"]["to"]["data"]["sequence"]).to.deep.equal({});
        });

        it("should be callable with undefined", () => {

            const pushedRef = sequenceRef.push(undefined);

            expect(pushedRef).to.be.an("object");
            expect(pushedRef).to.have.property("key");
            expect(database.content["path"]["to"]["data"]["sequence"]).to.deep.equal({});
        });

        it("should support a callback", () => {

            let called = false;

            return sequenceRef
                .push({ name: "alice" }, () => called = true)
                .then(() => {

                    expect(called).to.be.true;
                });
        });

        it("should support forced errors", () => {

            database.content["path"]["to"]["data"]["sequence"][".error"] = "Boom!";

            const pushedRef = sequenceRef.push({ name: "alice" });
            return asPromise(pushedRef)
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });

        it("should support forced errors specified on parents", () => {

            database.content["path"][".error"] = "Boom!";

            const pushedRef = sequenceRef.push({ name: "alice" });
            return asPromise(pushedRef)
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });

        it("should support forced errors specified at the root", () => {

            database.content[".error"] = "Boom!";

            const pushedRef = sequenceRef.push({ name: "alice" });
            return asPromise(pushedRef)
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });
    });

    describe("queries", () => {

        beforeEach(() => {

            /*tslint:disable:object-literal-sort-keys*/
            database.content["path"]["to"]["data"] = {
                "-zzzzzzz000000000002": { name: "two", value: 2 },
                "-zzzzzzz000000000000": { name: "zero", value: 0 },
                "-zzzzzzz000000000001": { name: "one", value: 1 }
            };
            /*tslint:enable:object-literal-sort-keys*/
        });

        describe("endAt", () => {

            it("should query by key", (callback) => {

                const queryRef = mockRef.orderByKey().endAt("-zzzzzzz000000000001");
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");

                    expect(snapshot.val()).to.deep.equal({
                        "-zzzzzzz000000000000": database.content["path"]["to"]["data"]["-zzzzzzz000000000000"],
                        "-zzzzzzz000000000001": database.content["path"]["to"]["data"]["-zzzzzzz000000000001"]
                    });
                    callback();
                });
            });

            it("should query by child", (callback) => {

                const queryRef = mockRef.orderByChild("value").endAt(1);
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.deep.equal({
                        "-zzzzzzz000000000000": database.content["path"]["to"]["data"]["-zzzzzzz000000000000"],
                        "-zzzzzzz000000000001": database.content["path"]["to"]["data"]["-zzzzzzz000000000001"]
                    });
                    callback();
                });
            });

            it("should query by child and support the optional key parameter", (callback) => {

                /*tslint:disable:object-literal-sort-keys*/
                database.content["path"]["to"]["data"] = {
                    "-zzzzzzz000000000002": { name: "onetwo", value: 1 },
                    "-zzzzzzz000000000003": { name: "zerothree", value: 0 },
                    "-zzzzzzz000000000001": { name: "one", value: 1 }
                };
                /*tslint:enable:object-literal-sort-keys*/

                const queryRef = mockRef.orderByChild("value").endAt(1, "-zzzzzzz000000000001");
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.deep.equal({
                        "-zzzzzzz000000000001": database.content["path"]["to"]["data"]["-zzzzzzz000000000001"],
                        "-zzzzzzz000000000003": database.content["path"]["to"]["data"]["-zzzzzzz000000000003"]
                    });
                    callback();
                });
            });
        });

        describe("equalTo", () => {

            it("should query by key", (callback) => {

                const queryRef = mockRef.orderByKey().equalTo("-zzzzzzz000000000000");
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.deep.equal({
                        "-zzzzzzz000000000000": database.content["path"]["to"]["data"]["-zzzzzzz000000000000"]
                    });
                    callback();
                });
            });

            it("should query by child", (callback) => {

                const queryRef = mockRef.orderByChild("value").equalTo(0);
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.deep.equal({
                        "-zzzzzzz000000000000": database.content["path"]["to"]["data"]["-zzzzzzz000000000000"]
                    });
                    callback();
                });
            });

            it("should query by child and support the optional key parameter", (callback) => {

                /*tslint:disable:object-literal-sort-keys*/
                database.content["path"]["to"]["data"] = {
                    "-zzzzzzz000000000002": { name: "onetwo", value: 1 },
                    "-zzzzzzz000000000000": { name: "zero", value: 0 },
                    "-zzzzzzz000000000001": { name: "one", value: 1 }
                };
                /*tslint:enable:object-literal-sort-keys*/

                const queryRef = mockRef.orderByChild("value").equalTo(1, "-zzzzzzz000000000002");
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.deep.equal({
                        "-zzzzzzz000000000002": database.content["path"]["to"]["data"]["-zzzzzzz000000000002"]
                    });
                    callback();
                });
            });

            it("should support missing children", (callback) => {

                const queryRef = mockRef.orderByChild("missing").equalTo(null);
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.deep.equal({
                        "-zzzzzzz000000000000": database.content["path"]["to"]["data"]["-zzzzzzz000000000000"],
                        "-zzzzzzz000000000001": database.content["path"]["to"]["data"]["-zzzzzzz000000000001"],
                        "-zzzzzzz000000000002": database.content["path"]["to"]["data"]["-zzzzzzz000000000002"]
                    });
                    callback();
                });
            });
        });

        describe("limitToFirst", () => {

            it("should limit initial queries", (callback) => {

                const previousKeys: (string | null)[] = [];
                const values: MockValue[] = [];

                const queryRef = mockRef.orderByKey().limitToFirst(2);
                queryRef.on("child_added", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");

                    values.push(snapshot.val());
                    previousKeys.push(previousKey as string);

                    if (values.length === 2) {
                        expect(values).to.deep.equal([
                            { name: "zero", value: 0 },
                            { name: "one", value: 1 }
                        ]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000000"
                        ]);
                        callback();
                    }
                });
            });

            it("should limit updated queries", (callback) => {

                const previousKeys: (string | null)[] = [];
                const removedKeys: string[] = [];
                const values: MockValue[] = [];

                const queryRef = mockRef.orderByKey().limitToFirst(2);
                queryRef.on("child_added", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    values.push(snapshot.val());
                    previousKeys.push(previousKey as string);

                    if (snapshot.val().value === 2) {
                        expect(values).to.deep.equal([
                            { name: "zero", value: 0 },
                            { name: "one", value: 1 },
                            { name: "two", value: 2 }
                        ]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000000",
                            "-zzzzzzz000000000001"
                        ]);
                        expect(removedKeys).to.deep.equal([
                            "-zzzzzzz000000000000"
                        ]);
                        callback();
                    }
                });
                queryRef.on("child_removed", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    removedKeys.push(snapshot.key as string);
                });
                mockRef.child("-zzzzzzz000000000000").remove().catch(callback);
            });
        });

        describe("limitToLast", () => {

            it("should limit initial queries", (callback) => {

                const previousKeys: (string | null)[] = [];
                const values: MockValue[] = [];

                const queryRef = mockRef.orderByKey().limitToLast(2);
                queryRef.on("child_added", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");

                    values.push(snapshot.val());
                    previousKeys.push(previousKey as string);

                    if (values.length === 2) {
                        expect(values).to.deep.equal([
                            { name: "one", value: 1 },
                            { name: "two", value: 2 }
                        ]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000001"
                        ]);
                        callback();
                    }
                });
            });

            it("should limit updated queries", (callback) => {

                const previousKeys: string[] = [];
                const removedKeys: string[] = [];
                const values: MockValue[] = [];

                const queryRef = mockRef.orderByKey().limitToLast(2);
                queryRef.on("child_added", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    values.push(snapshot.val());
                    previousKeys.push(previousKey as string);

                    if (snapshot.val().value === 3) {
                        expect(values).to.deep.equal([
                            { name: "one", value: 1 },
                            { name: "two", value: 2 },
                            { name: "three", value: 3 }
                        ]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000001",
                            "-zzzzzzz000000000002"
                        ]);
                        expect(removedKeys).to.deep.equal([
                            "-zzzzzzz000000000001"
                        ]);
                        callback();
                    }
                });
                queryRef.on("child_removed", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    removedKeys.push(snapshot.key as string);
                });
                mockRef.update({
                    "-zzzzzzz000000000003": { name: "three", value: 3 }
                }).catch(callback);
            });
        });

        describe("orderByChild", () => {

            beforeEach(() => {

                /*tslint:disable:object-literal-sort-keys*/
                database.content["path"]["to"]["data"] = {
                    "-zzzzzzz000000000002": { deep: { value: "w" }, name: "two", value: "a" },
                    "-zzzzzzz000000000000": { deep: { value: "x" }, name: "zero", value: "c" },
                    "-zzzzzzz000000000001": { deep: { value: "y" }, name: "one", value: "b" }
                };
                /*tslint:enable:object-literal-sort-keys*/
            });

            it("should order initial queries by child", (callback) => {

                const previousKeys: string[] = [];
                const values: MockValue[] = [];

                const queryRef = mockRef.orderByChild("value");
                queryRef.on("child_added", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");

                    values.push(snapshot.val());
                    previousKeys.push(previousKey as string);

                    if (values.length === 3) {
                        expect(values).to.deep.equal([
                            { deep: { value: "w" }, name: "two", value: "a" },
                            { deep: { value: "y" }, name: "one", value: "b" },
                            { deep: { value: "x" }, name: "zero", value: "c" }
                        ]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000002",
                            "-zzzzzzz000000000001"
                        ]);
                        callback();
                    }
                });
            });

            it("should order updated queries by child", (callback) => {

                const previousKeys: string[] = [];
                const values: MockValue[] = [];

                const queryRef = mockRef.orderByChild("value");
                queryRef.on("child_added", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");

                    values.push(snapshot.val());
                    previousKeys.push(previousKey as string);

                    if (values.length === 3) {
                        expect(values).to.deep.equal([
                            { deep: { value: "w" }, name: "two", value: "a" },
                            { deep: { value: "y" }, name: "one", value: "b" },
                            { deep: { value: "x" }, name: "zero", value: "c" }
                        ]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000002",
                            "-zzzzzzz000000000001"
                        ]);
                    } else if (values.length === 4) {
                        expect(values).to.deep.equal([
                            { deep: { value: "w" }, name: "two", value: "a" },
                            { deep: { value: "y" }, name: "one", value: "b" },
                            { deep: { value: "x" }, name: "zero", value: "c" },
                            { deep: { value: "z" }, name: "three", value: "d" }
                        ]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000002",
                            "-zzzzzzz000000000001",
                            "-zzzzzzz000000000000"
                        ]);
                        callback();
                    }
                });
                const pushedRef = mockRef.push({ deep: { value: "z" }, name: "three", value: "d" });
                asPromise(pushedRef).catch(callback);
            });

            it("should order using 'value' and 'forEach'", (callback) => {

                const queryRef = mockRef.orderByChild("value");
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    const values: MockValue[] = [];

                    snapshot.forEach((childSnapshot: firebase.database.DataSnapshot) => {

                        values.push(childSnapshot.val());
                        return false;
                    });

                    expect(values).to.deep.equal([
                        { deep: { value: "w" }, name: "two", value: "a" },
                        { deep: { value: "y" }, name: "one", value: "b" },
                        { deep: { value: "x" }, name: "zero", value: "c" }
                    ]);
                    callback();
                });
            });

            it("should support deep-child queries", (callback) => {

                // See the 'Ordering queries by deep paths' section of this
                // blog post:
                // https://firebase.googleblog.com/2015/09/introducing-multi-location-updates-and_86.html

                const queryRef = mockRef.orderByChild("deep/value");
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    const values: MockValue[] = [];

                    snapshot.forEach((childSnapshot: firebase.database.DataSnapshot) => {

                        values.push(childSnapshot.val());
                        return false;
                    });

                    expect(values).to.deep.equal([
                        { deep: { value: "w" }, name: "two", value: "a" },
                        { deep: { value: "x" }, name: "zero", value: "c" },
                        { deep: { value: "y" }, name: "one", value: "b" }
                    ]);
                    callback();
                });
            });
        });

        describe("orderByKey", () => {

            it("should order initial queries by key", (callback) => {

                const previousKeys: string[] = [];
                const values: MockValue[] = [];

                const queryRef = mockRef.orderByKey();
                queryRef.on("child_added", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");

                    values.push(snapshot.val());
                    previousKeys.push(previousKey as string);

                    if (values.length === 3) {
                        expect(values).to.deep.equal([
                            { name: "zero", value: 0 },
                            { name: "one", value: 1 },
                            { name: "two", value: 2 }
                        ]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000000",
                            "-zzzzzzz000000000001"
                        ]);
                        callback();
                    }
                });
            });

            it("should order updated queries by key", (callback) => {

                const previousKeys: string[] = [];
                const values: MockValue[] = [];

                const queryRef = mockRef.orderByKey();
                queryRef.on("child_added", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");

                    values.push(snapshot.val());
                    previousKeys.push(previousKey as string);

                    if (values.length === 3) {
                        expect(values).to.deep.equal([
                            { name: "zero", value: 0 },
                            { name: "one", value: 1 },
                            { name: "two", value: 2 }
                        ]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000000",
                            "-zzzzzzz000000000001"
                        ]);
                    } else if (values.length === 4) {
                        expect(values).to.deep.equal([
                            { name: "zero", value: 0 },
                            { name: "one", value: 1 },
                            { name: "two", value: 2 },
                            { name: "three", value: 3 }
                        ]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000000",
                            "-zzzzzzz000000000001",
                            null
                        ]);
                        callback();
                    }
                });
                const pushedRef = mockRef.push({ name: "three", value: 3 });
                asPromise(pushedRef).catch(callback);
            });

            it("should order using 'value' and 'forEach'", (callback) => {

                const queryRef = mockRef.orderByKey();
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    const values: MockValue[] = [];

                    snapshot.forEach((childSnapshot: firebase.database.DataSnapshot) => {

                        values.push(childSnapshot.val());
                        return false;
                    });

                    expect(values).to.deep.equal([
                        { name: "zero", value: 0 },
                        { name: "one", value: 1 },
                        { name: "two", value: 2 }
                    ]);
                    callback();
                });
            });
        });

        describe("orderByPriority", () => {
        });

        describe("orderByValue", () => {

            beforeEach(() => {

                /*tslint:disable:object-literal-sort-keys*/
                database.content["path"]["to"]["data"] = {
                    "-zzzzzzz000000000002": 2,
                    "-zzzzzzz000000000000": 0,
                    "-zzzzzzz000000000001": 1
                };
                /*tslint:enable:object-literal-sort-keys*/
            });

            it("should order initial queries by value", (callback) => {

                const previousKeys: string[] = [];
                const values: MockValue[] = [];

                const queryRef = mockRef.orderByValue();
                queryRef.on("child_added", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");

                    values.push(snapshot.val());
                    previousKeys.push(previousKey as string);

                    if (values.length === 3) {
                        expect(values).to.deep.equal([0, 1, 2]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000000",
                            "-zzzzzzz000000000001"
                        ]);
                        callback();
                    }
                });
            });

            it("should order updated queries by value", (callback) => {

                const previousKeys: string[] = [];
                const values: MockValue[] = [];

                const queryRef = mockRef.orderByValue();
                queryRef.on("child_added", (snapshot: firebase.database.DataSnapshot, previousKey) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");

                    values.push(snapshot.val());
                    previousKeys.push(previousKey as string);

                    if (values.length === 3) {
                        expect(values).to.deep.equal([0, 1, 2]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000000",
                            "-zzzzzzz000000000001"
                        ]);
                    } else if (values.length === 4) {
                        expect(values).to.deep.equal([0, 1, 2, 3]);
                        expect(previousKeys).to.deep.equal([
                            null,
                            "-zzzzzzz000000000000",
                            "-zzzzzzz000000000001",
                            "-zzzzzzz000000000002"
                        ]);
                        callback();
                    }
                });
                const pushedRef = mockRef.push(3);
                asPromise(pushedRef).catch(callback);
            });

            it("should order using 'value' and 'forEach'", (callback) => {

                const queryRef = mockRef.orderByValue();
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    const values: MockValue[] = [];

                    snapshot.forEach((childSnapshot: firebase.database.DataSnapshot) => {

                        values.push(childSnapshot.val());
                        return false;
                    });

                    expect(values).to.deep.equal([0, 1, 2]);
                    callback();
                });
            });
        });

        describe("startAt", () => {

            it("should query by key", (callback) => {

                const queryRef = mockRef.orderByKey().startAt("-zzzzzzz000000000001");
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.deep.equal({
                        "-zzzzzzz000000000001": database.content["path"]["to"]["data"]["-zzzzzzz000000000001"],
                        "-zzzzzzz000000000002": database.content["path"]["to"]["data"]["-zzzzzzz000000000002"]
                    });
                    callback();
                });
            });

            it("should query by child", (callback) => {

                const queryRef = mockRef.orderByChild("value").startAt(1);
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.deep.equal({
                        "-zzzzzzz000000000001": database.content["path"]["to"]["data"]["-zzzzzzz000000000001"],
                        "-zzzzzzz000000000002": database.content["path"]["to"]["data"]["-zzzzzzz000000000002"]
                    });
                    callback();
                });
            });

            it("should query by child and support the optional key parameter", (callback) => {

                /*tslint:disable:object-literal-sort-keys*/
                database.content["path"]["to"]["data"] = {
                    "-zzzzzzz000000000002": { name: "onetwo", value: 1 },
                    "-zzzzzzz000000000000": { name: "threezero", value: 3 },
                    "-zzzzzzz000000000001": { name: "one", value: 1 }
                };
                /*tslint:enable:object-literal-sort-keys*/

                const queryRef = mockRef.orderByChild("value").startAt(1, "-zzzzzzz000000000002");
                queryRef.on("value", (snapshot: firebase.database.DataSnapshot) => {

                    expect(snapshot).to.be.an("object");
                    expect(snapshot).to.respondTo("val");
                    expect(snapshot.val()).to.deep.equal({
                        "-zzzzzzz000000000000": database.content["path"]["to"]["data"]["-zzzzzzz000000000000"],
                        "-zzzzzzz000000000002": database.content["path"]["to"]["data"]["-zzzzzzz000000000002"]
                    });
                    callback();
                });
            });
        });
    });

    describe("ref", () => {

        it("should be the ref itself for non-queries", () => {

            expect(mockRef.ref).to.be.an("object");
            expect(mockRef.ref).to.equal(mockRef);
        });

        it("should be a ref for queries", () => {

            const query = mockRef.limitToFirst(1);
            const queryRef: MockRef = query.ref as any;

            expect(queryRef).to.be.an("object");
            expect(queryRef).to.not.equal(query);
            expect(queryRef.queried_).to.be.false;
        });
    });

    describe("remove", () => {

        it("should remove the ref's value", () => {

            return mockRef
                .remove()
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.exists()).to.be.false;
                    expect(database.content).to.deep.equal({});
                });
        });

        it("should support the root ref", () => {

            mockRef = mock.database().ref() as any;

            return mockRef
                .remove()
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({});
                    expect(database.content).to.deep.equal({});
                    expect(database.content).to.not.equal(snapshot.val());
                });
        });

        it("should do nothing if the key does not exist", () => {

            delete database.content["path"];

            return mockRef
                .remove()
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.exists()).to.be.false;
                });
        });

        it("should remove parents with no children", () => {

            return mockRef
                .remove()
                .then(() => {

                    return mock.database().ref().once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({});
                    expect(database.content).to.deep.equal({});
                    expect(database.content).to.not.equal(snapshot.val());
                });
        });

        it("should support a callback", () => {

            let called = false;

            return mockRef
                .remove(() => called = true)
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(called).to.be.true;
                });
        });

        it("should support forced errors", () => {

            database.content["path"]["to"]["data"][".error"] = "Boom!";

            return mockRef
                .remove()
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });

        it("should support forced errors specified on parents", () => {

            database.content["path"][".error"] = "Boom!";

            return mockRef
                .remove()
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });

        it("should support forced errors specified at the root", () => {

            database.content[".error"] = "Boom!";

            return mockRef
                .remove()
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });
    });

    describe("root", () => {

        it("should be the ref's root", () => {

            expect(mockRef.root).to.be.an("object");
            expect(mockRef.root).to.have.property("key", null);
            expect(mockRef.root).to.have.property("parent", null);
        });
    });

    describe("set", () => {

        it("should set the ref's value", () => {

            return mockRef
                .set({ modifed: true })
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({ modifed: true });
                    expect(database.content["path"]["to"]["data"]).to.deep.equal({ modifed: true });
                    expect(database.content["path"]["to"]["data"]).to.not.equal(snapshot.val());
                });
        });

        it("should support the root ref", () => {

            mockRef = mock.database().ref() as any;

            return mockRef
                .set({ name: "alice" })
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({ name: "alice" });
                    expect(database.content).to.deep.equal({ name: "alice" });
                    expect(database.content).to.not.equal(snapshot.val());
                });
        });

        it("should throw an error for keys with invalid characters", () => {

            return mockRef
                .set({ some: { "illegal.$key": true } })
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/illegal character/i);
                });
        });

        it("should support a callback", () => {

            let called = false;

            return mockRef
                .set({ modifed: true }, () => called = true)
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(called).to.be.true;
                });
        });

        it("should support forced errors", () => {

            database.content["path"]["to"]["data"][".error"] = "Boom!";

            return mockRef
                .set({ modifed: true })
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });

        it("should support forced errors specified on parents", () => {

            database.content["path"][".error"] = "Boom!";

            return mockRef
                .set({ modifed: true })
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });

        it("should support forced errors specified at the root", () => {

            database.content[".error"] = "Boom!";

            return mockRef
                .set({ modifed: true })
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });
    });

    describe("stats_", () => {

        it("should track the number of listeners", () => {

            let stats = mockRef.stats_();
            expect(stats.listeners).to.deep.equal({
                child_added: 0,
                child_changed: 0,
                child_moved: 0,
                child_removed: 0,
                total: 0,
                value: 0
            });

            mockRef.on("child_added", () => {});
            mockRef.on("child_removed", () => {});

            stats = mockRef.stats_();
            expect(stats.listeners).to.deep.equal({
                child_added: 1,
                child_changed: 0,
                child_moved: 0,
                child_removed: 1,
                total: 2,
                value: 0
            });

            mockRef.off("child_added");
            mockRef.off("child_removed");

            stats = mockRef.stats_();
            expect(stats.listeners).to.deep.equal({
                child_added: 0,
                child_changed: 0,
                child_moved: 0,
                child_removed: 0,
                total: 0,
                value: 0
            });
        });
    });

    describe("toString", () => {

        it("should return the URL", () => {

            expect(mockRef.toString()).to.equal("https://mocha-cartant.firebaseio.com/path/to/data");
        });
    });

    describe("transaction", () => {

        it("should update the ref's value", () => {

            return mockRef
                .transaction((value) => {

                    return { transacted: true };
                })
                .then(({ committed, snapshot }) => {

                    expect(committed).to.be.true;
                    expect(snapshot.val()).to.deep.equal({ transacted: true });
                    expect(database.content["path"]["to"]["data"]).to.deep.equal({ transacted: true });
                    expect(database.content["path"]["to"]["data"]).to.not.equal(snapshot.val());
                });
        });

        it("should do nothing if undefined is returned", () => {

            const originalValue = json.clone(database.content["path"]["to"]["data"]);

            return mockRef
                .transaction((value) => {

                    // https://github.com/palantir/tslint/issues/2812
                    // tslint:disable-next-line
                    return undefined;
                })
                .then(({ committed, snapshot }) => {

                    expect(committed).to.be.false;
                    expect(snapshot.val()).to.deep.equal(originalValue);
                    expect(database.content["path"]["to"]["data"]).to.deep.equal(originalValue);
                    expect(database.content["path"]["to"]["data"]).to.not.equal(snapshot.val());
                });
        });

        it("should not mutate the mock's content", () => {

            const originalValue = json.clone(database.content["path"]["to"]["data"]);

            return mockRef
                .transaction((value) => {

                    value.answer = "mutated";
                    value.question = "mutated";

                    // https://github.com/palantir/tslint/issues/2812
                    // tslint:disable-next-line
                    return undefined;
                })
                .then(({ committed, snapshot }) => {

                    expect(committed).to.be.false;
                    expect(snapshot.val()).to.deep.equal(originalValue);
                    expect(database.content["path"]["to"]["data"]).to.deep.equal(originalValue);
                    expect(database.content["path"]["to"]["data"]).to.not.equal(snapshot.val());
                });
        });

        it("should support the root ref", () => {

            mockRef = mock.database().ref() as any;

            return mockRef
                .transaction((value) => {

                    return { transacted: true };
                })
                .then(({ committed, snapshot }) => {

                    expect(committed).to.be.true;
                    expect(snapshot.val()).to.deep.equal({ transacted: true });
                    expect(database.content).to.deep.equal({ transacted: true });
                    expect(database.content).to.not.equal(snapshot.val());
                });
        });
    });

    describe("update", () => {

        it("should update the ref's value", () => {

            return mockRef
                .update({ modifed: true })
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({
                        answer: 42,
                        modifed: true,
                        question: "what do you get if you multiply six by nine?"
                    });
                    expect(database.content["path"]["to"]["data"]).to.deep.equal({
                        answer: 42,
                        modifed: true,
                        question: "what do you get if you multiply six by nine?"
                    });
                    expect(database.content["path"]["to"]["data"]).to.not.equal(snapshot.val());
                });
        });

        it("should support the root ref", () => {

            mockRef = mock.database().ref() as any;

            return mockRef
                .update({ name: "alice" })
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({
                        name: "alice",
                        path: {
                            to: {
                                data: {
                                    answer: 42,
                                    question: "what do you get if you multiply six by nine?"
                                }
                            }
                        }
                    });
                    expect(database.content).to.deep.equal({
                        name: "alice",
                        path: {
                            to: {
                                data: {
                                    answer: 42,
                                    question: "what do you get if you multiply six by nine?"
                                }
                            }
                        }
                    });
                    expect(database.content).to.not.equal(snapshot.val());
                });
        });

        it("should support relative paths", () => {

            // https://firebase.google.com/docs/reference/js/firebase.database.Reference#update
            //
            // The values argument contains multiple property/value pairs that
            // will be written to the database together. Each child property
            // can either be a simple property (for example, "name"), or a
            // relative path (for example, "name/first") from the current
            // location to the data to update.

            const rootRef: MockRef = mock.database().ref();

            return rootRef
                .update({
                    "path/to/data/answer": 54,
                    "path/to/data/modified": true
                })
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({
                        answer: 54,
                        modified: true,
                        question: "what do you get if you multiply six by nine?"
                    });
                    expect(database.content["path"]["to"]["data"]).to.deep.equal({
                        answer: 54,
                        modified: true,
                        question: "what do you get if you multiply six by nine?"
                    });
                    expect(database.content["path"]["to"]["data"]).to.not.equal(snapshot.val());
                });
        });

        it("should support relative paths that don't yet exist", () => {

            return mockRef
                .update({
                    "the/wrong/answer": 54
                })
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({
                        answer: 42,
                        question: "what do you get if you multiply six by nine?",
                        the: { wrong: { answer: 54 } }
                    });
                    expect(database.content["path"]["to"]["data"]).to.deep.equal({
                        answer: 42,
                        question: "what do you get if you multiply six by nine?",
                        the: { wrong: { answer: 54 } }
                    });
                    expect(database.content["path"]["to"]["data"]).to.not.equal(snapshot.val());
                });
        });

        it("should throw an error for keys with invalid characters", () => {

            return mockRef
                .update({ some: { "illegal.$key": true } })
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/illegal character/i);
                });
        });

        it("should support value removal", () => {

            return mockRef
                .update({ answer: null })
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({
                        question: "what do you get if you multiply six by nine?"
                    });
                    expect(database.content["path"]["to"]["data"]).to.deep.equal({
                        question: "what do you get if you multiply six by nine?"
                    });
                    expect(database.content["path"]["to"]["data"]).to.not.equal(snapshot.val());
                });
        });

        it("should support relative path value removal", () => {

            const rootRef: MockRef = mock.database().ref();

            return rootRef
                .update({
                    "path/to/data/answer": null
                })
                .then(() => {

                    return mockRef.once("value");
                })
                .then((snapshot) => {

                    expect(snapshot.val()).to.deep.equal({
                        question: "what do you get if you multiply six by nine?"
                    });
                    expect(database.content["path"]["to"]["data"]).to.deep.equal({
                        question: "what do you get if you multiply six by nine?"
                    });
                    expect(database.content["path"]["to"]["data"]).to.not.equal(snapshot.val());
                });
        });

        it("should support a callback", () => {

            let called = false;

            return mockRef
                .update({ modifed: true }, () => called = true)
                .then(() => {

                    expect(called).to.be.true;
                });
        });

        it("should support forced errors", () => {

            database.content["path"]["to"]["data"][".error"] = "Boom!";

            return mockRef
                .update({ modifed: true })
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });

        it("should support forced errors specified on parents", () => {

            database.content["path"][".error"] = "Boom!";

            return mockRef
                .update({ modifed: true })
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });

        it("should support forced errors specified at the root", () => {

            database.content[".error"] = "Boom!";

            return mockRef
                .update({ modifed: true })
                .then(() => {

                    throw new Error("Unexpected success.");
                })
                .catch((error) => {

                    expect(error).to.match(/Boom!/);
                });
        });
    });

    describe(".info", () => {

        it("should mock .info", () => {

            const childRef = mockRef.root.child(".info");

            return childRef
                .once("value")
                .then((snapshot) => {

                    expect(snapshot.exists()).to.be.true;
                    expect(snapshot.val()).to.deep.equal({
                        connected: true,
                        serverTimeOffset: 0
                    });
                });
        });
    });
});
