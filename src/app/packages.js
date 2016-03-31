(function () {
    require({
        packages: [
            'agrc',
            'app',
            'dgrid',
            'dgrid03',
            'dijit',
            'dojo',
            'dojo-bootstrap',
            'dojox',
            'dstore',
            'esri',
            'ijit',
            'moment',
            'put-selector',
            'toaster',
            'xstyle',
            {
                name: 'ladda',
                location: './ladda-bootstrap',
                main: 'js/ladda'
            }, {
                name: 'mustache',
                location: './mustache',
                main: 'mustache'
            }, {
                name: 'highcharts',
                location: './highcharts',
                main: 'highcharts.src'
            }, {
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            }, {
                name: 'stubmodule',
                location: './stubmodule',
                main: 'src/stub-module'
            }
        ],
        map: {
            ijit: {
                jquery: 'dojo/query',
                bootstrap: 'app/dojo-bootstrap-plugins'
            },
            ladda: {
                spin: 'ladda/dist/spin'
            },
            esri: {
                dgrid: 'dgrid03'
            }
        }
    });
})();
