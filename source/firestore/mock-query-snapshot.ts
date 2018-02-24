/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "../firebase";
import * as json from "../json";
import * as lodash from "../lodash";
import { unsupported_ } from "../mock-error";
import { MockCollectionRef } from "./mock-collection-ref";
import { MockDocumentRef } from "./mock-document-ref";
import { MockDocumentSnapshot } from "./mock-document-snapshot";
import {
    MockCollection,
    MockDocument,
    MockDocumentPair,
    MockFirestoreContent,
    MockFirestoreQuery
 } from "./mock-firestore-types";

export interface MockQuerySnapshotOptions {
    content: MockFirestoreContent;
    ref: MockCollectionRef;
}

export class MockQuerySnapshot implements firebase.firestore.QuerySnapshot {

    private content_: MockFirestoreContent;
    private ref_: MockCollectionRef;

    constructor(options: MockQuerySnapshotOptions) {

        this.content_ = options.content;
        this.ref_ = options.ref;
    }

    public get docChanges(): firebase.firestore.DocumentChange[] {

        throw unsupported_();
    }

    public get docs(): firebase.firestore.DocumentSnapshot[] {

        return lodash.map(this.pairs_(), pair => new MockDocumentSnapshot({
            content: this.content_,
            ref: this.ref_.doc(pair.id) as MockDocumentRef
        }));
    }

    public get empty(): boolean {

        return this.size === 0;
    }

    public get metadata(): firebase.firestore.SnapshotMetadata {

        return {
            fromCache: false,
            hasPendingWrites: false
        };
    }

    public get query(): firebase.firestore.Query {

        return this.ref_;
    }

    public get size(): number {

        return this.pairs_().length;
    }

    public forEach(callback: (result: firebase.firestore.DocumentSnapshot) => void, thisArg?: any): void {

        this.docs.forEach(callback, thisArg);
    }

    private pairs_(): MockDocumentPair[] {

        if (!json.has(this.content_, this.ref_.jsonPath_)) {
            return [];
        }

        const collection: MockCollection = json.get(this.content_, this.ref_.jsonPath_);
        const query = this.ref_.query_;

        let pairs: MockDocumentPair[] = lodash.map(collection, toPair);
        pairs = lodash.filter(pairs, pair => Boolean(pair.doc.data));

        if (query.whereField) {
            pairs = lodash.filter(pairs, wherePredicate(query));
        }

        if (query.orderByField) {
            pairs.sort(orderByFieldComparer(query));
        } else {
            pairs.sort(orderByIdComparer(query));
        }

        if ((query.startAfter !== undefined) || (query.startAfter !== undefined)) {
            pairs = lodash.filter(pairs, startPredicate(query));
            if (query.limit && (pairs.length > query.limit)) {
                pairs = pairs.slice(0, query.limit);
            }
        } else if ((query.endAt !== undefined) || (query.endBefore !== undefined)) {
            pairs = lodash.filter(pairs, endPredicate(query));
            if (query.limit && (pairs.length > query.limit)) {
                pairs = pairs.slice(pairs.length - query.limit, pairs.length);
            }
        } else if (query.limit && (pairs.length > query.limit)) {
            pairs = pairs.slice(0, query.limit);
        }
        return pairs;
    }
}

function endPredicate(query: MockFirestoreQuery): (pair: MockDocumentPair) => boolean {

    return (pair: MockDocumentPair) => {
        const value = getOrderByValue(query, pair);
        return (query.endAt !== undefined) ?
            value <= query.endAt :
            value < query.endBefore!;
    };
}

function getOrderByValue(query: MockFirestoreQuery, pair: MockDocumentPair): any {

    return (query.orderByField !== undefined) ? pair[query.orderByField] : pair.id;
}

function orderByFieldComparer(query: MockFirestoreQuery): (a: MockDocumentPair, b: MockDocumentPair) => number {

    const direction = (query.orderByDirection === "asc") ? 1 : -1;
    const field = query.orderByField!;

    return (a: MockDocumentPair, b: MockDocumentPair) => {

        const fa = a.doc.data[field];
        const fb = b.doc.data[field];
        return direction * ((fa < fb) ? -1 : (fa > fb) ? 1 : 0);
    };
}

function orderByIdComparer(query: MockFirestoreQuery): (a: MockDocumentPair, b: MockDocumentPair) => number {

    return (a: MockDocumentPair, b: MockDocumentPair) => {

        const ia = a.id;
        const ib = b.id;
        return ((ia < ib) ? -1 : (ia > ib) ? 1 : 0);
    };
}

function startPredicate(query: MockFirestoreQuery): (pair: MockDocumentPair) => boolean {

    return (pair: MockDocumentPair) => {
        const value = getOrderByValue(query, pair);
        return (query.startAt !== undefined) ?
            value >= query.startAt :
            value > query.startAfter!;
    };
}

function toPair(doc: MockDocument, id: string): MockDocumentPair {

    return { doc, id };
}

function wherePredicate(query: MockFirestoreQuery): (pair: MockDocumentPair) => boolean {

    return new Function(
        "pair",
        `pair.doc.data[${query.whereField}] ${query.whereOperator} ${JSON.stringify(query.whereValue)}`
    ) as any;
}
