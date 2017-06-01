/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { EventEmitter2 } from "eventemitter2";
import { firebase } from "./firebase";

export type MockPrimitive = boolean | number | string;
export type MockComposite = { [key: string]: MockPrimitive | MockComposite };
export type MockValue = MockPrimitive | MockComposite;

export interface MockEmitters {
    shared: { [key: string]: EventEmitter2 };
    root: EventEmitter2;
}

export interface MockIdentity {
    /* @ifndef ADMIN */
    credential?: firebase.auth.AuthCredential;
    /* @endif */
    email: string;
    password?: string;
    token?: string;
    uid?: string;
}

export interface MockQuery {
    endAt?: MockPrimitive | null;
    equalTo?: MockPrimitive | null;
    key?: string;
    limitToFirst?: number;
    limitToLast?: number;
    orderByChild?: string;
    orderByKey?: boolean;
    orderByPriority?: boolean;
    orderByValue?: boolean;
    startAt?: MockPrimitive | null;
}

export interface MockRefStats {
    listeners: {
        child_added: number;
        child_changed: number;
        child_moved: number;
        child_removed: number;
        total: number;
        value: number;
    };
}

export interface MockRefInternals {
    readonly content_: MockValue | null;
    readonly jsonPath_: string;
    readonly queried_: boolean;
    readonly query_: MockQuery;
    stats_(): MockRefStats;
}
