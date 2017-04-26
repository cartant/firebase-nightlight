"use strict";

exports = module.exports = function (config) {

    config.set({
        autoWatch: false,
        basePath: "",
        browsers: ["PhantomJS"],
        colors: true,
        concurrency: Infinity,
        exclude: [],
        files: [
            "bundles/firebase-nightlight-test.umd.js"
        ],
        frameworks: ["mocha"],
        logLevel: config.LOG_INFO,
        port: 9876,
        preprocessors: {},
        proxies: {},
        reporters: ["spec"],
        singleRun: true
    });
};
