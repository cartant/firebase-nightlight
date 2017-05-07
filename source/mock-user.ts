/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "./firebase";
import { unsupported_ } from "./mock-error";
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
        this.refreshToken = "";
        this.uid = uid;
    }

    delete(): firebase.Promise<any> {

        throw unsupported_();
    }

    getToken(forceRefresh?: boolean): firebase.Promise<any> {

        throw unsupported_();
    }

    link(credential: firebase.auth.AuthCredential): firebase.Promise<any> {

        throw unsupported_();
    }

    linkWithCredential(credential: firebase.auth.AuthCredential): firebase.Promise<any> {

        throw unsupported_();
    }

    linkWithPopup(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        throw unsupported_();
    }

    linkWithRedirect(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        throw unsupported_();
    }

    reauthenticate(credential: firebase.auth.AuthCredential): firebase.Promise<any> {

        throw unsupported_();
    }

    reauthenticateWithCredential(credential: firebase.auth.AuthCredential): firebase.Promise<any> {

        throw unsupported_();
    }

    reauthenticateWithPopup(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        throw unsupported_();
    }

    reauthenticateWithRedirect(provider: firebase.auth.AuthProvider): firebase.Promise<any> {

        throw unsupported_();
    }

    reload(): firebase.Promise<any> {

        throw unsupported_();
    }

    sendEmailVerification(): firebase.Promise<any> {

        throw unsupported_();
    }

    toJSON(): Object {

        throw unsupported_();
    }

    unlink(providerId: string): firebase.Promise<any> {

        throw unsupported_();
    }

    updateEmail(email: string): firebase.Promise<any> {

        throw unsupported_();
    }

    updatePassword(password: string): firebase.Promise<any> {

        throw unsupported_();
    }

    updateProfile(
        profile: { displayName: string | null, photoURL: string | null }
    ): firebase.Promise<any> {

        throw unsupported_();
    }
}
