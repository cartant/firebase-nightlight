/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "../firebase";
import { unsupported_ } from "../mock-error";
import { MockEmitters } from "../mock-types";
import { MockCollectionRef } from "./mock-collection-ref";
import { MockDocumentRef } from "./mock-document-ref";
import { MockCollection } from "./mock-firestore-types";

export interface MockFirestoreOptions {
    app: any;
    firestore: { content: MockCollection | null };
    emitters: MockEmitters;
}

export class MockFirestore implements firebase.firestore.Firestore {

    private app_: firebase.app.App;
    private emitters_: MockEmitters;
    private firestore_: { content: MockCollection | null };

    constructor(options: MockFirestoreOptions) {

        this.app_ = options.app;
        this.emitters_ = options.emitters;
        this.firestore_ = options.firestore || {} as any;
        this.firestore_.content = this.firestore_.content || {};
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    get INTERNAL(): { delete: () => Promise<void> } {

        throw unsupported_();
    }

    batch(): firebase.firestore.WriteBatch {

        throw unsupported_();
    }

    collection(collectionPath: string): firebase.firestore.CollectionReference {

        return new MockCollectionRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: collectionPath
        });
    }

    doc(documentPath: string): firebase.firestore.DocumentReference {

        return new MockDocumentRef({
            app: this.app_,
            emitters: this.emitters_,
            firestore: this.firestore_,
            path: documentPath
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
