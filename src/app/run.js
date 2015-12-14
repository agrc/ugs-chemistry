(function () {
    // the baseUrl is relavant in source version and while running unit tests.
    // the`typeof` is for when this file is passed as a require argument to the build system
    // since it runs on node, it doesn't have a window object. The basePath for the build system
    // is defined in build.profile.js
    var config = {
        baseUrl: (
            typeof window !== 'undefined' &&
            window.dojoConfig &&
            window.dojoConfig.isJasmineTestRunner
            ) ? '/src' : './'
    };
    require(config, ['dojo/has', 'dojo/parser', 'dojo/domReady!'], function (has, parser) {
        has.add('web-workers', function () {
            return window.Worker;
        });
        parser.parse();
    });
})();
