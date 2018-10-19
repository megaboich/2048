"use strict";
// Karma configuration
module.exports = function(config) {
  config.set({
    /*
         * Enable or disable watching files and executing the tests whenever
         * one of the files in the "files" field is changed.
         */
    autoWatch: false,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["ChromeHeadless"],

    customLaunchers: {
      ChromeHeadless: {
        base: "Chrome",
        flags: [
          "--no-sandbox",
          // See https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
          "--headless",
          "--disable-gpu",
          // Without a remote debugging port, Google Chrome exits immediately.
          " --remote-debugging-port=9222"
        ]
      }
    },

    // web server port
    port: 9876,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine"],

    /**
     * A lot of plugins are available for test results reporting.
     * You can find them here: https://npmjs.org/browse/keyword/karma-reporter
     */
    reporters: ["brief"],

    files: ["./src/tests.js"],

    mime: {
      "text/javascript": ["ts"]
    },

    // list of files to exclude
    exclude: [],

    /**
     * Transform files before loading them.
     */
    preprocessors: {
      "./src/tests.js": ["webpack"]
    },

    webpack: (() => {
      // Here we load our base webpack config and override some settings.
      // This is because we want to reuse configuration and avoid duplication
      let webpackConf = require("./webpack.config.js")({ unit_tests: "true" });
      delete webpackConf.entry; // should be empty for karma
      delete webpackConf.output; // should be empty for karma
      delete webpackConf.optimization; // we do not need to split chunks for karma tests
      return webpackConf;
    })()
  });
};
