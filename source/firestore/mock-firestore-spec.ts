/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import { expect } from "chai";
import { firebase } from "../firebase";
import { MockUntyped as Mock } from "../mock-untyped";

describe("mock-firestore", () => {

    let mockFirestore: firebase.firestore.Firestore;

    beforeEach(() => {

        const mock = new Mock({});
        const mockApp = mock.initializeApp({
            databaseURL: "https://nightlight.firebaseio.com"
        });
        mockFirestore = mockApp.database();
    });

    describe("app", () => {

        it("should return a mock app", () => {

            expect(mockFirestore).to.have.property("app");
            expect(mockFirestore.app).to.exist;
        });
    });
});
