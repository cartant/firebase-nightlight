/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as firebase from "firebase/app";

import { unsupported } from "./mock-error";
import { randomString } from "./text-random-string";

export interface MockUserOptions {
    email?: string;
    uid?: string;
}

export class MockUser implements firebase.User {

    public displayName: string | null;
    public email: string | null;
    public emailVerified: boolean;
    public isAnonymous: boolean;
    public photoURL: string | null;
    public providerData: (firebase.UserInfo | null)[];
    public providerId: string;
    public refreshToken: string;
    public uid: string;

    constructor(options: MockUserOptions) {

        const alphabet = "ABCDEFGHIJKLMONPQRSTUVWXYZabcdefghijklmonpqrstuvwxyz0123456789";
        const email = options.email || null;
        const uid = options.uid || randomString(alphabet, 28);

        this.displayName = email;
        this.email = email;
        this.emailVerified = false;
        this.isAnonymous = false;
        this.photoURL = null;
        this.providerData = [{
            displayName: email,
            email,
            photoURL: null,
            providerId: "password",
            uid
        }];
        this.providerId = "password";
        this.refreshToken = null;
        this.uid = uid;
    }

    delete(): firebase.Promise<any> {

        throw unsupported();
    }

    getToken(forceRefresh?: boolean): firebase.Promise<any> {

        throw unsupported();
    }

    link(credential: firebase.auth.AuthCredential): firebase.Promise<any> {

        throw unsupported();
    }

    linkWithCredential(credential: firebase.auth.AuthCredential): firebase.Promise<any> {

        throw unsupported();
    }

    linkWithPopup(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        throw unsupported();
    }

    linkWithRedirect(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        throw unsupported();
    }

    reauthenticate(credential: firebase.auth.AuthCredential): firebase.Promise<any> {

        throw unsupported();
    }

    reauthenticateWithCredential(credential: firebase.auth.AuthCredential): firebase.Promise<any> {

        throw unsupported();
    }

    reauthenticateWithPopup(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        throw unsupported();
    }

    reauthenticateWithRedirect(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        throw unsupported();
    }

    reload(): firebase.Promise<any> {

        throw unsupported();
    }

    sendEmailVerification(): firebase.Promise<any> {

        throw unsupported();
    }

    toJSON(): Object {

        throw unsupported();
    }

    unlink(providerId: string): firebase.Promise<any> {

        throw unsupported();
    }

    updateEmail(email: string): firebase.Promise<any> {

        throw unsupported();
    }

    updatePassword(password: string): firebase.Promise<any> {

        throw unsupported();
    }

    updateProfile(
        profile: { displayName: string | null, photoURL: string | null }
    ): firebase.Promise<any> {

        throw unsupported();
    }
}
