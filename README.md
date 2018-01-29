# firebase-nightlight

[![GitHub License](https://img.shields.io/badge/license-GPL%20v3-blue.svg)](https://github.com/cartant/firebase-nightlight/blob/master/LICENSE)
[![NPM version](https://img.shields.io/npm/v/firebase-nightlight.svg)](https://www.npmjs.com/package/firebase-nightlight)
[![Build status](https://img.shields.io/travis/cartant/firebase-nightlight.svg)](http://travis-ci.org/cartant/firebase-nightlight)
[![dependency status](https://img.shields.io/david/cartant/firebase-nightlight.svg)](https://david-dm.org/cartant/firebase-nightlight)
[![devDependency Status](https://img.shields.io/david/dev/cartant/firebase-nightlight.svg)](https://david-dm.org/cartant/firebase-nightlight#info=devDependencies)
[![peerDependency Status](https://img.shields.io/david/peer/cartant/firebase-nightlight.svg)](https://david-dm.org/cartant/firebase-nightlight#info=peerDependencies)
[![Greenkeeper badge](https://badges.greenkeeper.io/cartant/firebase-nightlight.svg)](https://greenkeeper.io/)

### What is it?

`firebase-nightlight` is an in-memory, JavaScript mock for the Firebase Web API.

### Why might you need it?

Unit testing services or components that use the Firebase Web API can be tedious:

* stubbing multiple API methods for each test involves a writing a lot of code, and
* the alternative of running tests against an actual Firebase project is slow.

You might find using an in-memory mock that can be created and destroyed on a per-test or per-suite basis to be less frustrating.

### How does it work?

Each `Mock` instance implements mocked versions of the properties and methods that are in the [`firebase`](https://firebase.google.com/docs/reference/js/firebase) namespace. The options passed when creating a `Mock` instance allow for the specification of the initial database content and authentication identities.

### What is mocked?

* Most of the `database` API is mocked:
    * References can be used to read, write and query data.
    * Events are mocked and will be emitted between references.
    * Security rules are not mocked.
    * Priorities are not mocked.
    * `onDisconnect` is not mocked.
    * The sometimes-synchronous nature of `child_added` events is not mimicked; mocked events are *always* asynchronous.
* Some of the `auth` API is mocked:
    * `createUserWithEmailAndPassword`,
    * `onAuthStateChanged`,
    * `signInAnonymously`,
    * `signInWithCredential`,
    * `signInWithCustomToken`,
    * `signInWithEmailAndPassword`, and
    * `signOut` are mocked.
    * Other methods are not mocked.
* The `firestore`, `messaging` and `storage` APIs are not mocked.

## Example

```ts
import * as firebase from "firebase/app";
import { expect } from "chai";
import { Mock } from "firebase-nightlight";

describe("something", () => {

    let mockDatabase: any;
    let mockApp: firebase.app.App;

    beforeEach(() => {

        mockDatabase = {
            content: {
                lorem: "ipsum"
            }
        };
        const mock = new Mock({
            database: mockDatabase,
            identities: [{
                email: "alice@firebase.com",
                password: "wonderland"
            }]
        });
        mockApp = mock.initializeApp({});
    });

    it("should do something with the mock", () => {

        return mockApp
            .auth()
            .signInWithEmailAndPassword("alice@firebase.com", "wonderland")
            .then((user) => {

                expect(user).to.exist;
                expect(user).to.have.property("email", "alice@firebase.com");
                expect(user).to.have.property("uid");

                return mockApp
                    .database()
                    .ref()
                    .once("value");
            })
            .then((snapshot) => {

                expect(snapshot.val()).to.deep.equal({ lorem: "ipsum" });

                return mockApp
                    .database()
                    .ref()
                    .update({ lorem: "something else" });
            })
            .then(() => {

                expect(mockDatabase.content).to.deep.equal({ lorem: "something else" });

                return mockApp
                    .auth()
                    .signOut();
            });
    });
});
```

## Install

Install the package using NPM:

```
npm install firebase-nightlight --save-dev
```

And import the `Mock` class for use with TypeScript or ES2015:

```js
import { Mock } from "firebase-nightlight";
const mock = new Mock();
console.log(mock);
```

Or `require` the module for use with Node or a CommonJS bundler:

```js
const firebaseNightlight = require("firebase-nightlight");
const mock = new firebaseNightlight.Mock();
console.log(mock);
```

Or include the UMD bundle for use as a `script`:

```html
<script src="https://unpkg.com/firebase-nightlight"></script>
<script>
var mock = new firebaseNightlight.Mock();
console.log(mock);
</script>
```

## API

Instances of the `Mock` class implement the properties and methods that are in the Firebase Web API's [`firebase`](https://firebase.google.com/docs/reference/js/firebase) namespace.

The `Mock` constructor accepts an `options` object with the following optional properties:

| Property | Description |
| --- | --- |
| `database` | An object containing the initial database `content`. |
| `identities` | An array of identities to use use when authenticating users. |
| `apps` | An object containing `database` and `identities` configurations by app name. |

If `identities` are specified, they can have the following optional properties:

| Property | Description |
| --- | --- |
| `credential` | The `firebase.auth.AuthCredential` to match if `signInWithCredential` is called. |
| `email` | The user's email. |
| `password` | The password to match if `signInWithEmailAndPassword` is called. |
| `token` | The token to match if `signInWithCustomToken` is called. |
| `uid` | The user's UID. If not specified, a random UID is generated. |

### Additions to the Firebase Web API

The mock's implementation of `firebase.database.Reference` includes a `stats_` function that will return the current listener counts for each event type. For example:

```js
mockRef.on("child_added", () => {});
mockRef.on("child_removed", () => {});

const stats = mockRef.stats_();
expect(stats.listeners).to.deep.equal({
    child_added: 1,
    child_changed: 0,
    child_moved: 0,
    child_removed: 1,
    total: 2,
    value: 0
});
```

### Forcing database errors

It's possible to force database errors by delcaring errors in the database content. For example, with this content:

```js
const mockDatabase = {
    content: {
        a: {
            b: {
                ".error": {
                    code: "database/boom",
                    message: "Boom!"
                },
                c: {
                    value: 3
                }
            }
        }
    }
};
const mock = new Mock({
    database: mockDatabase
});
```

All reads and writes on the `a/b` path will fail with the specified error. Any reads or writes on deeper paths - `a/b/c`, for example - will also fail with the specified error.