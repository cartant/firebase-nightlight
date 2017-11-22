/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { firebase } from "./firebase";
import { error_, unsupported_ } from "./mock-error";

export interface MockStorageOptions {
    app: firebase.app.App;
    url?: string;
}

export class MockStorage implements firebase.storage.Storage {

    private app_: firebase.app.App;

    constructor(options: MockStorageOptions) {

        this.app_ = options.app;
    }

    get app(): firebase.app.App {

        return this.app_;
    }

    get maxOperationRetryTime(): number {

        throw unsupported_();
    }

    get maxUploadRetryTime(): number {

        throw unsupported_();
    }

    bucket(name?: string): any {

        throw unsupported_();
    }

    ref(path?: string): firebase.storage.Reference {

        throw unsupported_();
    }

    refFromURL(url: string): firebase.storage.Reference {

        throw unsupported_();
    }

    setMaxOperationRetryTime(time: number): any {

        throw unsupported_();
    }

    setMaxUploadRetryTime(time: number): any {

        throw unsupported_();
    }
}
