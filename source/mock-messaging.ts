/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase, FirebasePromise } from "./firebase";
import { error_, unsupported_ } from "./mock-error";

export interface MockMessagingOptions {
    app: firebase.app.App;
}

export class MockMessaging implements firebase.messaging.Messaging {

    private app_: firebase.app.App;

    constructor(options: MockMessagingOptions) {

        this.app_ = options.app;
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    deleteToken(token: string): FirebasePromise<any> | null {

        throw unsupported_();
    }

    getToken(): FirebasePromise<any> | null {

        throw unsupported_();
    }

    onMessage(nextOrObserver: Object): () => any {

        throw unsupported_();
    }

    onTokenRefresh(nextOrObserver: Object): () => any {

        throw unsupported_();
    }

    requestPermission(): FirebasePromise<any> | null {

        throw unsupported_();
    }

    setBackgroundMessageHandler(callback: (a: Object) => any): any {

        throw unsupported_();
    }

    useServiceWorker(registration: any): any {

        throw unsupported_();
    }
}
