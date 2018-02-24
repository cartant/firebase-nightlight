/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

export type MockPrimitive = boolean | number | string;
export type MockComposite = { [key: string]: MockPrimitive | MockComposite };
export type MockValue = MockPrimitive | MockComposite;

export type MockDatabaseContent = MockValue | null;

export interface MockQuery {
    endAt?: MockPrimitive | null;
    equalTo?: MockPrimitive | null;
    key?: string;
    limitToFirst?: number;
    limitToLast?: number;
    orderByChild?: string;
    orderByKey?: boolean;
    orderByPriority?: boolean;
    orderByValue?: boolean;
    startAt?: MockPrimitive | null;
}

export interface MockRefStats {
    listeners: {
        child_added: number;
        child_changed: number;
        child_moved: number;
        child_removed: number;
        total: number;
        value: number;
    };
}
