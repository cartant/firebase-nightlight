<a name="3.0.1"></a>
## [3.0.1](https://github.com/cartant/firebase-nightlight/compare/v3.0.0...v3.0.1) (2018-02-16)

### Bug Fixes

* Corrected the handling of the optional `name` parameter in `initializeApp`. ([06bb983](https://github.com/cartant/firebase-nightlight/commit/06bb983))

<a name="3.0.0"></a>
## [3.0.0](https://github.com/cartant/firebase-nightlight/compare/v2.2.6...v3.0.0) (2017-11-23)

### Changes

* Removed preprocessing and removed the mocks internal dependency on the `firebase` and `firebase-admin` typings. Hopefully, any minor changes made to the Firebase typings will no longer break `firebase-nightlight`.
* There should be no breaking changes, but the internal refactor was significant.

<a name="2.2.6"></a>
## [2.2.6](https://github.com/cartant/firebase-nightlight/compare/v2.2.5...v2.2.6) (2017-10-20)

### Build

* Update to latest `firebase`. ([5aa9060](https://github.com/cartant/firebase-nightlight/commit/5aa9060))

<a name="2.2.5"></a>
## [2.2.5](https://github.com/cartant/firebase-nightlight/compare/v2.2.4...v2.2.5) (2017-10-11)

### Build

* Update to latest `firebase`. ([6b90f70](https://github.com/cartant/firebase-nightlight/commit/6b90f70))

<a name="2.2.4"></a>
## [2.2.4](https://github.com/cartant/firebase-nightlight/compare/v2.2.3...v2.2.4) (2017-10-04)

### Build

* Restrict `firebase` dependency semvers due to breaking changes in the typings. ([4a76d31](https://github.com/cartant/firebase-nightlight/commit/4a76d31))

<a name="2.2.3"></a>
## [2.2.3](https://github.com/cartant/firebase-nightlight/compare/v2.2.2...v2.2.3) (2017-09-08)

### Build

* Update to latest `firebase`. ([ab3d959](https://github.com/cartant/firebase-nightlight/commit/ab3d959))

<a name="2.2.2"></a>
## [2.2.2](https://github.com/cartant/firebase-nightlight/compare/v2.2.1...v2.2.2) (2017-08-18)

### Build

* Update to latest `firebase`; fix TypeScript interfaces. ([f6dfe29](https://github.com/cartant/firebase-nightlight/commit/f6dfe29))

<a name="2.2.1"></a>
## [2.2.1](https://github.com/cartant/firebase-nightlight/compare/v2.2.0...v2.2.1) (2017-07-29)

### Build

* Update to latest `firebase`; fix TypeScript issues. ([9bb2514](https://github.com/cartant/firebase-nightlight/commit/9bb2514))

<a name="2.2.0"></a>
## [2.2.0](https://github.com/cartant/firebase-nightlight/compare/v2.1.0...v2.2.0) (2017-06-02)

### Features

* Add support for use with `firebase-admin` ([1a97ce6](https://github.com/cartant/firebase-nightlight/commit/1a97ce6))

<a name="2.1.0"></a>
## [2.1.0](https://github.com/cartant/firebase-nightlight/compare/v2.0.4...v2.1.0) (2017-05-27)

### Features

* Add support for declaring errors in the database content ([3c674ac](https://github.com/cartant/firebase-nightlight/commit/3c674ac)) and ([7550f49](https://github.com/cartant/firebase-nightlight/commit/7550f49))

<a name="2.0.4"></a>
## [2.0.4](https://github.com/cartant/firebase-nightlight/compare/v2.0.3...v2.0.4) (2017-05-27)

### Bug Fixes

* Skip callback when pushing `undefined` ([9fcf75d](https://github.com/cartant/firebase-nightlight/commit/9fcf75d))

<a name="2.0.3"></a>
## [2.0.3](https://github.com/cartant/firebase-nightlight/compare/v2.0.2...v2.0.3) (2017-05-27)

### Bug Fixes

* Support callback for `push` ([4875717](https://github.com/cartant/firebase-nightlight/commit/4875717))

<a name="2.0.2"></a>
## [2.0.2](https://github.com/cartant/firebase-nightlight/compare/v2.0.1...v2.0.2) (2017-05-18)

### Features

* Mock `onIdTokenChanged` ([4bfb701](https://github.com/cartant/firebase-nightlight/commit/4bfb701))

<a name="2.0.1"></a>
## [2.0.1](https://github.com/cartant/firebase-nightlight/compare/v2.0.0...v2.0.1) (2017-05-18)

### Features

* Remove token methods ([ba17d23](https://github.com/cartant/firebase-nightlight/commit/ba17d23))
* Add `messaging` and `storage` accessors ([d6e58d0](https://github.com/cartant/firebase-nightlight/commit/d6e58d0))

### Build

* Use uglifyjs 2.4.10 ([20554b5](https://github.com/cartant/firebase-nightlight/commit/20554b5))

<a name="2.0.0"></a>
## [2.0.0](https://github.com/cartant/firebase-nightlight/compare/v1.1.1...v2.0.0) (2017-05-18)

### Breaking Changes

* Update to Firebase v4 ([e1027ab](https://github.com/cartant/firebase-nightlight/commit/e1027ab))

<a name="1.1.1"></a>
## [1.1.1](https://github.com/cartant/firebase-nightlight/compare/v1.1.0...v1.1.1) (2017-05-02)

### Doc

* Update `README.md` ([c8d58b5](https://github.com/cartant/firebase-nightlight/commit/c8d58b5))

<a name="1.1.0"></a>
## [1.1.0](https://github.com/cartant/firebase-nightlight/compare/v1.0.9...v1.1.0) (2017-05-01)

### Features

* **ref:** Add `stats_` function for counting listeners ([80dfc59](https://github.com/cartant/firebase-nightlight/commit/80dfc59))

<a name="1.0.9"></a>
## [1.0.9](https://github.com/cartant/firebase-nightlight/compare/v1.0.8...v1.0.9) (2017-04-30)

### Bug Fixes

* **query:** Support missing children ([5484ee0](https://github.com/cartant/firebase-nightlight/commit/5484ee0))

<a name="1.0.8"></a>
## [1.0.8](https://github.com/cartant/firebase-nightlight/compare/v1.0.7...v1.0.8) (2017-04-29)

### Bug Fixes

* **ref:** Resolve `ThenableReference` returned by `push` ([934d876](https://github.com/cartant/firebase-nightlight/commit/934d876))
* **auth:** Emit the current auth state from `onAuthStateChanged` ([f1e761a](https://github.com/cartant/firebase-nightlight/commit/f1e761a))
* **ref:** Hide invalid methods ([da2d6c9](https://github.com/cartant/firebase-nightlight/commit/da2d6c9))
* **ref:** Mock `.info` ([5197ccd](https://github.com/cartant/firebase-nightlight/commit/5197ccd))
* **ref:** Skip shared event listener when possible ([eba0e07](https://github.com/cartant/firebase-nightlight/commit/eba0e07))
* **query:** Prevent non-matching events ([6d35552](https://github.com/cartant/firebase-nightlight/commit/6d35552))

<a name="1.0.7"></a>
## [1.0.7](https://github.com/cartant/firebase-nightlight/compare/v1.0.6...v1.0.7) (2017-04-29)

### Bug Fixes

* **query:** Use optional key only when equal ([f718f9b](https://github.com/cartant/firebase-nightlight/commit/f718f9b))

<a name="1.0.6"></a>
## [1.0.6](https://github.com/cartant/firebase-nightlight/compare/v1.0.5...v1.0.6) (2017-04-29)

### Bug Fixes

* **query:** Support optional key ([150573f](https://github.com/cartant/firebase-nightlight/commit/150573f))

<a name="1.0.5"></a>
## [1.0.5](https://github.com/cartant/firebase-nightlight/compare/v1.0.4...v1.0.5) (2017-04-29)

### Bug Fixes

* **query:** Fix null comparisons ([0d6107c](https://github.com/cartant/firebase-nightlight/commit/0d6107c))

<a name="1.0.4"></a>
## [1.0.4](https://github.com/cartant/firebase-nightlight/compare/v1.0.0...v1.0.4) (2017-04-27)

### Bug Fixes

* **child_removed:** Use previous snapshot ([d670987](https://github.com/cartant/firebase-nightlight/commit/d670987))