/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "../firebase";
import { MockUntyped as Mock } from "../mock-untyped";
import { MockDataSnapshot } from "./mock-data-snapshot";
import { MockComposite, MockValue } from "./mock-database-types";
import { MockRef } from "./mock-ref";

describe("mock-data-snapshot", () => {

    let database: { content: MockValue };
    let mock: Mock;
    let mockRef: firebase.database.Reference;
    let mockSnapshot: MockDataSnapshot;

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
        const path = "path/to/data";

        mock = new Mock({ database });
        const mockApp = mock.initializeApp({});
        const mockDatabase = mockApp.database();
        mockRef = mock.database().ref(path);
        mockSnapshot = new MockDataSnapshot({ ref: mockRef as MockRef });
    });

    describe("child", () => {

        it("should return a child snapshot", () => {

            const childSnapshot = mockSnapshot.child("answer");

            expect(childSnapshot).to.be.an("object");
            expect(childSnapshot).to.have.property("key", "answer");
            expect(childSnapshot).to.have.property("ref");
        });
    });

    describe("exists", () => {

        it("should return true for existing values", () => {

            expect(mockSnapshot.exists()).to.be.true;
        });

        it("should return false for non-existing values", () => {

            mockSnapshot = new MockDataSnapshot({
                ref: mock.database().ref("missing")
            });
            expect(mockSnapshot.exists()).to.be.false;
        });
    });

    describe("forEach", () => {

        it("should iterate the child snapshots", () => {

            const keys: string[] = [];
            mockSnapshot.forEach((childSnapshot) => {

                expect(childSnapshot).to.be.an("object");
                expect(childSnapshot).to.have.property("key");
                expect(childSnapshot).to.have.property("ref");

                keys.push(childSnapshot.key as string);
                return false;
            });

            expect(keys).to.include("answer");
            expect(keys).to.include("question");
        });
    });

    describe("hasChild", () => {

        it("should return true for existing children", () => {

            expect(mockSnapshot.hasChild("answer")).to.be.true;
        });

        it("should return true for non-existing children", () => {

            expect(mockSnapshot.hasChild("missing")).to.be.false;
        });
    });

    describe("hasChildren", () => {

        it("should determine whether or not the snapshot has children", () => {

            expect(mockSnapshot.hasChildren()).to.be.true;
        });
    });

    describe("key", () => {

        it("should be the key", () => {

            expect(mockSnapshot.key).to.equal("data");
        });
    });

    describe("numChildren", () => {

        it("should return the number of children", () => {

            expect(mockSnapshot.numChildren()).to.equal(2);
        });
    });

    describe("ref", () => {

        it("should be the mock ref", () => {

            expect(mockSnapshot.ref).to.equal(mockRef);
        });
    });

    describe("val", () => {

        it("should return the value", () => {

            const result = mockSnapshot.val();
            const content = database.content as any;

            expect(result).to.not.equal(content.path.to.data);
            expect(result).to.deep.equal(content.path.to.data);
        });
    });

    describe("valueComparer", () => {

        it("should compare non-null values", () => {

            expect(MockDataSnapshot.valueComparer(1, 2)).to.equal(-1);
            expect(MockDataSnapshot.valueComparer(1, 1)).to.equal(0);
            expect(MockDataSnapshot.valueComparer(2, 1)).to.equal(1);
        });

        it("should compare null values", () => {

            expect(MockDataSnapshot.valueComparer(null, -1)).to.equal(-1);
            expect(MockDataSnapshot.valueComparer(null, null)).to.equal(0);
            expect(MockDataSnapshot.valueComparer(-1, null)).to.equal(1);
        });
    });
});
