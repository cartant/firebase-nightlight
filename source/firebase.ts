/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

/* @ifndef ADMIN */
import * as firebase from "firebase/app";
type FirebasePromise<T> = firebase.Promise<T>;
type FirebaseThenable<T> = firebase.Thenable<T>;
/* @endif */
/* @ifdef ADMIN */
import * as firebase from "firebase-admin";
type FirebasePromise<T> = Promise<T>;
type FirebaseThenable<T> = Promise<T>;
/* @endif */

export { firebase, FirebasePromise, FirebaseThenable };
