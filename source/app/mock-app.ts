/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { EventEmitter2 } from "eventemitter2";
import * as json from "../json";
import * as lodash from "../lodash";
import { MockAuth, MockIdentity } from "../auth";
import { MockDatabase, MockDatabaseContent, MockDataSnapshot, MockRef, MockValue } from "../database";
import { firebase } from "../firebase";
import { MockCollection, MockFieldPath, MockFieldValue, MockFirestore, MockFirestoreContent } from "../firestore";
import { MockMessaging } from "../messaging";
import { unsupported_ } from "../mock-error";
import { MockEmitters } from "../mock-types";
import { MockStorage } from "../storage";

export interface MockAppOptions {
    database?: { content: MockDatabaseContent };
    deleter: () => Promise<any>;
    firestore?: {
        content: MockFirestoreContent;
        fieldPath: MockFieldPath;
        fieldValue: MockFieldValue;
    };
    identities: MockIdentity[];
    initializeOptions: Object;
    name: string;
}

export class MockApp implements firebase.app.App {

    private auth_: firebase.auth.Auth;
    private databaseEmitters_: MockEmitters;
    private database_: firebase.database.Database;
    private deleter_: () => Promise<any>;
    private firestoreEmitters_: MockEmitters;
    private firestore_: MockFirestore;
    private initializeOptions_: Object;
    private messaging_: firebase.messaging.Messaging;
    private name_: string;

    constructor(options: MockAppOptions) {

        this.deleter_ = options.deleter;
        this.initializeOptions_ = options.initializeOptions;
        this.name_ = options.name;

        this.auth_ = new MockAuth({
            app: this,
            identities: options.identities
        });

        this.databaseEmitters_ = {
            root: new EventEmitter2({ wildcard: true }),
            shared: {}
        };
        this.databaseEmitters_.root.onAny(this.databaseRootListener_.bind(this));
        this.database_ = new MockDatabase({
            app: this,
            database: options.database || { content: null },
            emitters: this.databaseEmitters_
        });

        this.firestoreEmitters_ = {
            root: new EventEmitter2({ wildcard: true }),
            shared: {}
        };
        this.firestoreEmitters_.root.onAny(this.firestoreRootListener_.bind(this));
        this.firestore_ = new MockFirestore({
            app: this,
            emitters: this.firestoreEmitters_,
            firestore: options.firestore || {
                content: null,
                fieldPath: {},
                fieldValue: {}
            }
        });

        this.messaging_ = new MockMessaging({
            app: this
        });
    }

    get name(): string {

        return this.name_;
    }

    get options(): Object {

        return this.initializeOptions_;
    }

    auth(): firebase.auth.Auth {

        return this.auth_;
    }

    database(): firebase.database.Database {

        return this.database_;
    }

    delete(): Promise<any> {

        return this.deleter_();
    }

    firestore(): firebase.firestore.Firestore {

        return this.firestore_;
    }

    messaging(): firebase.messaging.Messaging {

        return this.messaging_;
    }

    storage(url?: string): firebase.storage.Storage {

        return new MockStorage({
            app: this,
            url
        });
    }

    private databaseRootListener_(
        eventType: string,
        { content, previousContent }: { content: MockDatabaseContent, previousContent: MockDatabaseContent }
    ): void {

        lodash.each(this.databaseEmitters_.shared, (sharedEmitter, sharedEmitterJsonPath: string) => {

            const sharedEmitterRef = this.database().ref(lodash.trim(sharedEmitterJsonPath, "/")) as any as MockRef;

            let value: MockValue | null = null;
            if (content && json.has(content, sharedEmitterJsonPath)) {
                value = json.get(content, sharedEmitterJsonPath);
            }

            let previousValue: MockValue | null = null;
            if (previousContent && json.has(previousContent, sharedEmitterJsonPath)) {
                previousValue = json.get(previousContent, sharedEmitterJsonPath);
            }

            if (value !== previousValue) {
                sharedEmitter.emit("value", {
                    previousSnapshot: null,
                    snapshot: new MockDataSnapshot({
                        content,
                        ref: sharedEmitterRef
                    })
                });
            }

            if (value === null) {
                value = {};
            }
            if (previousValue === null) {
                previousValue = {};
            }

            if ((typeof value === "object") && (typeof previousValue === "object")) {

                const childKeys = Object.keys(value);
                const previousChildKeys = Object.keys(previousValue);

                lodash.each(lodash.differenceWith(
                    previousChildKeys,
                    childKeys
                ), (removedKey) => {

                    sharedEmitter.emit("child_removed", {
                        previousSnapshot: new MockDataSnapshot({
                            content: previousContent,
                            ref: sharedEmitterRef.child(removedKey) as MockRef
                        }),
                        snapshot: new MockDataSnapshot({
                            content,
                            ref: sharedEmitterRef.child(removedKey) as MockRef
                        })
                    });
                });

                lodash.each(lodash.differenceWith(
                    childKeys,
                    previousChildKeys
                ), (addedKey) => {

                    sharedEmitter.emit("child_added", {
                        previousSnapshot: new MockDataSnapshot({
                            content: previousContent,
                            ref: sharedEmitterRef.child(addedKey) as MockRef
                        }),
                        snapshot: new MockDataSnapshot({
                            content,
                            ref: sharedEmitterRef.child(addedKey) as MockRef
                        })
                    });
                });

                lodash.each(lodash.intersectionWith(
                    previousChildKeys,
                    childKeys
                ), (changedKey) => {

                    if ((value as MockValue)[changedKey] !== (previousValue as MockValue)[changedKey]) {
                        sharedEmitter.emit("child_changed", {
                            previousSnapshot: new MockDataSnapshot({
                                content: previousContent,
                                ref: sharedEmitterRef.child(changedKey) as MockRef
                            }),
                            snapshot: new MockDataSnapshot({
                                content,
                                ref: sharedEmitterRef.child(changedKey) as MockRef
                            })
                        });
                    }
                });
            }
        });
    }

    private firestoreRootListener_(
        eventType: string,
        { content, previousContent }: { content: MockValue, previousContent: MockValue }
    ): void {
    }
}
