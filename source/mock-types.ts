/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

import { EventEmitter2 } from "eventemitter2";

export interface MockEmitters {
    shared: { [key: string]: EventEmitter2 };
    root: EventEmitter2;
}
