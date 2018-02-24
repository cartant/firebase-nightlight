/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "../firebase";
import * as json from "../json";
import { unsupported_ } from "../mock-error";
import { MockEmitters } from "../mock-types";
import { MockCollectionRef } from "./mock-collection-ref";
import { toJsonPath, toPath, validatePath } from "./mock-firestore-paths";
import { MockFirestoreContent } from "./mock-firestore-types";

export interface MockDocumentRefOptions {
    app: firebase.app.App;
    emitters: MockEmitters;
    firestore: firebase.firestore.Firestore;
    path: string | null;
    store: { content: MockFirestoreContent };
}

export class MockDocumentRef implements firebase.firestore.DocumentReference {

    public readonly jsonPath_: string;

    private app_: firebase.app.App;
    private emitters_: MockEmitters;
    private firestore_: firebase.firestore.Firestore;
    private id_: string;
    private parentPath_: string;
    private path_: string;
    private store_: { content: MockFirestoreContent };

    constructor(options: MockDocumentRefOptions) {

        this.app_ = options.app;
        this.emitters_ = options.emitters;
        this.firestore_ = options.firestore;
        this.store_ = options.store;

        this.path_ = toPath(options.path || "");
        validatePath(this.path_);
        this.jsonPath_ = toJsonPath(this.path_);

        const index = this.path_.lastIndexOf("/");
        this.id_ = this.path_.substring(index + 1);
        this.parentPath_ = this.path_.substring(0, index);
    }

    public get firestore(): firebase.firestore.Firestore {

        return this.firestore_;
    }

    public get id(): string {

        return this.id_;
    }

    public get parent(): firebase.firestore.CollectionReference {

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: this.parentPath_,
            store: this.store_
        });
    }

    public get path(): string {

        return this.path_;
    }

    public collection(collectionPath: string): firebase.firestore.CollectionReference {

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: json.join(this.path_, collectionPath),
            store: this.store_
        });
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
