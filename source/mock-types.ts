/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPLv3 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */
import * as firebase from "firebase/app";

import { EventEmitter2 } from "eventemitter2";

export type MockPrimitive = boolean | number | string;
export type MockComposite = { [key: string]: MockPrimitive | MockComposite };
export type MockValue = MockPrimitive | MockComposite;

export interface MockEmitters {
    shared: { [key: string]: EventEmitter2 };
    root: EventEmitter2;
}

export interface MockIdentity {
    credential?: firebase.auth.AuthCredential;
    email: string;
    password?: string;
    token?: string;
    uid?: string;
}

export interface MockQuery {
    endAt?: MockPrimitive | null;
    equalTo?: MockPrimitive;
    key?: string;
    limitToFirst?: number;
    limitToLast?: number;
    orderByChild?: string;
    orderByKey?: boolean;
    orderByPriority?: boolean;
    orderByValue?: boolean;
    startAt?: MockPrimitive | null;
}

export interface MockRefInternals {
    getContent_(): MockValue;
    getJsonPath_(): string;
    getQuery_(): MockQuery;
    isQuery_(): boolean;
}
