/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "../firebase";
import * as json from "../json";
import { unsupported_ } from "../mock-error";
import { MockDocumentRef } from "./mock-document-ref";
import { toJsonPath, toSlashPath } from "./mock-firestore-paths";
import { MockFirestoreContent } from "./mock-firestore-types";

export interface MockDocumentSnapshotOptions {
    content: MockFirestoreContent;
    ref: MockDocumentRef;
}

export class MockDocumentSnapshot implements firebase.firestore.DocumentSnapshot {

    private content_: MockFirestoreContent;
    private ref_: MockDocumentRef;

    constructor(options: MockDocumentSnapshotOptions) {

        this.content_ = options.content;
        this.ref_ = options.ref;
    }

    public get exists(): boolean {

        return Boolean(this.data());
    }

    public get id(): string {

        return this.ref_.id;
    }

    public get metadata(): firebase.firestore.SnapshotMetadata {

        return {
            fromCache: false,
            hasPendingWrites: false
        };
    }

    public get ref(): firebase.firestore.DocumentReference {

        return this.ref_;
    }

    public data(): firebase.firestore.DocumentData {

        const dataPath = json.join(this.ref_.jsonPath_, "data");
        let data: any;

        if (json.has(this.content_, dataPath)) {
            data = json.get(this.content_, dataPath);
            if (data) {
                data = json.clone(data);
            }
        }
        return data;
    }

    public get(fieldPath: string | firebase.firestore.FieldPath): any {

        if (typeof fieldPath !== "string") {
            throw unsupported_();
        }

        const slashPath = toSlashPath(fieldPath);
        const dataPath = toJsonPath(json.join(this.ref_.jsonPath_, "data", slashPath));
        let data: any;

        if (json.has(this.content_, dataPath)) {
            data = json.get(this.content_, dataPath);
            if (data) {
                data = json.clone(data);
            }
        }
        return data;
    }
}
