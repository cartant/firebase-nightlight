# firebase-nightlight

This is an in-memory, JavaScript mock for the Firebase Web API.

Each `Mock` instance mocks the properties and methods of the [`firebase`](https://firebase.google.com/docs/reference/js/firebase) namespace. The options passed when creating a `Mock` allow for the specification of the initial database content and authentication identities.

**What is mocked?**

* Most of the `database` API is mocked:
    * References can be used to read, write and query data.
    * Events are mocked and will be emitted between references.
    * Security rules are not mocked.
    * Priorities are not mocked.
    * `onDisconnect` is not mocked.
    * The sometimes-synchronous nature of `child_added` events is not mimicked; mocked events are *always* asynchronous.
* Some of the `auth` API is mocked:
    * `createUserWithEmailAndPassword`, `onAuthStateChanged`, `signInAnonymously`, `signInWithCredential`, `signInWithCustomToken`, `signInWithEmailAndPassword`, and `signOut` are mocked.
    * Other methods are not mocked.
* The `storage` and `messaging` APIs are not mocked.

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
        mockApp = mock.initilizeApp({});
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

                expect(snapshot.val()).to.deep.equal({ lorem: "ispum" });

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

And import the `Mock` class for use with TypeScript and ES2015:

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

Once a `Mock` instance is created, the mock API is equivalent to the Firebase Web API.

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
