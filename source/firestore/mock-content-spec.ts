/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { MockFirestoreContent } from "./mock-firestore-types";

export const content: MockFirestoreContent = {
    users: {
        alice: {
            collections: {
                emails: {
                    "primary": {
                        collections: {},
                        data: {
                            address: "alice@wonderland.com"
                        }
                    },
                    "secondary": {
                        collections: {},
                        data: {
                            address: "alice@gmail.com"
                        }
                    }
                }
            },
            data: {
                name: "alice"
            }
        },
        bob: {
            collections: {
                emails: {
                    "primary": {
                        collections: {},
                        data: {
                            address: "bob@gmail.com"
                        }
                    }
                }
            },
            data: {
                name: "bob"
            }
        },
        mallory: {
            collections: {
                emails: {}
            },
            data: {
                name: "mallory"
            }
        }
    }
};
