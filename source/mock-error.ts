/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

export function error(code: string, message: string): Error {

    const error = new Error(message || "Unknown error.");
    error["code"] = code;
    return error;
}

export function unsupported(message?: string): Error {

    const error = new Error(message || "Not supported.");
    return error;
}
