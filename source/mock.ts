/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as firebase from "firebase";
import { MockOptions, MockUntyped } from "./mock-untyped";

export { MockOptions };

export class Mock {

    private untyped_: MockUntyped;

    constructor(options?: MockOptions) {

        this.untyped_ = new MockUntyped(options);
    }

    get apps(): (firebase.app.App | null)[] {

        return this.untyped_.apps;
    }

    get SDK_VERSION(): string {

        return this.untyped_.SDK_VERSION;
    }

    app(name?: string): firebase.app.App {

        return name ? this.untyped_.app() : this.untyped_.app(name);
    }

    auth(app?: firebase.app.App): firebase.auth.Auth {

        return name ? this.untyped_.auth() : this.untyped_.auth(app);
    }

    database(app?: firebase.app.App): firebase.database.Database {

        return name ? this.untyped_.database() : this.untyped_.database(app);
    }

    initializeApp(options: any, name?: string): firebase.app.App {

        return name ? this.untyped_.initializeApp(options, name): this.untyped_.initializeApp(options);
    }

    messaging(app?: firebase.app.App): firebase.messaging.Messaging {

        return name ? this.untyped_.messaging() : this.untyped_.messaging(app);
    }

    storage(app?: firebase.app.App): firebase.storage.Storage {

        return name ? this.untyped_.storage() : this.untyped_.storage(app);
    }
}
