/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "../firebase";
import { unsupported_ } from "../mock-error";
import { MockEmitters } from "../mock-types";
import { MockCollectionRef } from "./mock-collection-ref";
import { MockDocumentRef } from "./mock-document-ref";
import { MockCollection, MockFieldPath, MockFieldValue, MockFirestoreContent } from "./mock-firestore-types";

export interface MockFirestoreOptions {
    app: any;
    firestore: {
        content: MockFirestoreContent;
        fieldPath: MockFieldPath;
        fieldValue: MockFieldValue;
    };
    emitters: MockEmitters;
}

export class MockFirestore implements firebase.firestore.Firestore {

    private app_: firebase.app.App;
    private emitters_: MockEmitters;
    private fieldPath_: MockFieldPath;
    private fieldValue_: MockFieldValue;
    private store_: { content: MockFirestoreContent };

    constructor(options: MockFirestoreOptions) {

        this.app_ = options.app;
        this.emitters_ = options.emitters;
        this.fieldPath_ = options.firestore.fieldPath;
        this.fieldValue_ = options.firestore.fieldValue;
        this.store_ = options.firestore;
        this.store_.content = this.store_.content || {};
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    get INTERNAL(): { delete: () => Promise<void> } {

        return { delete: () => Promise.resolve() };
    }

    batch(): firebase.firestore.WriteBatch {

        throw unsupported_();
    }

    collection(collectionPath: string): firebase.firestore.CollectionReference {

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            fieldPath: this.fieldPath_,
            fieldValue: this.fieldValue_,
            firestore: this,
            path: collectionPath,
            store: this.store_
        });
    }

    doc(documentPath: string): firebase.firestore.DocumentReference {

        return new MockDocumentRef({
            app: this.app_,
            emitters: this.emitters_,
            fieldPath: this.fieldPath_,
            fieldValue: this.fieldValue_,
            firestore: this,
            path: documentPath,
            store: this.store_
        });
    }

    enablePersistence(): Promise<void> {

        throw unsupported_();
    }

    runTransaction<T>(
        updateFunction: (transaction: firebase.firestore.Transaction) => Promise<T>
    ): Promise<T> {

        throw unsupported_();
    }

    settings(settings: firebase.firestore.Settings): void {
    }
}
