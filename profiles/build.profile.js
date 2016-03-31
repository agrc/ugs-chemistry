/*jshint unused:false */

var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: 'uglify',
    layerOptimize: 'uglify',
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        'dojo/dojo': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/packages',
                'app/run',
                'app/App',
                'dojox/gfx/path',
                'dojox/gfx/svg',
                'dojox/gfx/shape'
            ],
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        },
        'ijit/widgets/authentication/UserAdmin': {
            exclude: ['dojo/dojo']
        }
    },
    packages: [{
        name: 'bootstrap-css-only',
        location: './bootstrap-css-only'
    },{
        name: 'spin',
        resourceTags: {
            copyOnly: function (filename, mid) {
                return mid === 'spin/jquery.spin';
            }
        }
    },{
        name: 'moment',
        main: 'moment',
        resourceTags: {
            amd: function (filename) {
                return /\.js$/.test(filename);
            },
            test: function (filename, mid) {
                return /\/tests/.test(mid);
            },
            miniExclude: function (filename, mid) {
                return /\/src/.test(mid) || /\/templates/.test(mid);
            }
        }
    }],
    staticHasFeatures: {
        // The trace & log APIs are used for debugging the loader, so we don’t need them in the build
        'dojo-trace-api':0,
        'dojo-log-api':0,

        // This causes normally private loader data to be exposed for debugging, so we don’t need that either
        'dojo-publish-privates':0,

        // We’re fully async, so get rid of the legacy loader
        'dojo-sync-loader':0,

        // dojo-xhr-factory relies on dojo-sync-loader
        'dojo-xhr-factory':0,

        // We aren’t loading tests in production
        'dojo-test-sniff':0
    },
    userConfig: {
        packages: ['app', 'dijit', 'dojox', 'agrc', 'ijit', 'esri', 'toaster']
    }
};
