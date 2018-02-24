/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as admin from "firebase-admin";
import { MockOptions, MockUntyped } from "../mock-untyped";

export { MockOptions };

export class Mock {

    private untyped_: MockUntyped;

    constructor(options?: MockOptions) {

        const firestore = (options && options.firestore) ? {
            fieldValues: {
                delete: admin.firestore.FieldValue.delete(),
                serverTimestamp: admin.firestore.FieldValue.serverTimestamp()
            },
            ...options.firestore
        } : {};

        this.untyped_ = new MockUntyped({
            ...options,
            ...firestore
        });
    }

    get apps(): (admin.app.App | null)[] {

        return this.untyped_.apps;
    }

    get SDK_VERSION(): string {

        return this.untyped_.SDK_VERSION;
    }

    app(name?: string): admin.app.App {

        return name ? this.untyped_.app() : this.untyped_.app(name);
    }

    auth(app?: admin.app.App): admin.auth.Auth {

        return name ? this.untyped_.auth() : this.untyped_.auth(app);
    }

    database(app?: admin.app.App): admin.database.Database {

        return name ? this.untyped_.database() : this.untyped_.database(app);
    }

    firestore(app?: admin.app.App): admin.firestore.Firestore {

        return name ? this.untyped_.firestore() : this.untyped_.firestore(app);
    }

    initializeApp(options: any, name?: string): admin.app.App {

        return name ? this.untyped_.initializeApp(options) : this.untyped_.initializeApp(options, name);
    }

    messaging(app?: admin.app.App): admin.messaging.Messaging {

        return name ? this.untyped_.messaging() : this.untyped_.messaging(app);
    }

    storage(app?: admin.app.App): admin.storage.Storage {

        return name ? this.untyped_.storage() : this.untyped_.storage(app);
    }
}
