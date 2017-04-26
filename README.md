# firebase-nightlight

This is an in-memory, JavaScript mock for the Firebase Web API.

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