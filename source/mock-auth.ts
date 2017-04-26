/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPLv3 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as firebase from "firebase/app";

import { EventEmitter2 } from "eventemitter2";
import { error, unsupported } from "./mock-error";
import { MockIdentity } from "./mock-types";
import { MockUser } from "./mock-user";

export interface MockAuthOptions {
    app: firebase.app.App;
    identities: MockIdentity[];
}

export class MockAuth implements firebase.auth.Auth {

    private app_: firebase.app.App;
    private currentUser_: firebase.User;
    private emitter_: EventEmitter2;
    private identities_: MockIdentity[];

    constructor(options: MockAuthOptions) {

        this.app_ = options.app;
        this.currentUser_ = null;
        this.emitter_ = new EventEmitter2();
        this.identities_ = options.identities;
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    get currentUser(): firebase.User {

        return this.currentUser_;
    }

    applyActionCode(code: string): firebase.Promise <any> {

        throw unsupported();
    }

    checkActionCode(code: string): firebase.Promise <any> {

        throw unsupported();
    }

    confirmPasswordReset(code: string, password: string): firebase.Promise <any> {

        throw unsupported();
    }

    createCustomToken(uid: string, claims?: Object | null): string {

        throw unsupported();
    }

    createUserWithEmailAndPassword(email: string, password: string): firebase.Promise<any> {

        let identity = this.identities_.find((identity) => identity.email === email);
        if (identity) {
            return Promise.reject(error("auth/email-already-in-use", "Email already in use."));
        }

        identity = { email, password };
        this.identities_.push(identity);

        this.currentUser_ = new MockUser({ email });
        this.emitter_.emit("auth", this.currentUser_);

        return Promise.resolve(this.currentUser_);
    }

    fetchProvidersForEmail(email: string): firebase.Promise<any> {

        throw unsupported();
    }

    getRedirectResult(): firebase.Promise<any> {

        return Promise.resolve({
            credential: null,
            user: null
        });
    }

    onAuthStateChanged(
        nextOrObserver: Object,
        errorCallback?: (error: firebase.auth.Error) => any,
        completedCallback?: () => any
    ): () => any {

        let nextCallback: Function;

        if (typeof nextOrObserver === "function") {
            errorCallback = errorCallback || (() => {});
            nextCallback = nextOrObserver;
        } else {
            errorCallback = (error: firebase.auth.Error) => { nextOrObserver["error"](error); };
            nextCallback = (value: firebase.User) => { nextOrObserver["next"](value); };
        }

        this.emitter_.on("auth", nextCallback);
        this.emitter_.on("error", errorCallback);

        return () => {
            this.emitter_.off("auth", nextCallback);
            this.emitter_.off("error", errorCallback);
        };
    }

    sendPasswordResetEmail(email: string): firebase.Promise<any> {

        throw unsupported();
    }

    signInAnonymously(): firebase.Promise<any> {

        this.currentUser_ = new MockUser({ email: null });
        this.emitter_.emit("auth", this.currentUser_);

        return Promise.resolve(this.currentUser_);
    }

    signInWithCredential(credential: firebase.auth.AuthCredential): firebase.Promise<any> {

        let identity = this.identities_.find((identity) => identity.credential === credential);
        if (!identity) {
            return Promise.reject(error("auth/invalid-credential", "Invalid credential."));
        }

        this.currentUser_ = new MockUser({
            email: identity.email,
            uid: identity.uid
        });
        this.emitter_.emit("auth", this.currentUser_);

        return Promise.resolve(this.currentUser_);
    }

    signInWithCustomToken(token: string): firebase.Promise<any> {

        let identity = this.identities_.find((identity) => identity.token === token);
        if (!identity) {
            return Promise.reject(error("auth/invalid-custom-token", "Invalid token."));
        }

        this.currentUser_ = new MockUser({
            email: identity.email,
            uid: identity.uid
        });
        this.emitter_.emit("auth", this.currentUser_);

        return Promise.resolve(this.currentUser_);
    }

    signInWithEmailAndPassword(email: string, password: string): firebase.Promise<any> {

        let identity = this.identities_.find((identity) => identity.email === email);
        if (!identity) {
            return Promise.reject(error("auth/user-not-found", "User not found."));
        }
        if (identity.password !== password) {
            return Promise.reject(error("auth/wrong-password", "Wrong password."));
        }

        this.currentUser_ = new MockUser({
            email: identity.email,
            uid: identity.uid
        });
        this.emitter_.emit("auth", this.currentUser_);

        return Promise.resolve(this.currentUser_);
    }

    signInWithPopup(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        throw unsupported();
    }

    signInWithRedirect(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        throw unsupported();
    }

    signOut(): firebase.Promise<any> {

        this.currentUser_ = null;
        this.emitter_.emit("auth", this.currentUser_);

        return Promise.resolve();
    }

    verifyIdToken(idToken: string): firebase.Promise<any> {

        throw unsupported();
    }

    verifyPasswordResetCode(code: string): firebase.Promise<any> {

        throw unsupported();
    }
}
