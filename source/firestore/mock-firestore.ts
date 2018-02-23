/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "../firebase";
import { unsupported_ } from "../mock-error";

export interface MockFirestoreOptions {
    app: any;
}

export class MockFirestore implements firebase.firestore.Firestore {

    private app_: firebase.app.App;

    constructor(options: MockFirestoreOptions) {

        this.app_ = options.app;
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

        throw unsupported_();
    }

    doc(documentPath: string): firebase.firestore.DocumentReference {

        throw unsupported_();
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

        throw unsupported_();
    }
}
