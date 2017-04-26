/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPLv3 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as firebase from "firebase/app";
import * as json from "./json";
import * as lodash from "./lodash";

import { unsupported } from "./mock-error";
import { MockQuery, MockRefInternals, MockValue } from "./mock-types";

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

function pairChildComparer(path: string): (a: MockPair, b: MockPair) => number {

    path = json.slash(path);

    return (a: MockPair, b: MockPair) => {

        const av = json.get(a.value, path);
        const bv = json.get(b.value, path);
        return (av < bv) ? -1 : (av > bv) ? 1 : 0;
    };
}

function pairChildPredicate(path: string, query: MockQuery): (pair: MockPair) => boolean {

    path = json.slash(path);

    return (pair) => {

        const value = json.get(pair.value, path);

        if (query.equalTo !== undefined) {
            return value === query.equalTo;
        }
        if ((query.startAt !== undefined) && (value < query.startAt)) {
            return false;
        }
        if ((query.endAt !== undefined) && (value > query.endAt)) {
            return false;
        }
        return true;
    };
}

function pairKeyPredicate(query: MockQuery): (pair: MockPair) => boolean {

    return (pair) => {

        if (query.equalTo !== undefined) {
            return pair.key === query.equalTo;
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

    const av = a.value;
    const bv = b.value;
    return (av < bv) ? -1 : (av > bv) ? 1 : 0;
}

function pairValuePredicate(query: MockQuery): (pair: MockPair) => boolean {

    return (pair) => {

        if (query.equalTo !== undefined) {
            return pair.value === query.equalTo;
        }
        if ((query.startAt !== undefined) && (pair.value < query.startAt)) {
            return false;
        }
        if ((query.endAt !== undefined) && (pair.value > query.endAt)) {
            return false;
        }
        return true;
    };
}

function toPair(value: MockValue, key: string): MockPair {

    return { key, value };
}
