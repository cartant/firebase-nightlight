/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import {
    differenceWith as _differenceWith,
    each as _each,
    extend as _extend,
    filter as _filter,
    findIndex as _findIndex,
    intersectionWith as _intersectionWith,
    isEmpty as _isEmpty,
    isObject as _isObject,
    map as _map,
    trim as _trim,
    trimEnd as _trimEnd
} from "lodash";

declare module "./lodash" {
    let differenceWith: typeof _differenceWith;
    let each: typeof _each;
    let extend: typeof _extend;
    let filter: typeof _filter;
    let findIndex: typeof _findIndex;
    let intersectionWith: typeof _intersectionWith;
    let isEmpty: typeof _isEmpty;
    let isObject: typeof _isObject;
    let map: typeof _map;
    let trim: typeof _trim;
    let trimEnd: typeof _trimEnd;
}
