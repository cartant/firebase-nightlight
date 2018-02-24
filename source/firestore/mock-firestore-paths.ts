/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import * as json from "../json";
import * as lodash from "../lodash";

export function toJsonPath(path: string): string {

    return (path.length > 0) ? json.slash(path) : "";
}

export function toPath(path: string): string {

    return lodash.trim(path || "", "/");
}

export function toSlashPath(path: string): string {

    return path.replace(/\./g, "/");
}

export function validateFields(data: { [field: string]: any }): void {
}

export function validatePath(path: string): void {

    // https://firebase.google.com/docs/firestore/quotas#collections_documents_and_fields

    if (/(^|\/)(\.{1,2}|__.*__)(\/|$)/.test(path)) {
        throw new Error("Illegal path.");
    }
}
