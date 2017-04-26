/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPLv3 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as firebase from "firebase/app";
import * as json from "./json";
import * as lodash from "./lodash";

import { EventEmitter2 } from "eventemitter2";
import { MockAuth } from "./mock-auth";
import { MockDatabase } from "./mock-database";
import { MockDataSnapshot } from "./mock-data-snapshot";
import { MockRef } from "./mock-ref";
import { MockEmitters, MockIdentity, MockValue } from "./mock-types";

export interface MockAppOptions {
    database: { content: MockValue | null };
    deleter: () => Promise<any>;
    identities: MockIdentity[];
    initializeOptions: Object;
    name: string;
}

export class MockApp implements firebase.app.App {

    private app_: firebase.app.App;
    private auth_: firebase.auth.Auth;
    private database_: firebase.database.Database;
    private deleter_: () => Promise<any>;
    private emitters_: MockEmitters;
    private initializeOptions_: Object;
    private messaging_: firebase.messaging.Messaging;
    private name_: string;
    private storage_: firebase.storage.Storage;

    constructor(options: MockAppOptions) {

        this.deleter_ = options.deleter;
        this.initializeOptions_ = options.initializeOptions;
        this.messaging_ = null;
        this.name_ = options.name;
        this.storage_ = null;

        this.emitters_ = {
            root: new EventEmitter2({ wildcard: true }),
            shared: {}
        };
        this.emitters_.root.onAny(this.rootListener_.bind(this));

        this.auth_ = new MockAuth({
            app: this,
            identities: options.identities
        });

        this.database_ = new MockDatabase({
            app: this,
            database: options.database,
            emitters: this.emitters_
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

    delete(): firebase.Promise<any> {

        return this.deleter_();
    }

    messaging(): firebase.messaging.Messaging {

        return this.messaging_;
    }

    storage(url?: string): firebase.storage.Storage {

        return this.storage_;
    }

    private rootListener_(
        eventType: string,
        { content, previousContent }: { content: MockValue, previousContent: MockValue }
    ): void {

        lodash.each(this.emitters_.shared, (sharedEmitter, sharedEmitterJsonPath) => {

            const sharedEmitterRef = this.database().ref(lodash.trim(sharedEmitterJsonPath, "/")) as any as MockRef;

            let value: MockValue = null;
            if (json.has(content, sharedEmitterJsonPath)) {
                value = json.get(content, sharedEmitterJsonPath);
            }

            let previousValue: MockValue = null;
            if (json.has(previousContent, sharedEmitterJsonPath)) {
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
                            ref: sharedEmitterRef.child(removedKey)
                        }),
                        snapshot: new MockDataSnapshot({
                            content,
                            ref: sharedEmitterRef.child(removedKey)
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
                            ref: sharedEmitterRef.child(addedKey)
                        }),
                        snapshot: new MockDataSnapshot({
                            content,
                            ref: sharedEmitterRef.child(addedKey)
                        })
                    });
                });

                lodash.each(lodash.intersectionWith(
                    previousChildKeys,
                    childKeys
                ), (changedKey) => {

                    if (value[changedKey] !== previousValue[changedKey]) {
                        sharedEmitter.emit("child_changed", {
                            previousSnapshot: new MockDataSnapshot({
                                content: previousContent,
                                ref: sharedEmitterRef.child(changedKey)
                            }),
                            snapshot: new MockDataSnapshot({
                                content,
                                ref: sharedEmitterRef.child(changedKey)
                            })
                        });
                    }
                });
            }
        });
    }
}
