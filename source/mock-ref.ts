/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as json from "./json";
import * as lodash from "./lodash";

import { EventEmitter2, Listener } from "eventemitter2";
import { key } from "firebase-key";
import { firebase, FirebasePromise, FirebaseThenable } from "./firebase";
import { MockDataSnapshot, MockPair } from "./mock-data-snapshot";
import { error_, unsupported_ } from "./mock-error";

import {
    MockEmitters,
    MockPrimitive,
    MockQuery,
    MockRefInternals,
    MockRefStats,
    MockValue
} from "./mock-types";

let lastRefId = 0;

export interface MockRefOptions {
    app: firebase.app.App;
    database: { content: MockValue | null };
    emitters: MockEmitters;
    path: string | null;
    promise?: FirebasePromise<any>;
    query?: MockQuery;
}

export class MockRef implements firebase.database.ThenableReference, MockRefInternals {

    public readonly jsonPath_: string;
    public readonly query_: MockQuery;
    public readonly [Symbol.toStringTag]: "Promise";

    private app_: firebase.app.App;
    private database_: { content: MockValue | null };
    private emitters_: MockEmitters;
    private id_: number;
    private key_: string | null;
    private parentPath_: string | null;
    private path_: string;
    private promise_?: FirebasePromise<any>;
    private queue_: any[];
    private refEmitter_: EventEmitter2;
    private refEmitterBindings_: {
        boundError: Function,
        boundSuccess: Function,
        type: string,
        unboundError: Function | null,
        unboundSuccess: Function
    }[];
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

        if (this.path_ === ".info") {
            this.database_.content = this.database_.content || {};
            this.database_.content[".info"] = this.database_.content[".info"] || {
                connected: true,
                serverTimeOffset: 0
            };
        } else if (/[\.\$\[\]#]/.test(this.path_)) {
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

        if (!this.promise_) {
            (this as any)["catch"] = null;
            (this as any)["then"] = null;
        }

        if (this.queried_) {
            (this as any)["push"] = null;
            (this as any)["remove"] = null;
            (this as any)["set"] = null;
            (this as any)["update"] = null;
        }
    }

    get content_(): MockValue | null {

        return this.database_.content;
    }

    get key(): string | null {

        return this.key_;
    }

    get parent(): firebase.database.Reference | null {

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

    get queried_(): boolean {

        return !lodash.isEmpty(this.query_);
    }

    get ref(): firebase.database.Reference {

        return this.queried_ ? new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: this.path_
        }) : this;
    }

    get root(): firebase.database.Reference {

        if (this.key_ === null) {
            return this;
        }
        return new MockRef({
            app: this.app_,
            database: this.database_,
            emitters: this.emitters_,
            path: null
        });
    }

    catch(rejector?: (error: Error) => any): any {

        if (this.promise_) {
            return rejector ?
                this.promise_.catch(rejector) :
                this.promise_.catch();
        }
        throw new Error("No internal promise.");
    }

    child(path: string): firebase.database.Reference {

        if (this.queried_) {
            throw unsupported_("Queries do not support 'child'.");
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

    isEqual(other: firebase.database.Query | null): boolean {

        throw unsupported_();
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
            if (callback) {
                const index = lodash.findIndex(this.refEmitterBindings_, (binding) => binding.unboundSuccess === callback);
                if (index !== -1) {
                    const binding = this.refEmitterBindings_[index];
                    this.refEmitterBindings_.splice(index, 1);
                    this.refEmitter_.off(eventType, binding.boundSuccess as Listener);
                    this.refEmitter_.off(`${eventType}_error`, binding.boundError as Listener);
                }
            } else {
                const indices: number[] = [];
                lodash.each(this.refEmitterBindings_, (binding, index) => {
                    if (binding.type === eventType) {
                        indices.push(index);
                        this.refEmitter_.off(eventType, binding.boundSuccess as Listener);
                        this.refEmitter_.off(`${eventType}_error`, binding.boundError as Listener);
                    }
                });
                indices.reverse();
                lodash.each(indices, (index) => this.refEmitterBindings_.splice(index, 1));
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

        const safeErrorCallback = errorCallback ?
            errorCallback as Function :
            () => {};

        // tslint:disable-next-line
        let boundErrorCallback = safeErrorCallback;
        let boundSuccessCallback = successCallback;
        if (context) {
            boundErrorCallback = safeErrorCallback.bind(context);
            boundSuccessCallback = successCallback.bind(context);
        }

        const mockSnapshot = new MockDataSnapshot({
            ref: this
        });

        switch (eventType) {
        case "child_added":
            this.enqueue_("init_child_added", () => {

                let previousKey: string | null = null;

                if (this.refEmitter_.listeners("child_added").indexOf(boundSuccessCallback as Listener) !== -1) {

                    const error = findError(this.jsonPath_, this.database_.content);
                    if (error) {
                        boundErrorCallback(error);
                    } else {
                        lodash.each(mockSnapshot.pairs_(), (pair) => {

                            boundSuccessCallback(mockSnapshot.child(pair.key), previousKey);
                            previousKey = pair.key;
                        });
                    }
                }
            });
            break;
        case "value":
            this.enqueue_("init_value", () => {

                if (this.refEmitter_.listeners("value").indexOf(boundSuccessCallback) !== -1) {

                    const error = findError(this.jsonPath_, this.database_.content);
                    if (error) {
                        boundErrorCallback(error);
                    } else {
                        boundSuccessCallback(mockSnapshot);
                    }
                }
            });
            break;
        default:
            break;
        }

        this.refEmitterBindings_.push({
            boundError: boundErrorCallback,
            boundSuccess: boundSuccessCallback,
            type: eventType,
            unboundError: errorCallback || null,
            unboundSuccess: successCallback
        });
        this.refEmitter_.on(eventType, boundSuccessCallback);
        this.refEmitter_.on(`${eventType}_error`, boundErrorCallback as Listener);
        return successCallback;
    }

    once(
        eventType: string,
        successCallback?: (snapshot: firebase.database.DataSnapshot, prevKey?: string | null) => any,
        errorCallback?: Object | null,
        context?: Object | null
    ): FirebasePromise<any> {

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

        throw unsupported_();
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

        throw unsupported_();
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
        value?: any,
        callback?: (error: Error | null) => any
    ): firebase.database.ThenableReference {

        if (this.queried_) {
            throw unsupported_("Queries do not support 'push'.");
        }

        const childRef = this.child(getPushedKey()) as any as MockRef;
        return new MockRef({
            app: childRef.app_,
            database: childRef.database_,
            emitters: this.emitters_,
            path: childRef.path_,
            promise: (value === undefined) ?
                Promise.resolve(childRef) :
                childRef.set(value, callback).then(() => childRef)
        });
    }

    remove(
        callback?: (error: Error | null) => any
    ): firebase.database.ThenableReference {

        if (this.queried_) {
            throw unsupported_("Queries do not support 'remove'.");
        }

        const previousContent = this.database_.content;

        const promise = new Promise((resolve, reject) => {

            this.enqueue_("remove", () => {

                try {

                    const error = findError(this.jsonPath_, this.database_.content);
                    if (error) {
                        throw error;
                    }

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
        value: any,
        callback?: (error: Error | null) => any
    ): FirebasePromise<any> {

        if (this.queried_) {
            throw unsupported_("Queries do not support 'set'.");
        }

        if (value === null) {
            return this.remove();
        }

        const previousContent = this.database_.content;

        return new Promise((resolve, reject) => {

            this.enqueue_("set", () => {

                try {

                    validateKeys(value as MockValue);
                    value = json.clone(value);

                    const error = findError(this.jsonPath_, this.database_.content);
                    if (error) {
                        throw error;
                    }

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
    ): FirebasePromise<any> {

        throw unsupported_();
    }

    setWithPriority(
        value: MockValue | null,
        priority: string | number | null,
        callback?: (error: Error | null) => any
    ): FirebasePromise<any> {

        throw unsupported_();
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

    stats_(): MockRefStats {

        const stats = {
            listeners: {
                child_added: 0,
                child_changed: 0,
                child_moved: 0,
                child_removed: 0,
                total: 0,
                value: 0
            }
        };

        this.refEmitterBindings_.forEach((binding) => {

            ++stats.listeners[binding.type];
            ++stats.listeners.total;
        });
        return stats;
    }

    then(
        resolver?: (snapshot: firebase.database.DataSnapshot) => any,
        rejector?: (error: Error) => any
    ): FirebaseThenable<any> {

        if (this.promise_) {
            return this.promise_.then(resolver, rejector);
        }
        throw new Error("No internal promise.");
    }

    toJSON(): Object {

        throw unsupported_();
    }

    toString(): string {

        const base = lodash.trimEnd(this.app_.options["databaseURL"] || "", "/");
        return `${base}/${this.path_}`;
    }

    transaction(
        updateCallback: (value: any) => any,
        completeCallback?: (error: Error | null, committed: boolean, snapshot: firebase.database.DataSnapshot | null) => any,
        applyLocally?: boolean
    ): FirebasePromise<any> {

        if (this.queried_) {
            throw unsupported_("Queries do not support 'transaction'.");
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
        values: Object,
        callback?: (error: Error | null) => any
    ): FirebasePromise<any> {

        if (this.queried_) {
            throw unsupported_("Queries do not support 'update'.");
        }

        const previousContent = this.database_.content;

        return new Promise((resolve, reject) => {

            this.enqueue_("update", () => {

                try {

                    validateKeysOrPaths(values as MockValue);

                    lodash.each(values, (value, key: string) => {

                        const jsonPath = toJsonPath(json.join(this.jsonPath_, key));
                        const error = findError(jsonPath, this.database_.content);
                        if (error) {
                            throw error;
                        }

                        if (value === null) {
                            this.database_.content = json.remove(
                                this.database_.content,
                                jsonPath
                            );
                            json.prune(this.database_.content, jsonPath);
                        } else {
                            this.database_.content = json.set(
                                this.database_.content,
                                jsonPath,
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
            throw error_("database/query", "Already specified end at.");
        }
        if (this.query_.equalTo !== undefined) {
            throw error_("database/query", "Already specified equal to.");
        }
        if ((this.query_.startAt !== undefined) && (this.query_.limitToFirst || this.query_.limitToLast)) {
            throw error_("database/query", "Already specified start at and limit.");
        }
    }

    private assertEqualTo_(): void {

        if (this.query_.endAt !== undefined) {
            throw error_("database/query", "Already specified end at.");
        }
        if (this.query_.startAt !== undefined) {
            throw error_("database/query", "Already specified start at.");
        }
    }

    private assertLimit_(): void {

        if ((this.query_.startAt !== undefined) && (this.query_.endAt !== undefined)) {
            throw error_("database/query", "Already specified start/end at.");
        }
        if (this.query_.limitToFirst) {
            throw error_("database/query", "Already limited to first.");
        }
        if (this.query_.limitToLast) {
            throw error_("database/query", "Already limited to last.");
        }
    }

    private assertOrder_(): void {

        if (this.query_.orderByChild) {
            throw error_("database/query", "Already ordered by child.");
        }
        if (this.query_.orderByKey) {
            throw error_("database/query", "Already ordered by key.");
        }
        if (this.query_.orderByPriority) {
            throw error_("database/query", "Already ordered by priority.");
        }
        if (this.query_.orderByValue) {
            throw error_("database/query", "Already ordered by value.");
        }
    }

    private assertStartAt_(): void {

        if ((this.query_.endAt !== undefined) && (this.query_.limitToFirst || this.query_.limitToLast)) {
            throw error_("database/query", "Already specified end at and limit.");
        }
        if (this.query_.equalTo !== undefined) {
            throw error_("database/query", "Already specified equal to.");
        }
        if (this.query_.startAt !== undefined) {
            throw error_("database/query", "Already specified start at.");
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

        if (this.refEmitterBindings_.length === 0) {
            return;
        }

        const error = findError(this.jsonPath_, this.database_.content);
        if (error) {
            this.refEmitter_.emit(`${eventType}_error`, error);
            return;
        }

        const childEvent = /^child_/.test(eventType);
        const limitQuery = this.query_.limitToFirst || this.query_.limitToLast;

        let pairs: MockPair[] = [];
        let pairsIndex: number = -1;
        let previousKey: string | null = null;
        let previousPairs: MockPair[] = [];
        let previousPairsIndex: number = -1;

        if (childEvent) {

            pairs = new MockDataSnapshot({
                ref: this,
                snapshot
            }).pairs_();
            pairsIndex = lodash.findIndex(pairs, (pair) => pair.key === snapshot.ref.key);
            previousKey = (pairsIndex <= 0) ? null : pairs[pairsIndex - 1].key;

            previousPairs = new MockDataSnapshot({
                ref: this,
                snapshot: previousSnapshot
            }).pairs_();
            previousPairsIndex = lodash.findIndex(previousPairs, (pair) => pair.key === previousSnapshot.ref.key);

            if (limitQuery) {

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

        if (!childEvent || (pairsIndex !== -1) || (previousPairsIndex !== -1)) {

            this.refEmitter_.emit(
                eventType,
                (eventType === "child_removed") ? previousSnapshot : snapshot,
                previousKey
            );
        }

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

function findError(jsonPath: string, content: MockValue | null): Error | null {

    if (content === null) {
        return null;
    }

    const parts = jsonPath.split("/").filter(Boolean);

    if (json.has(content, "/.error")) {
        return toError(json.get(content, "/.error"));
    }

    for (let p = 0; p < parts.length; ++p) {
        const path = `${json.join.apply(null, [...parts.slice(0, p + 1), ".error"])}`;
        if (json.has(content, path)) {
            return toError(json.get(content, path));
        }
    }
    return null;

    function toError(value: any): Error {

        const error = new Error((typeof value === "string") ?
            value :
            value.message || "Unknown message."
        );
        error["code"] = value.code || "unknown/code";
        return error;
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
