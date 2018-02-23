/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "../firebase";
import { unsupported_ } from "../mock-error";
import { MockEmitters } from "../mock-types";
import { MockCollection } from "./mock-firestore-types";

export interface MockDocumentRefOptions {
    app: firebase.app.App;
    emitters: MockEmitters;
    firestore: { content: MockCollection | null };
    path: string | null;
}

export class MockDocumentRef implements firebase.firestore.DocumentReference {

    constructor(options: MockDocumentRefOptions) {}

    public get firestore(): firebase.firestore.Firestore {

        throw unsupported_();
    }

    public get id(): string {

        throw unsupported_();
    }

    public get parent(): firebase.firestore.CollectionReference {

        throw unsupported_();
    }

    public get path(): string {

        throw unsupported_();
    }

    public collection(collectionPath: string): firebase.firestore.CollectionReference {

        throw unsupported_();
    }

    public delete(): Promise<void> {

        throw unsupported_();
    }

    public get(): Promise<firebase.firestore.DocumentSnapshot> {

        throw unsupported_();
    }

    public isEqual(other: firebase.firestore.DocumentReference): boolean {

        throw unsupported_();
    }

    public onSnapshot(observer: {
        next?: (snapshot: firebase.firestore.DocumentSnapshot) => void;
        error?: (error: firebase.firestore.FirestoreError) => void;
        complete?: () => void;
    }): () => void;
    public onSnapshot(
        options: firebase.firestore.DocumentListenOptions,
        observer: {
            next?: (snapshot: firebase.firestore.DocumentSnapshot) => void;
            error?: (error: Error) => void;
            complete?: () => void;
        }
    ): () => void;
    public onSnapshot(
        onNext: (snapshot: firebase.firestore.DocumentSnapshot) => void,
        onError?: (error: Error) => void,
        onCompletion?: () => void
    ): () => void;
    public onSnapshot(
        options: firebase.firestore.DocumentListenOptions,
        onNext: (snapshot: firebase.firestore.DocumentSnapshot) => void,
        onError?: (error: Error) => void,
        onCompletion?: () => void
    ): () => void;
    public onSnapshot(...args: any[]): () => void {

        throw unsupported_();
    }

    public set(
        data: firebase.firestore.DocumentData,
        options?: firebase.firestore.SetOptions
    ): Promise<void> {

        throw unsupported_();
    }

    public update(data: firebase.firestore.UpdateData): Promise<void>;
    public update(
        field: string | firebase.firestore.FieldPath,
        value: any,
        ...moreFieldsAndValues: any[]
    ): Promise<void>;
    public update(...args: any[]): Promise<void> {

        throw unsupported_();
    }
}
