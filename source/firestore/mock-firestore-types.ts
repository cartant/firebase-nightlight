/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

export type MockDocumentPrimitive = boolean | number | string;
export type MockDocumentComposite = { [key: string]: MockDocumentPrimitive | MockDocumentComposite };
export type MockDocumentValue = MockDocumentPrimitive | MockDocumentComposite;

export type MockCollection = { [id: string]: MockDocument };
export type MockDocument = {
    collections: { [id: string]: MockCollection },
    data: MockDocumentComposite
};

export type MockFirestoreContent = { [id: string]: MockCollection } | null;
