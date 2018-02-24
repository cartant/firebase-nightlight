/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { key } from "firebase-key";
import { firebase } from "../firebase";
import * as json from "../json";
import * as lodash from "../lodash";
import { unsupported_ } from "../mock-error";
import { MockEmitters } from "../mock-types";
import { MockDocumentRef } from "./mock-document-ref";
import { toJsonPath, toPath, validatePath } from "./mock-firestore-paths";
import { MockFirestoreContent, MockFirestoreQuery } from "./mock-firestore-types";

export interface MockCollectionRefOptions {
    app: firebase.app.App;
    emitters: MockEmitters;
    firestore: firebase.firestore.Firestore;
    path: string | null;
    query?: MockFirestoreQuery;
    store: { content: MockFirestoreContent };
}

export class MockCollectionRef implements firebase.firestore.CollectionReference {

    public readonly jsonPath_: string;
    public readonly query_: MockFirestoreQuery;

    private app_: firebase.app.App;
    private emitters_: MockEmitters;
    private firestore_: firebase.firestore.Firestore;
    private id_: string;
    private parentPath_: string;
    private path_: string;
    private store_: { content: MockFirestoreContent };

    constructor(options: MockCollectionRefOptions) {

        this.app_ = options.app;
        this.emitters_ = options.emitters;
        this.firestore_ = options.firestore;
        this.query_ = options.query || {};
        this.store_ = options.store;

        this.path_ = toPath(options.path || "");
        validatePath(this.path_);
        this.jsonPath_ = toJsonPath(this.path_);

        if (this.path_ === "") {
            this.id_ = "";
            this.parentPath_ = "";
        } else {
            const index = this.path_.lastIndexOf("/");
            this.id_ = this.path_.substring(index + 1);
            this.parentPath_ = this.path_.substring(0, index);
        }
    }

    public get firestore(): firebase.firestore.Firestore {

        return this.firestore_;
    }

    public get id(): string {

        return this.id_;
    }

    public get parent(): firebase.firestore.DocumentReference | null {

        return this.parentPath_ ? new MockDocumentRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: this.parentPath_,
            store: this.store_
        }) : null;
    }

    public get path(): string {

        return this.path_;
    }

    public add(data: firebase.firestore.DocumentData): Promise<firebase.firestore.DocumentReference> {

        throw unsupported_();
    }

    public doc(documentPath?: string): firebase.firestore.DocumentReference {

        return new MockDocumentRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: json.join(this.path_, documentPath || key()),
            store: this.store_
        });
    }

    public endAt(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
    public endAt(...fieldValues: any[]): firebase.firestore.Query;
    public endAt(...args: any[]): firebase.firestore.Query {

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: this.path_,
            query: {
                ...this.query_,
                endAt: args
            },
            store: this.store_
        });
    }

    public endBefore(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
    public endBefore(...fieldValues: any[]): firebase.firestore.Query;
    public endBefore(...args: any[]): firebase.firestore.Query {

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: this.path_,
            query: {
                ...this.query_,
                endBefore: args
            },
            store: this.store_
        });
    }

    public get(): Promise<firebase.firestore.QuerySnapshot> {

        throw unsupported_();
    }

    public isEqual(other: firebase.firestore.Query): boolean {

        const otherMock = other as MockCollectionRef;
        return (this.jsonPath_ === otherMock.jsonPath_) && lodash.isEqual(this.query_, otherMock.query_);
    }

    public limit(limit: number): firebase.firestore.Query {

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: this.path_,
            query: {
                ...this.query_,
                limit
            },
            store: this.store_
        });
    }

    public onSnapshot(observer: {
        next?: (snapshot: firebase.firestore.QuerySnapshot) => void;
        error?: (error: Error) => void;
        complete?: () => void;
    }): () => void;
    public onSnapshot(
        options: firebase.firestore.QueryListenOptions,
        observer: {
            next?: (snapshot: firebase.firestore.QuerySnapshot) => void;
            error?: (error: Error) => void;
            complete?: () => void;
        }
    ): () => void;
    public onSnapshot(
        onNext: (snapshot: firebase.firestore.QuerySnapshot) => void,
        onError?: (error: Error) => void,
        onCompletion?: () => void
    ): () => void;
    public onSnapshot(
        options: firebase.firestore.QueryListenOptions,
        onNext: (snapshot: firebase.firestore.QuerySnapshot) => void,
        onError?: (error: Error) => void,
        onCompletion?: () => void
    ): () => void;
    public onSnapshot(...args: any[]): () => void {

        throw unsupported_();
    }

    public orderBy(
        fieldPath: string | firebase.firestore.FieldPath,
        directionStr?: firebase.firestore.OrderByDirection
    ): firebase.firestore.Query {

        if (typeof fieldPath !== "string") {
            throw unsupported_();
        }

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: this.path_,
            query: {
                ...this.query_,
                orderByDirection: directionStr,
                orderByField: fieldPath
            },
            store: this.store_
        });
    }

    public startAfter(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
    public startAfter(...fieldValues: any[]): firebase.firestore.Query;
    public startAfter(...args: any[]): firebase.firestore.Query {

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: this.path_,
            query: {
                ...this.query_,
                startAfter: args
            },
            store: this.store_
        });
    }

    public startAt(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
    public startAt(...fieldValues: any[]): firebase.firestore.Query;
    public startAt(...args: any[]): firebase.firestore.Query {

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: this.path_,
            query: {
                ...this.query_,
                startAt: args
            },
            store: this.store_
        });
    }

    public where(
        fieldPath: string | firebase.firestore.FieldPath,
        opStr: firebase.firestore.WhereFilterOp,
        value: any
    ): firebase.firestore.Query {

        if (typeof fieldPath !== "string") {
            throw unsupported_();
        }

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: this.path_,
            query: {
                ...this.query_,
                whereField: fieldPath,
                whereOperator: opStr,
                whereValue: value
            },
            store: this.store_
        });
    }
}