/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "../firebase";
import { unsupported_ } from "../mock-error";
import { MockEmitters } from "../mock-types";
import { MockCollection } from "./mock-firestore-types";

export interface MockCollectionRefOptions {
    app: firebase.app.App;
    emitters: MockEmitters;
    firestore: { content: MockCollection | null };
    path: string | null;
}

export class MockCollectionRef implements firebase.firestore.CollectionReference {

    constructor(options: MockCollectionRefOptions) {}

    public get firestore(): firebase.firestore.Firestore {

        throw unsupported_();
    }

    public get id(): string {

        throw unsupported_();
    }

    public get parent(): firebase.firestore.DocumentReference | null {

        throw unsupported_();
    }

    public get path(): string {

        throw unsupported_();
    }

    public add(data: firebase.firestore.DocumentData): Promise<firebase.firestore.DocumentReference> {

        throw unsupported_();
    }

    public doc(documentPath?: string): firebase.firestore.DocumentReference {

        throw unsupported_();
    }

    public endAt(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
    public endAt(...fieldValues: any[]): firebase.firestore.Query;
    public endAt(...args: any[]): firebase.firestore.Query {

        throw unsupported_();
    }

    public endBefore(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
    public endBefore(...fieldValues: any[]): firebase.firestore.Query;
    public endBefore(...args: any[]): firebase.firestore.Query {

        throw unsupported_();
    }

    public get(): Promise<firebase.firestore.QuerySnapshot> {

        throw unsupported_();
    }

    public isEqual(other: firebase.firestore.Query): boolean {

        throw unsupported_();
    }

    public limit(limit: number): firebase.firestore.Query {

        throw unsupported_();
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

        throw unsupported_();
    }

    public startAfter(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
    public startAfter(...fieldValues: any[]): firebase.firestore.Query;
    public startAfter(...args: any[]): firebase.firestore.Query {

        throw unsupported_();
    }

    public startAt(snapshot: firebase.firestore.DocumentSnapshot): firebase.firestore.Query;
    public startAt(...fieldValues: any[]): firebase.firestore.Query;
    public startAt(...args: any[]): firebase.firestore.Query {

        throw unsupported_();
    }

    public where(
        fieldPath: string | firebase.firestore.FieldPath,
        opStr: firebase.firestore.WhereFilterOp,
        value: any
    ): firebase.firestore.Query {

        throw unsupported_();
    }
}
