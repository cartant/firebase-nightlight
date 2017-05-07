/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { EventEmitter2 } from "eventemitter2";
import { firebase } from "./firebase";
import { unsupported_ } from "./mock-error";
import { MockRef } from "./mock-ref";
import { MockEmitters, MockValue } from "./mock-types";

export interface MockDatabaseOptions {
    app: any;
    database: { content: MockValue | null };
    emitters: MockEmitters;
}

export class MockDatabase implements firebase.database.Database {

    private app_: firebase.app.App;
    private database_: { content: MockValue | null };
    private emitters_: MockEmitters;

    constructor(options: MockDatabaseOptions) {

        this.app_ = options.app;
        this.database_ = options.database || {} as any;
        this.database_.content = this.database_.content || {};
        this.emitters_ = options.emitters;
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    goOffline(): void {

        throw unsupported_();
    }

    goOnline(): void {

        throw unsupported_();
    }

    ref(path?: string): firebase.database.Reference {

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: path || null
        });
    }

    refFromURL(url: string): firebase.database.Reference {

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: url.replace(/^(http|https):\/\/[^\/]+/i, "")
        });
    }
}
