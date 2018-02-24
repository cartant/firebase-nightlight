/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "../firebase";
import * as json from "../json";
import * as lodash from "../lodash";
import { unsupported_ } from "../mock-error";
import { MockDatabaseContent, MockPrimitive, MockQuery, MockValue } from "./mock-database-types";
import { MockRef } from "./mock-ref";

export interface MockPair {
    key: string;
    value: MockValue;
}

export interface MockDataSnapshotOptions {
    content?: MockDatabaseContent;
    ref: MockRef;
    snapshot?: MockDataSnapshot;
}

export class MockDataSnapshot implements firebase.database.DataSnapshot {

    private content_: MockDatabaseContent;
    private ref_: MockRef;

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

        if (options.snapshot) {
            this.content_ = options.snapshot.content_;
        } else {
            this.content_ = options.content || this.ref_.content_;
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
            ref: childRef as MockRef
        });
    }

    exists(): boolean {

        return json.has(this.content_, this.ref_.jsonPath_);
    }

    exportVal(): any {

        throw unsupported_();
    }

    forEach(action: (snapshot: firebase.database.DataSnapshot) => boolean): boolean {

        let cancelled = false;
        lodash.each(this.pairs_(), (pair) => {

            if (action(this.child(pair.key))) {
                cancelled = true;
                return false;
            }
            return undefined;
        });
        return cancelled;
    }

    getPriority(): string | number | null {

        throw unsupported_();
    }

    hasChild(path: string): boolean {

        return json.has(this.content_, json.join(this.ref_.jsonPath_, path));
    }

    hasChildren(): boolean {

        return this.numChildren() > 0;
    }

    numChildren(): number {

        const value = this.val();
        return lodash.isObject(value) ? Object.keys(value as any).length : 0;
    }

    pairs_(): MockPair[] {

        let pairs = lodash.map(this.val_() as any, toPair);
        const query = this.ref_.query_;

        if (query.orderByChild) {
            pairs.sort(pairChildComparer(query.orderByChild));
            pairs = lodash.filter(pairs, pairChildPredicate(query.orderByChild, query));
        } else if (query.orderByPriority) {
            throw unsupported_();
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

        throw unsupported_();
    }

    val(): MockValue | null {

        let value: MockValue | null;

        if (this.ref_.queried_) {
            const result: MockValue = {};
            lodash.each(this.pairs_(), (pair) => { result[pair.key] = pair.value; });
            value = result;
        } else {
            value = this.val_();
        }
        return value;
    }

    private val_(): MockValue | null {

        let value: MockValue| null = null;
        const jsonPath = this.ref_.jsonPath_;

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
    value: MockValue | null,
    key: string,
    endAtValue: MockPrimitive | null,
    endAtKey?: string | null
): boolean {

    const comparison = MockDataSnapshot.valueComparer(value, endAtValue);
    if (comparison > 0) {
        return false;
    }
    if ((comparison === 0) && endAtKey && (key > endAtKey)) {
        return false;
    }
    return true;
}

function equalToPredicate(
    value: MockValue | null,
    key: string,
    equalToValue: MockPrimitive | null,
    equalToKey?: string | null
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

        return MockDataSnapshot.valueComparer(
            toChildValue(a.value, path),
            toChildValue(b.value, path)
        );
    };
}

function pairChildPredicate(path: string, query: MockQuery): (pair: MockPair) => boolean {

    path = json.slash(path);

    return (pair) => {

        const value = toChildValue(pair.value, path);

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

        if ((query.equalTo !== undefined) && ((pair.key as string) !== (query.equalTo as string))) {
            return false;
        }
        if ((query.startAt !== undefined) && ((pair.key as string) < (query.startAt as string))) {
            return false;
        }
        if ((query.endAt !== undefined) && ((pair.key as string) > (query.endAt as string))) {
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
    value: MockValue | null,
    key: string,
    startAtValue: MockPrimitive | null,
    startAtKey?: string | null
): boolean {

    const comparison = MockDataSnapshot.valueComparer(value, startAtValue);
    if (comparison < 0) {
        return false;
    }
    if ((comparison === 0) && startAtKey && (key < startAtKey)) {
        return false;
    }
    return true;
}

function toChildValue(value: MockValue, path: string): MockPrimitive | null {

    return json.has(value, path) ? json.get(value, path) : null;
}

function toPair(value: MockValue, key: string): MockPair {

    return { key, value };
}
