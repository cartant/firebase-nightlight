/**
 * @license Use of this source code is governed by a GPL-3.0 license that
 * can be found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

"use strict";

const banner = "/*GPL-3.0 license https://github.com/cartant/firebase-nightlight/blob/master/LICENSE*/\n";
const fs = require("fs");

fs.readdirSync("./bundles").forEach((bundle) => {

    if (/\.umd\.js$/.test(bundle)) {
        const file = `./bundles/${bundle}`;
        const content = fs.readFileSync(file).toString();
        fs.writeFileSync(file, banner + content);
    }
});
