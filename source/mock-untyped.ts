/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "./firebase";
import { MockApp } from "./app";
import { MockIdentity } from "./auth";
import { MockValue } from "./database";
import { error_ } from "./mock-error";

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

export class MockUntyped {

    private apps_: { [key: string]: firebase.app.App };
    private options_: MockOptions;

    constructor(options?: MockOptions) {

        this.apps_ = {};
        this.options_ = options || {};
    }

    get apps(): any[] {

        return Object.keys(this.apps_).reduce((acc, key) => {
            acc.push(this.apps_[key]);
            return acc;
        }, [] as any[]);
    }

    get SDK_VERSION(): string {

        return "mock";
    }

    app(name?: string): any {

        const app = this.apps_[name || defaultAppName];
        if (app) {
            return app;
        }
        throw error_("app/invalid-name", "App not found.");
    }

    auth(app?: any): any {

        return app ? app.auth() : this.app().auth();
    }

    database(app?: any): any {

        return app ? app.database() : this.app().database();
    }

    initializeApp(options: any, name?: string): any {

        const concreteName = name || defaultAppName;

        let app = this.apps_[concreteName];
        if (app) {
            throw error_("app/name-already-in-use", "App name already exists.");
        }

        const deleter = () => { delete this.apps_[concreteName]; return Promise.resolve(); };

        let mockApp: MockApp;
        if (this.options_.apps && this.options_.apps[concreteName]) {
            mockApp = new MockApp({
                database: this.options_.apps[concreteName].database || { content: {} },
                deleter,
                identities: this.options_.apps[concreteName].identities || [],
                initializeOptions: options,
                name: concreteName
            });
        } else {
            mockApp = new MockApp({
                database: this.options_.database || { content: {} },
                deleter,
                identities: this.options_.identities || [],
                initializeOptions: options,
                name: concreteName
            });
        }
        this.apps_[concreteName] = mockApp;
        return mockApp;
    }

    messaging(app?: any): any {

        return app ? app.messaging() : this.app().messaging();
    }

    storage(app?: any): any {

        return app ? app.storage() : this.app().storage();
    }
}
