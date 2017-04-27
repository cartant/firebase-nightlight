/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as jsonPointer from "json-pointer";
import * as lodash from "./lodash";

export function clone(entity: any): any {

    return entity ? JSON.parse(JSON.stringify(entity)) : entity;
}

export function delete_(entity: any, path: string): void {

    jsonPointer.remove(entity, path);
}

export function get(entity: any, path: string): any {

    return jsonPointer.get(entity, path);
}

export function has(entity: any, path: string): boolean {

    return jsonPointer.has(entity, path);
}

export function join(...args: string[]): string {

    const buffer: string[] = [];

    args.forEach((arg) => {
        arg = lodash.trim(arg, "/");
        if (arg) { buffer.push(arg); }
    });
    return slash(buffer.join("/"));
}

export function prune(entity: any, path: string): void {

    while (path.length > 0) {
        if (has(entity, path)) {
            const value = get(entity, path);
            if (value !== null) {
                if (Object.keys(value).length === 0) {
                    jsonPointer.remove(entity, path);
                } else {
                    return;
                }
            }
        }
        path = path.substring(0, path.lastIndexOf("/"));
    }
}

export function remove(entity: any, path: string): any {

    let result;

    if (has(entity, path)) {
        result = lodash.extend({}, entity);
        let iter = result;
        const tokens = jsonPointer.parse(path);
        if (tokens.length > 0) {
            const sentinel = tokens.length - 1;
            tokens.forEach((token, index) => {

                if (index === sentinel) {
                    delete iter[token];
                } else if (entity === undefined) {
                    iter[token] = {};
                    iter = iter[token];
                } else {
                    iter[token] = lodash.extend({}, entity[token]);
                    entity = entity[token];
                    iter = iter[token];
                }
            });
        }
    } else {
        result = entity;
    }
    return result;
}

export function set(entity: any, path: string, value: any): any {

    if (has(entity, path)) {
        const previous = get(entity, path);
        if ((typeof previous !== "object") && (value === previous)) {
            return entity;
        }
    }

    const result = lodash.extend({}, entity);
    let iter = result;
    const tokens = jsonPointer.parse(path);
    if (tokens.length > 0) {
        const sentinel = tokens.length - 1;
        tokens.forEach((token, index) => {

            if (index === sentinel) {
                iter[token] = value;
            } else if (entity === undefined) {
                iter[token] = {};
                iter = iter[token];
            } else {
                iter[token] = lodash.extend({}, entity[token]);
                entity = entity[token];
                iter = iter[token];
            }
        });
    }
    return result;
}

export function slash(path: string): string {

    return `/${lodash.trim(path, "/")}`;
}
