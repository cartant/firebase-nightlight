/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPLv3 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
/*tslint:disable:no-unused-expression*/

import * as firebase from "firebase/app";

import { expect } from "chai";
import { Mock } from "./mock";
import { MockIdentity } from "./mock-types";

describe("mock-auth", () => {

    let identities: MockIdentity[];
    let mockAuth: firebase.auth.Auth;

    beforeEach(() => {

        identities = [{
            email: "alice@apple.com",
            password: "wonderland"
        }];
        mockAuth = new Mock({ identities }).auth();
    });

    describe("createUserWithEmailAndPassword", () => {

        it("should create the user", () => {

            return mockAuth
                .createUserWithEmailAndPassword("bob@gmail.com", "builder")
                .then(() => {

                    const identity = identities.find((identity) => identity.email === "bob@gmail.com");
                    expect(identity).to.exist;
                    expect(identity).to.have.property("password", "builder");
                });
        });

        it("should sign in the user", () => {

            return mockAuth
                .createUserWithEmailAndPassword("bob@gmail.com", "builder")
                .then(() => {

                    expect(mockAuth.currentUser).to.not.be.null;
                    expect(mockAuth.currentUser).to.have.property("email", "bob@gmail.com");
                });
        });

        it("should throw an error if the email is already in use", () => {

            const promise = mockAuth.createUserWithEmailAndPassword("alice@apple.com", "cooper");

            return expect(promise).to.be.rejectedWith(/already in use/i);
        });
    });

    describe("currentUser", () => {

        it("should be null if not signed in", () => {

            expect(mockAuth.currentUser).to.be.null;
        });

        it("should be non-null if signed in", () => {

            return mockAuth
                .signInWithEmailAndPassword("alice@apple.com", "wonderland")
                .then(() => {

                    expect(mockAuth.currentUser).to.not.be.null;
                    expect(mockAuth.currentUser).to.have.property("email", "alice@apple.com");
                });
        });
    });

    describe("getRedirectResult", () => {

        it("should simulate no-redirect authentication", () => {

            return mockAuth
                .getRedirectResult()
                .then((credentials) => {

                    expect(credentials).to.deep.equal({
                        credential: null,
                        user: null
                    });
                });
        });
    });

    describe("onAuthStateChanged", () => {

        it("should support callbacks", () => {

            let user: firebase.User;

            const unsubscribe = mockAuth.onAuthStateChanged(
                (next: firebase.User) => { user = next; },
                (error) => { throw error; },
                () => {}
            );
            expect(unsubscribe).to.be.a("function");

            return mockAuth
                .signInWithEmailAndPassword("alice@apple.com", "wonderland")
                .then(() => {

                    expect(mockAuth.currentUser).to.not.be.null;
                    expect(mockAuth.currentUser).to.equal(user);
                    return mockAuth.signOut();
                })
                .then(() => {

                    expect(mockAuth.currentUser).to.be.null;
                    expect(mockAuth.currentUser).to.equal(user);
                    unsubscribe();
                });
        });

        it("should support an observer", () => {

            let user: firebase.User;

            const unsubscribe = mockAuth.onAuthStateChanged({
                completed(): void {},
                error(error: any): void { throw error; },
                next(value: firebase.User): void { user = value; }
            });
            expect(unsubscribe).to.be.a("function");

            return mockAuth
                .signInWithEmailAndPassword("alice@apple.com", "wonderland")
                .then(() => {

                    expect(mockAuth.currentUser).to.not.be.null;
                    expect(mockAuth.currentUser).to.equal(user);
                    return mockAuth.signOut();
                })
                .then(() => {

                    expect(mockAuth.currentUser).to.be.null;
                    expect(mockAuth.currentUser).to.equal(user);
                    unsubscribe();
                });
        });
    });

    describe("signInAnonymously", () => {

        it("should sign in anonymously", () => {

            return mockAuth
                .signInAnonymously()
                .then(() => {

                    expect(mockAuth.currentUser).to.not.be.null;
                });
        });
    });

    describe("signInWithCredential", () => {

        let credentials: { [key: string]: firebase.auth.AuthCredential };

        beforeEach(() => {

            credentials = {
                alice: {} as any as firebase.auth.AuthCredential,
                bob: {} as any as firebase.auth.AuthCredential
            };

            identities = [{
                credential: credentials.alice,
                email: "alice@apple.com"
            }];
            mockAuth = new Mock({ identities }).auth();
        });

        it("should sign in the user", () => {

            return mockAuth
                .signInWithCredential(credentials.alice)
                .then(() => {

                    expect(mockAuth.currentUser).to.not.be.null;
                });
        });

        it("should throw an error for an invalid credential", () => {

            const promise = mockAuth.signInWithCredential(credentials.bob);

            return expect(promise).to.be.rejectedWith(/invalid credential/i);
        });
    });

    describe("signInWithCustomToken", () => {

        let tokens: { [key: string]: string };

        beforeEach(() => {

            tokens = {
                alice: "alice",
                bob: "bob"
            };

            identities = [{
                email: "alice@apple.com",
                token: tokens.alice
            }];
            mockAuth = new Mock({ identities }).auth();
        });

        it("should sign in the user", () => {

            return mockAuth
                .signInWithCustomToken(tokens.alice)
                .then(() => {

                    expect(mockAuth.currentUser).to.not.be.null;
                });
        });

        it("should throw an error for an invalid credential", () => {

            const promise = mockAuth.signInWithCustomToken(tokens.bob);

            return expect(promise).to.be.rejectedWith(/invalid token/i);
        });
    });

    describe("signInWithEmailAndPassword", () => {

        it("should sign in the user", () => {

            return mockAuth
                .signInWithEmailAndPassword("alice@apple.com", "wonderland")
                .then(() => {

                    expect(mockAuth.currentUser).to.not.be.null;
                });
        });

        it("should throw an error for an unknown user", () => {

            const promise = mockAuth.signInWithEmailAndPassword("bob@gmail.com", "builder");

            return expect(promise).to.be.rejectedWith(/user not found/i);
        });

        it("should throw an error for an incorrect password", () => {

            const promise = mockAuth.signInWithEmailAndPassword("alice@apple.com", "cooper");

            return expect(promise).to.be.rejectedWith(/wrong password/i);
        });
    });

    describe("signOut", () => {

        it("should sign out the signed in user", () => {

            return mockAuth
                .signInWithEmailAndPassword("alice@apple.com", "wonderland")
                .then(() => {

                    expect(mockAuth.currentUser).to.not.be.null;
                    return mockAuth.signOut();
                })
                .then(() => {

                    expect(mockAuth.currentUser).to.be.null;
                });
        });

        it("should do nothing if not signed in", () => {

            return mockAuth.signOut();
        });
    });
});
