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

export interface MockOptions {
    database?: { content: MockValue | null };
    identities?: MockIdentity[];
}

export class Mock {

    private app_: firebase.app.App;
    private auth_: firebase.auth.Auth;
    private database_: firebase.database.Database;
    private emitters_: MockEmitters;
    private identities_: MockIdentity[];
    private messaging_: firebase.messaging.Messaging;
    private storage_: firebase.storage.Storage;

    constructor(options: MockOptions) {

        options = options || {};

        this.app_ = {} as any;
        this.app_.auth = () => this.auth_;
        this.app_.database = () => this.database_;
        this.app_.delete = () => Promise.resolve();
        this.app_.messaging = () => this.messaging_;
        this.app_.storage = () => this.storage_;
        this.emitters_ = {
            root: new EventEmitter2({ wildcard: true }),
            shared: {}
        };
        this.identities_ = options.identities || [];
        this.messaging_ = null;
        this.storage_ = null;

        this.auth_ = new MockAuth({
            app: this.app_,
            identities: this.identities_
        });

        this.database_ = new MockDatabase({
            app: this.app_,
            database: options.database,
            emitters: this.emitters_
        });

        this.emitters_.root.onAny(this.rootListener_.bind(this));
    }

    app(): firebase.app.App {

        return this.app_;
    }

    auth(): firebase.auth.Auth {

        return this.auth_;
    }

    database(): firebase.database.Database {

        return this.database_;
    }

    initializeApp(options: Object, name?: string): firebase.app.App {

        this.app_.options = options || {};
        this.app_.name = name || "[DEFAULT]";
        return this.app_;
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
