/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as firebase from "firebase/app";

import { MockApp } from "./mock-app";
import { error_ } from "./mock-error";
import { MockIdentity, MockValue } from "./mock-types";

const defaultAppName = "[DEFAULT]";

export interface MockOptions {
    apps?: {
        [key: string]: {
            database?: { content: MockValue | null };
            identities?: MockIdentity[];
        }
    };
    database?: { content: MockValue | null };
    identities?: MockIdentity[];
}

export class Mock {

    private apps_: { [key: string]: firebase.app.App };
    private options_: MockOptions;

    constructor(options?: MockOptions) {

        this.apps_ = {};
        this.options_ = options || {};
    }

    get apps(): (firebase.app.App | null)[] {

        return Object.keys(this.apps_).reduce((acc, key) => {
            acc.push(this.apps_[key]);
            return acc;
        }, []);
    }

    get SDK_VERSION(): string {

        return "mock";
    }

    app(name?: string): firebase.app.App {

        const app = this.apps_[name || defaultAppName];
        if (app) {
            return app;
        }
        throw error_("app/invalid-name", "App not found.");
    }

    auth(app?: firebase.app.App): firebase.auth.Auth {

        return app ? app.auth() : this.app().auth();
    }

    database(app?: firebase.app.App): firebase.database.Database {

        return app ? app.database() : this.app().database();
    }

    initializeApp(options: Object, name?: string): firebase.app.App {

        name = name || defaultAppName;

        let app = this.apps_[name];
        if (app) {
            throw error_("app/name-already-in-use", "App name already exists.");
        }

        const deleter = () => { delete this.apps_[name]; return Promise.resolve(); };

        let mockApp: MockApp;
        if (this.options_.apps && this.options_.apps[name]) {
            mockApp = new MockApp({
                database: this.options_.apps[name].database || { content: {} },
                deleter,
                identities: this.options_.apps[name].identities || [],
                initializeOptions: options,
                name
            });
        } else {
            mockApp = new MockApp({
                database: this.options_.database || { content: {} },
                deleter,
                identities: this.options_.identities || [],
                initializeOptions: options,
                name
            });
        }
        this.apps_[name] = mockApp;
        return mockApp;
    }

    messaging(app?: firebase.app.App): firebase.messaging.Messaging {

        return app ? app.messaging() : this.app().messaging();
    }

    storage(app?: firebase.app.App): firebase.storage.Storage {

        return app ? app.storage() : this.app().storage();
    }
}
