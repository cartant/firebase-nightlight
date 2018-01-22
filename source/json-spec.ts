/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import * as json from "./json";

import { expect } from "chai";

describe("json", () => {

    let value: any;

    beforeEach(() => {

        value = {
            people: {
                alice: {
                    age: 32,
                    email: "alice@firebase.com",
                    friends: {
                        bob: true
                    }
                },
                bob: {
                    age: 33,
                    email: "bob@firebase.com",
                    friends: {
                        alice: true
                    }
                }
            }
        };
    });

    describe("clone", () => {

        it("should clone the value", () => {

            const clone = json.clone(value);

            expect(clone).to.deep.equal(value);
            expect(clone).to.not.equal(value);
        });
    });

    describe("get", () => {

        it("should get the value for a path", () => {

            expect(json.get(value, "/people/alice/age")).to.equal(32);
        });

        it("should throw errors for non-existent paths", () => {

            expect(() => json.get(value, "/people/mallory/age")).to.throw(Error);
        });
    });

    describe("has", () => {

        it("should determine whether a path exists", () => {

            expect(json.has(value, "/people/alice/age")).to.be.true;
            expect(json.has(value, "/people/mallory/age")).to.be.false;
        });
    });

    describe("join", () => {

        it("should join paths", () => {

            expect(json.join("a")).to.equal("/a");

            expect(json.join("a", "b", "c", "d")).to.equal("/a/b/c/d");
            expect(json.join("a", "/b", "/c", "/d")).to.equal("/a/b/c/d");
            expect(json.join("a/", "b/", "c/", "d/")).to.equal("/a/b/c/d");

            expect(json.join("", "a", "b", "c", "d")).to.equal("/a/b/c/d");
            expect(json.join("", "a", "/b", "/c", "/d")).to.equal("/a/b/c/d");
            expect(json.join("", "a/", "b/", "c/", "d/")).to.equal("/a/b/c/d");
        });
    });

    describe("prune", () => {

        it("should prune any empty parents", () => {

            let removed = json.remove(value, "/people/alice");
            json.prune(removed, "/people/alice");

            expect(removed.people).to.exist;
            expect(removed.people).to.not.have.property("alice");
            expect(removed.people).to.have.property("bob");

            removed = json.remove(removed, "/people/bob");
            json.prune(removed, "/people/bob");

            expect(removed.people).to.not.exist;
        });
    });

    describe("remove", () => {

        it("should shallow-copy parents on remove", () => {

            const result = json.remove(value, "/people/alice/age");

            expect(result).to.not.equal(value);
            expect(result.people).to.not.equal(value.people);
            expect(result.people.alice).to.not.equal(value.people.alice);
        });

        it("should not shallow-copy siblings on remove", () => {

            const result = json.remove(value, "/people/alice/age");

            expect(result.people.alice.friends).to.equal(value.people.alice.friends);
            expect(result.people.bob).to.equal(value.people.bob);
            expect(result.people.bob.friends).to.equal(value.people.bob.friends);
        });

        it("should do nothing if the path does not exist", () => {

            const result = json.remove(value, "/people/alice/missing");

            expect(result).to.equal(value);
            expect(result.people).to.equal(value.people);
            expect(result.people.alice).to.equal(value.people.alice);
            expect(result.people.alice.friends).to.equal(value.people.alice.friends);
            expect(result.people.bob).to.equal(value.people.bob);
            expect(result.people.bob.friends).to.equal(value.people.bob.friends);
        });
    });

    describe("set", () => {

        it("should shallow-copy parents on set", () => {

            const result = json.set(value, "/people/alice/age", 33);

            expect(result).to.not.equal(value);
            expect(result.people).to.not.equal(value.people);
            expect(result.people.alice).to.not.equal(value.people.alice);
        });

        it("should not shallow-copy siblings on set", () => {

            const result = json.set(value, "/people/alice/age", 33);

            expect(result.people.alice.friends).to.equal(value.people.alice.friends);
            expect(result.people.bob).to.equal(value.people.bob);
            expect(result.people.bob.friends).to.equal(value.people.bob.friends);
        });

        it("should not clone the value being set", () => {

            const result = json.set(value, "/people/alice", value.people.alice);

            expect(result).to.not.equal(value);
            expect(result.people).to.not.equal(value.people);
            expect(result.people.alice).to.equal(value.people.alice);
            expect(result.people.alice.friends).to.equal(value.people.alice.friends);
        });

        it("should do nothing if setting unchanged primitives", () => {

            const result = json.set(value, "/people/alice/age", 32);

            expect(result).to.equal(value);
            expect(result.people).to.equal(value.people);
            expect(result.people.alice).to.equal(value.people.alice);
            expect(result.people.alice.friends).to.equal(value.people.alice.friends);
            expect(result.people.bob).to.equal(value.people.bob);
            expect(result.people.bob.friends).to.equal(value.people.bob.friends);
        });
    });

    describe("slash", () => {

        it("should ensure paths are slashed correctly", () => {

            expect(json.slash("a")).to.equal("/a");
            expect(json.slash("/a")).to.equal("/a");
            expect(json.slash("a/")).to.equal("/a");
            expect(json.slash("/a/")).to.equal("/a");
        });
    });
});
