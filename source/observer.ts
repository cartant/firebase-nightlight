/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

export function toObserver(...args: any[]): any {

    const [arg] = args;
    if (typeof arg === "function") {
        const [next, error, complete] = args;
        return { complete, error, next };
    } else if ((typeof arg === "object") && (arg.next || arg.error || arg.complete)) {
        return arg;
    }
    return undefined;
}
