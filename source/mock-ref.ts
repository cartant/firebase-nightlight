/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPLv3 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as firebase from "firebase/app";
import * as json from "./json";
import * as lodash from "./lodash";

import { EventEmitter2 } from "eventemitter2";
import { key } from "firebase-key";
import { MockDataSnapshot, MockPair } from "./mock-data-snapshot";
import { error, unsupported } from "./mock-error";

import {
    MockEmitters,
    MockPrimitive,
    MockQuery,
    MockRefInternals,
    MockValue
} from "./mock-types";

let lastRefId = 0;

export interface MockRefOptions {
    app: firebase.app.App;
    database: { content: MockValue | null };
    emitters: MockEmitters;
    path: string;
    promise?: firebase.Promise<any>;
    query?: MockQuery;
}

export class MockRef implements firebase.database.ThenableReference, MockRefInternals {

    private app_: firebase.app.App;
    private database_: { content: MockValue | null };
    private emitters_: MockEmitters;
    private id_: number;
    private jsonPath_: string;
    private key_: string;
    private parentPath_: string;
    private path_: string;
    private promise_: firebase.Promise<any>;
    private query_: MockQuery;
    private queue_: any[];
    private refEmitter_: EventEmitter2;
    private refEmitterBindings_: { bound: Function, unbound: Function }[];
    private rootEmitter_: EventEmitter2;
    private sharedEmitter_: EventEmitter2;

    constructor(options: MockRefOptions) {

        this.app_ = options.app;
        this.database_ = options.database;
        this.emitters_ = options.emitters;
        this.id_ = ++lastRefId;
        this.jsonPath_ = toJsonPath(options.path || "");
        this.path_ = toRelativePath(lodash.trim(options.path || "", "/"));
        this.promise_ = options.promise;
        this.query_ = options.query || {};
        this.queue_ = [];

        if (/[\.\$\[\]#]/.test(this.path_)) {
            throw new Error("Illegal characters in path.");
        }

        this.refEmitter_ = new EventEmitter2();
        this.refEmitterBindings_ = [];
        this.rootEmitter_ = this.emitters_.root;
        this.sharedEmitter_ = this.emitters_.shared[this.jsonPath_];
        if (!this.sharedEmitter_) {
            this.sharedEmitter_ = new EventEmitter2({ wildcard: true });
            this.emitters_.shared[this.jsonPath_] = this.sharedEmitter_;
        }
        this.sharedEmitter_.onAny(this.sharedListener_.bind(this));

        if (this.path_ === "") {

            this.key_ = null;
            this.parentPath_ = null;

        } else {

            const index = this.path_.lastIndexOf("/");
            this.key_ = this.path_.substring(index + 1);
            this.parentPath_ = this.path_.substring(0, index);
        }
    }

    get key(): string {

        return this.key_;
    }

    get parent(): firebase.database.Reference {

        if (this.key_ === null) {
            return null;
        }
        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.parentPath_
        });
    }

    get ref(): firebase.database.Reference {

        return this.isQuery_() ? new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_
        }) : this;
    }

    get root(): firebase.database.Reference {

        if (this.key_ === null) {
            return null;
        }
        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: null
        });
    }

    catch(rejector?: (error: Error) => any): any {

        return this.promise_.catch(rejector);
    }

    child(path: string): firebase.database.Reference {

        if (this.isQuery_()) {
            throw unsupported("Queries do not support 'child'.");
        }

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: json.join(this.path_, path)
        });
    }

    endAt(value: MockPrimitive | null, key?: string): firebase.database.Reference {

        this.assertEndAt_();

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_,
            query: lodash.extend({}, this.query_, { endAt: value, key })
        });
    }

    equalTo(value: MockPrimitive | null, key?: string): firebase.database.Reference {

        this.assertEqualTo_();

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_,
            query: lodash.extend({}, this.query_, { equalTo: value, key })
        });
    }

    findChild_(ref: firebase.database.Reference): firebase.database.Reference {

        let result = null;
        let mockRef = ref as any as MockRef;

        if (mockRef.path_) {
            const root = this.path_ || "";
            let index = mockRef.path_.indexOf(root);
            if (index === 0) {
                let subpath = lodash.trim(mockRef.path_.substring(root.length), "/");
                if (subpath) {
                    index = subpath.indexOf("/");
                    if (index !== -1) {
                        subpath = subpath.substring(0, index);
                    }
                    result = this.child(subpath);
                }
            }
        }
        return result;
    }

    getContent_(): MockValue {

        return this.database_.content;
    }

    getJsonPath_(): string {

        return this.jsonPath_;
    }

    getQuery_(): MockQuery {

        return this.query_;
    }

    isEqual(other: firebase.database.Query | null): boolean {

        throw unsupported();
    }

    isQuery_(): boolean {

        return !lodash.isEmpty(this.query_);
    }

    limitToFirst(limit: number): firebase.database.Reference {

        this.assertLimit_();

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_,
            query: lodash.extend({}, this.query_, { limitToFirst: limit })
        });
    }

    limitToLast(limit: number): firebase.database.Reference {

        this.assertLimit_();

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_,
            query: lodash.extend({}, this.query_, { limitToLast: limit })
        });
    }

    off(
        eventType?: string,
        callback?: (snapshot: firebase.database.DataSnapshot, prevKey?: string | null) => any,
        context?: Object | null
    ): any {

        if (eventType) {
            const index = lodash.findIndex(this.refEmitterBindings_, (binding) => binding.unbound === callback);
            if (index !== -1) {
                const binding = this.refEmitterBindings_[index];
                this.refEmitterBindings_.splice(index, 1);
                this.refEmitter_.off(eventType, binding.bound);
            }
        } else {
            this.refEmitter_.removeAllListeners();
            this.refEmitterBindings_ = [];
        }
    }

    on(
        eventType: string,
        successCallback: (snapshot: firebase.database.DataSnapshot, prevKey?: string | null) => any,
        errorCallback?: Object | null,
        context?: Object | null
    ): (snapshot: firebase.database.DataSnapshot, prevKey?: string | null) => any {

        if (errorCallback && (typeof errorCallback !== "function")) {
            context = errorCallback;
            errorCallback = undefined;
        }

        // tslint:disable-next-line
        let boundErrorCallback = errorCallback;
        let boundSuccessCallback = successCallback;
        if (context) {
            boundErrorCallback = errorCallback ? (errorCallback as Function).bind(context) : null;
            boundSuccessCallback = successCallback.bind(context);
        }

        const mockSnapshot = new MockDataSnapshot({
            ref: this
        });

        switch (eventType) {
        case "child_added":
            this.enqueue_("init_child_added", () => {

                let previousKey: string = null;

                if (this.refEmitter_.listeners("child_added").indexOf(boundSuccessCallback) !== -1) {
                    lodash.each(mockSnapshot.pairs_(), (pair) => {

                        boundSuccessCallback(mockSnapshot.child(pair.key), previousKey);
                        previousKey = pair.key;
                    });
                }
            });
            break;
        case "value":
            this.enqueue_("init_value", () => {

                if (this.refEmitter_.listeners("value").indexOf(boundSuccessCallback) !== -1) {
                    boundSuccessCallback(mockSnapshot);
                }
            });
            break;
        default:
            break;
        }

        this.refEmitterBindings_.push({
            bound: boundSuccessCallback,
            unbound: successCallback
        });
        this.refEmitter_.on(eventType, boundSuccessCallback);
        return successCallback;
    }

    once(
        eventType: string,
        successCallback?: (snapshot: firebase.database.DataSnapshot, prevKey?: string | null) => any,
        errorCallback?: Object | null,
        context?: Object | null
    ): firebase.Promise<any> {

        if (errorCallback && (typeof errorCallback !== "function")) {
            context = errorCallback;
            errorCallback = undefined;
        }

        return new Promise((resolve, reject) => {

            const listener = this.on(eventType, (snapshot, previousKey) => {

                this.off(eventType, listener);
                if (successCallback) {
                    successCallback.call(context, snapshot, previousKey);
                }
                resolve(snapshot);

            }, (error: Error) => {

                this.off(eventType, listener);
                if (errorCallback) {
                    (errorCallback as Function).call(context, error);
                }
                reject(error);
            });
        });
    }

    onDisconnect(): firebase.database.OnDisconnect {

        throw unsupported();
    }

    orderByChild(path: string): firebase.database.Reference {

        this.assertOrder_();

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_,
            query: lodash.extend({}, this.query_, { orderByChild: path })
        });
    }

    orderByKey(): firebase.database.Reference {

        this.assertOrder_();

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_,
            query: lodash.extend({}, this.query_, { orderByKey: true })
        });
    }

    orderByPriority(): firebase.database.Reference {

        this.assertOrder_();

        throw unsupported();
    }

    orderByValue(): firebase.database.Reference {

        this.assertOrder_();

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_,
            query: lodash.extend({}, this.query_, { orderByValue: true })
        });
    }

    push(
        value?: MockValue | null,
        callback?: (error: Error | null) => any
    ): firebase.database.ThenableReference {

        if (this.isQuery_()) {
            throw unsupported("Queries do not support 'push'.");
        }

        const childRef = this.child(getPushedKey()) as any as MockRef;
        return new MockRef({
            app: childRef.app_,
            database: childRef.database_,
            emitters: this.emitters_,
            path: childRef.path_,
            promise: childRef.set(value)
        });
    }

    remove(
        callback?: (error: Error | null) => any
    ): firebase.database.ThenableReference {

        if (this.isQuery_()) {
            throw unsupported("Queries do not support 'remove'.");
        }

        const previousContent = this.database_.content;

        const promise = new Promise((resolve, reject) => {

            this.enqueue_("remove", () => {

                try {

                    if (this.jsonPath_.length === 0) {

                        this.database_.content = {};

                    } else if (json.has(this.database_.content, this.jsonPath_)) {

                        this.database_.content = json.remove(
                            this.database_.content,
                            this.jsonPath_
                        );
                        json.prune(this.database_.content, this.jsonPath_);
                    }

                    this.rootEmitter_.emit("content", {
                        content: this.database_.content,
                        previousContent
                    });

                    if (callback) {
                        callback(null);
                    }
                    resolve();

                } catch (error) {

                    if (callback) {
                        callback(error);
                    }
                    reject(error);
                }
            });
        });

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_,
            promise: promise
        });
    }

    set(
        value: MockValue | null,
        callback?: (error: Error | null) => any
    ): firebase.Promise<any> {

        if (this.isQuery_()) {
            throw unsupported("Queries do not support 'set'.");
        }

        if (value === null) {
            return this.remove();
        }

        const previousContent = this.database_.content;

        return new Promise((resolve, reject) => {

            this.enqueue_("set", () => {

                try {

                    validateKeys(value);
                    value = json.clone(value);

                    if (this.jsonPath_.length === 0) {

                        this.database_.content = value;

                    } else {

                        this.database_.content = json.set(
                            this.database_.content,
                            this.jsonPath_,
                            value
                        );
                    }

                    this.rootEmitter_.emit("content", {
                        content: this.database_.content,
                        previousContent
                    });

                    if (callback) {
                        callback(null);
                    }
                    resolve();

                } catch (error) {

                    if (callback) {
                        callback(error);
                    }
                    reject(error);
                }
            });
        });
    }

    setPriority(
        priority: string | number | null,
        callback?: (error: Error | null) => any
    ): firebase.Promise<any> {

        throw unsupported();
    }

    setWithPriority(
        value: MockValue | null,
        priority: string | number | null,
        callback?: (error: Error | null) => any
    ): firebase.Promise<any> {

        throw unsupported();
    }

    startAt(value: MockPrimitive | null, key?: string): firebase.database.Reference {

        this.assertStartAt_();

        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_,
            query: lodash.extend({}, this.query_, { key, startAt: value })
        });
    }

    then(
        resolver?: (snapshot: firebase.database.DataSnapshot) => any,
        rejector?: (error: Error) => any
    ): firebase.Thenable<any> {

        return this.promise_.then(resolver, rejector);
    }

    toJSON(): Object {

        throw unsupported();
    }

    toString(): string {

        const base = lodash.trimEnd(this.app_.options["databaseURL"] || "", "/");
        return `${base}/${this.path_}`;
    }

    transaction(
        updateCallback: (value: any) => any,
        completeCallback?: (error: Error | null, committed: boolean, snapshot: firebase.database.DataSnapshot | null) => any,
        applyLocally?: boolean
    ): firebase.Promise<any> {

        if (this.isQuery_()) {
            throw unsupported("Queries do not support 'transaction'.");
        }

        const previousContent = this.database_.content;

        return new Promise((resolve, reject) => {

            this.enqueue_("transaction", () => {

                try {

                    const previousValue = json.clone(json.get(
                        this.database_.content,
                        this.jsonPath_
                    ));
                    const updatedValue = updateCallback(previousValue);

                    const committed = updatedValue !== undefined;
                    if (committed) {

                        if (this.jsonPath_.length === 0) {

                            this.database_.content = updatedValue;

                        } else {

                            this.database_.content = json.set(
                                this.database_.content,
                                this.jsonPath_,
                                updatedValue
                            );
                        }
                    }

                    const snapshot = new MockDataSnapshot({
                        ref: this
                    });

                    if (completeCallback) {
                        completeCallback(null, committed, snapshot);
                    }
                    resolve({ committed, snapshot });

                    this.rootEmitter_.emit("content", {
                        content: this.database_.content,
                        previousContent
                    });

                } catch (error) {

                    if (completeCallback) {
                        completeCallback(error, false, null);
                    }
                    reject(error);
                }
            });
        });
    }

    update(
        value: MockValue,
        callback?: (error: Error | null) => any
    ): firebase.Promise<any> {

        if (this.isQuery_()) {
            throw unsupported("Queries do not support 'update'.");
        }

        const previousContent = this.database_.content;

        return new Promise((resolve, reject) => {

            this.enqueue_("update", () => {

                try {

                    validateKeysOrPaths(value);

                    lodash.each(value, (value, key) => {

                        const path = toJsonPath(json.join(this.jsonPath_, key));
                        if (value === null) {
                            this.database_.content = json.remove(
                                this.database_.content,
                                path
                            );
                            json.prune(this.database_.content, path);
                        } else {
                            this.database_.content = json.set(
                                this.database_.content,
                                path,
                                json.clone(value)
                            );
                        }
                    });

                    this.rootEmitter_.emit("content", {
                        content: this.database_.content,
                        previousContent
                    });

                    if (callback) {
                        callback(null);
                    }
                    resolve();

                } catch (error) {

                    if (callback) {
                        callback(error);
                    }
                    reject(error);
                }
            });
        });
    }

    private assertEndAt_(): void {

        if (this.query_.endAt !== undefined) {
            throw error("database/query", "Already specified end at.");
        }
        if (this.query_.equalTo !== undefined) {
            throw error("database/query", "Already specified equal to.");
        }
        if ((this.query_.startAt !== undefined) && (this.query_.limitToFirst || this.query_.limitToLast)) {
            throw error("database/query", "Already specified start at and limit.");
        }
    }

    private assertEqualTo_(): void {

        if (this.query_.endAt !== undefined) {
            throw error("database/query", "Already specified end at.");
        }
        if (this.query_.startAt !== undefined) {
            throw error("database/query", "Already specified start at.");
        }
    }

    private assertLimit_(): void {

        if ((this.query_.startAt !== undefined) && (this.query_.endAt !== undefined)) {
            throw error("database/query", "Already specified start/end at.");
        }
        if (this.query_.limitToFirst) {
            throw error("database/query", "Already limited to first.");
        }
        if (this.query_.limitToLast) {
            throw error("database/query", "Already limited to last.");
        }
    }

    private assertOrder_(): void {

        if (this.query_.orderByChild) {
            throw error("database/query", "Already ordered by child.");
        }
        if (this.query_.orderByKey) {
            throw error("database/query", "Already ordered by key.");
        }
        if (this.query_.orderByPriority) {
            throw error("database/query", "Already ordered by priority.");
        }
        if (this.query_.orderByValue) {
            throw error("database/query", "Already ordered by value.");
        }
    }

    private assertStartAt_(): void {

        if ((this.query_.endAt !== undefined) && (this.query_.limitToFirst || this.query_.limitToLast)) {
            throw error("database/query", "Already specified end at and limit.");
        }
        if (this.query_.equalTo !== undefined) {
            throw error("database/query", "Already specified equal to.");
        }
        if (this.query_.startAt !== undefined) {
            throw error("database/query", "Already specified start at.");
        }
    }

    private enqueue_(name: string, action: Function): void {

        this.queue_.push({ action, name });
        setTimeout(() => {

            if (this.queue_.length > 0) {

                let filtered = lodash.filter(this.queue_, (queued) => queued.name === "init_child_added");
                lodash.each(filtered, (queued) => { queued.action(); });

                filtered = lodash.filter(this.queue_, (queued) => queued.name === "init_value");
                lodash.each(filtered, (queued) => { queued.action(); });

                filtered = lodash.filter(this.queue_, (queued) => !/^init_/.test(queued.name));
                lodash.each(filtered, (queued) => { queued.action(); });

                this.queue_ = [];
            }
        }, 0);
    }

    private sharedListener_(
        eventType: string,
        { snapshot, previousSnapshot }: { snapshot: MockDataSnapshot, previousSnapshot: MockDataSnapshot }
    ): void {

        const childEvent = /^child_/.test(eventType);
        const limitQuery = this.query_.limitToFirst || this.query_.limitToLast;

        let pairs: MockPair[];
        let previousKey: string;
        let previousPairs: MockPair[];

        if (childEvent) {

            pairs = new MockDataSnapshot({
                ref: this,
                snapshot
            }).pairs_();

            const index = lodash.findIndex(pairs, (pair) => pair.key === snapshot.ref.key);
            previousKey = (index <= 0) ? null : pairs[index - 1].key;

            if (limitQuery) {

                previousPairs = new MockDataSnapshot({
                    ref: this,
                    snapshot: previousSnapshot
                }).pairs_();

                if ((eventType === "child_added") || (eventType === "child_changed")) {

                    lodash.each(lodash.differenceWith(
                        previousPairs,
                        pairs,
                        MockDataSnapshot.pairKeyEquator
                    ), (removedPair) => {

                        this.refEmitter_.emit("child_removed", new MockDataSnapshot({
                            ref: this,
                            snapshot: previousSnapshot
                        }).child(removedPair.key));
                    });
                }
            }
        }

        this.refEmitter_.emit(eventType, snapshot, previousKey);

        if (childEvent && limitQuery && ((eventType === "child_changed") || (eventType === "child_removed"))) {

            lodash.each(lodash.differenceWith(
                pairs,
                previousPairs,
                MockDataSnapshot.pairKeyEquator
            ), (addedPair) => {

                const index = lodash.findIndex(pairs, (pair) => pair.key === addedPair.key);
                previousKey = (index <= 0) ? null : pairs[index - 1].key;
                this.refEmitter_.emit("child_added", new MockDataSnapshot({
                    ref: this,
                    snapshot: previousSnapshot
                }).child(addedPair.key), previousKey);
            });
        }
    }
}

function getPushedKey(): string {

    return key();
}

function toJsonPath(path: string): string {

    path = path.replace(/^(http|https):\/\/[^\/]+/, "");
    return (path.length > 0) ? json.slash(path) : "";
}

function toRelativePath(path: string): string {

    return lodash.trim(path).replace(/^(http|https):\/\/[^\/]+/, "");
}

function validateKeys(value: MockValue): void {

    JSON.stringify(value, (key, value) => {

        if (/[\/\.\$\[\]#]/.test(key)) {
            throw new Error(`Key ('${key}') contains illegal character.`);
        }
        return value;
    });
}

function validateKeysOrPaths(value: MockValue): void {

    JSON.stringify(value, (key, value) => {

        if (/[\.\$\[\]#]/.test(key)) {
            throw new Error(`Key/path ('${key}') contains illegal character.`);
        }
        return value;
    });
}
