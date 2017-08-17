/**
 * @license Copyright © 2017 Nicholas Jamieson. All Rights Reserved.
 * Use of this source code is governed by a GPL-3.0 license that can be
 * found in the LICENSE file at https://github.com/cartant/firebase-nightlight
 */

"use strict";

const argv = require("yargs").argv;
const fs = require("fs");
const preprocess = require("preprocess");

const context = argv.admin ? { ADMIN: "true" } : {};
const options = { srcEol: "\n", type: "ts" };

let names = fs.readdirSync("./source/");
if (argv.admin) {
    names = names.filter((name) => [
        "mock-auth.ts",
        "mock-auth-spec.ts",
        "mock-messaging.ts",
        "mock-messaging-spec.ts",
        "mock-user.ts",
        "mock-user-spec.ts"
    ].indexOf(name) === -1);
}

names.forEach((name) => preprocess.preprocessFileSync(
    `./source/${name}`,
    `./pre/${name}`,
    context,
    options
));
