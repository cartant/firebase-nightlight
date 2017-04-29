/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as firebase from "firebase/app";
import * as json from "./json";
import * as lodash from "./lodash";

import { unsupported } from "./mock-error";
import { MockPrimitive, MockQuery, MockRefInternals, MockValue } from "./mock-types";

export interface MockPair {
    key: string;
    value: MockValue;
}

export interface MockDataSnapshotOptions {
    content?: MockValue;
    previousContent?: MockValue;
    ref: firebase.database.Reference;
    snapshot?: MockDataSnapshot;
}

export class MockDataSnapshot implements firebase.database.DataSnapshot {

    private content_: MockValue;
    private previousContent_: MockValue;
    private ref_: firebase.database.Reference;
    private refInternals_: MockRefInternals;

    static pairKeyComparer(a: MockPair, b: MockPair): number {

        return (a.key < b.key) ? -1 : (a.key > b.key) ? 1 : 0;
    }

    static pairKeyEquator(a: MockPair, b: MockPair): boolean {

        return a.key === b.key;
    }

    static valueComparer(a: any, b: any): number {

        if (a === null) {
            return (b === null) ? 0 : -1;
        }
        if (b === null) {
            return 1;
        }
        return (a < b) ? -1 : (a > b) ? 1 : 0;
    }

    constructor(options: MockDataSnapshotOptions) {

        this.ref_ = options.ref;
        this.refInternals_ = options.ref as any;

        if (options.snapshot) {
            this.content_ = options.snapshot.content_;
            this.previousContent_ = null;
        } else {
            this.content_ = options.content || this.refInternals_.getContent_();
            this.previousContent_ = options.previousContent || null;
        }
    }

    get key(): string | null {

        return this.ref_.key;
    }

    get ref(): firebase.database.Reference {

        return this.ref_;
    }

    child(path: string): firebase.database.DataSnapshot {

        const nonQueryRef = this.ref_.ref;
        const childRef = nonQueryRef.child(path);

        return new MockDataSnapshot({
            content: this.content_,
            ref: childRef
        });
    }

    exists(): boolean {

        return json.has(this.content_, this.refInternals_.getJsonPath_());
    }

    exportVal(): any {

        throw unsupported();
    }

    forEach(action: (snapshot: firebase.database.DataSnapshot) => boolean): boolean {

        lodash.each(this.pairs_(), (pair) => action(this.child(pair.key)) ? false : undefined);
        return undefined;
    }

    getPriority(): string | number | null {

        throw unsupported();
    }

    hasChild(path: string): boolean {

        return json.has(this.content_, json.join(this.refInternals_.getJsonPath_(), path));
    }

    hasChildren(): boolean {

        return this.numChildren() > 0;
    }

    numChildren(): number {

        const value = this.val();
        return lodash.isObject(value) ? Object.keys(value).length : 0;
    }

    pairs_(): MockPair[] {

        let pairs = lodash.map(this.val_() as any, toPair);
        const query = this.refInternals_.getQuery_();

        if (query.orderByChild) {
            pairs.sort(pairChildComparer(query.orderByChild));
            pairs = lodash.filter(pairs, pairChildPredicate(query.orderByChild, query));
        } else if (query.orderByPriority) {
            throw unsupported();
        } else if (query.orderByValue) {
            pairs.sort(pairValueComparer);
            pairs = lodash.filter(pairs, pairValuePredicate(query));
        } else {
            pairs.sort(MockDataSnapshot.pairKeyComparer);
            pairs = lodash.filter(pairs, pairKeyPredicate(query));
        }

        if (query.limitToFirst && (pairs.length > query.limitToFirst)) {
            pairs.splice(query.limitToFirst, pairs.length - query.limitToFirst);
        }

        if (query.limitToLast && (pairs.length > query.limitToLast)) {
            pairs.splice(0, pairs.length - query.limitToLast);
        }

        return pairs;
    }

    toJSON(): Object | null {

        throw unsupported();
    }

    val(): MockValue | null {

        let value: MockValue;

        if (this.refInternals_.isQuery_()) {
            value = {};
            lodash.each(this.pairs_(), (pair) => { value[pair.key] = pair.value; });
        } else {
            value = this.val_();
        }
        return value;
    }

    private val_(): MockValue | null {

        let value: MockValue = null;
        const jsonPath = this.refInternals_.getJsonPath_();

        if (json.has(this.content_, jsonPath)) {
            value = json.get(this.content_, jsonPath);
            if (value === undefined) {
                value = null;
            }
            value = json.clone(value);
        }
        return value;
    }
}

function endAtPredicate(
    value: MockValue,
    key: string,
    endAtValue: MockPrimitive | null,
    endAtKey: string | null
): boolean {

    if (MockDataSnapshot.valueComparer(value, endAtValue) > 0) {
        return false;
    }
    if (endAtKey && (key > endAtKey)) {
        return false;
    }
    return true;
}

function equalToPredicate(
    value: MockValue,
    key: string,
    equalToValue: MockPrimitive | null,
    equalToKey: string | null
): boolean {

    if (MockDataSnapshot.valueComparer(value, equalToValue) !== 0) {
        return false;
    }
    if (equalToKey && (key !== equalToKey)) {
        return false;
    }
    return true;
}

function pairChildComparer(path: string): (a: MockPair, b: MockPair) => number {

    path = json.slash(path);

    return (a: MockPair, b: MockPair) => {

        return MockDataSnapshot.valueComparer(json.get(a.value, path), json.get(b.value, path));
    };
}

function pairChildPredicate(path: string, query: MockQuery): (pair: MockPair) => boolean {

    path = json.slash(path);

    return (pair) => {

        const value = json.get(pair.value, path);

        if ((query.equalTo !== undefined) && !equalToPredicate(value, pair.key, query.equalTo, query.key)) {
            return false;
        }
        if ((query.startAt !== undefined) && !startAtPredicate(value, pair.key, query.startAt, query.key)) {
            return false;
        }
        if ((query.endAt !== undefined) && !endAtPredicate(value, pair.key, query.endAt, query.key)) {
            return false;
        }
        return true;
    };
}

function pairKeyPredicate(query: MockQuery): (pair: MockPair) => boolean {

    return (pair) => {

        if ((query.equalTo !== undefined) && (pair.key !== query.equalTo)) {
            return false;
        }
        if ((query.startAt !== undefined) && (pair.key < query.startAt)) {
            return false;
        }
        if ((query.endAt !== undefined) && (pair.key > query.endAt)) {
            return false;
        }
        return true;
    };
}

function pairValueComparer(a: MockPair, b: MockPair): number {

    return MockDataSnapshot.valueComparer(a.value, b.value);
}

function pairValuePredicate(query: MockQuery): (pair: MockPair) => boolean {

    return (pair) => {

        if ((query.equalTo !== undefined) && !equalToPredicate(pair.value, pair.key, query.equalTo, query.key)) {
            return false;
        }
        if ((query.startAt !== undefined) && !startAtPredicate(pair.value, pair.key, query.startAt, query.key)) {
            return false;
        }
        if ((query.endAt !== undefined) && !endAtPredicate(pair.value, pair.key, query.endAt, query.key)) {
            return false;
        }
        return true;
    };
}

function startAtPredicate(
    value: MockValue,
    key: string,
    startAtValue: MockPrimitive | null,
    startAtKey: string | null
): boolean {

    if (MockDataSnapshot.valueComparer(value, startAtValue) < 0) {
        return false;
    }
    if (startAtKey && (key < startAtKey)) {
        return false;
    }
    return true;
}

function toPair(value: MockValue, key: string): MockPair {

    return { key, value };
}
