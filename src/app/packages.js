(function () {
    require({
        packages: [
            'agrc',
            'app',
            'dgrid',
            'dgrid03',
            'dijit',
            'dojo',
            'dojox',
            'dstore',
            'esri',
            'ijit',
            'layer-selector',
            'moment',
            'put-selector',
            'toaster',
            'xstyle',
            {
                name: 'bootstrap',
                location: './bootstrap',
                main: 'dist/js/bootstrap'
            }, {
                name: 'highcharts',
                location: './highcharts',
                main: 'highcharts.src'
            }, {
                name: 'jquery',
                location: './jquery/dist',
                main: 'jquery'
            }, {
                name: 'ladda',
                location: './ladda-bootstrap',
                main: 'js/ladda'
            }, {
                name: 'mustache',
                location: './mustache',
                main: 'mustache'
            }, {
                name: 'spin',
                location: './spinjs',
                main: 'spin'
            }, {
                name: 'stubmodule',
                location: './stubmodule',
                main: 'src/stub-module'
            }, {
                name: 'typeahead',
                location: './bootstrap3-typeahead',
                main: 'bootstrap3-typeahead'
            }
        ],
        map: {
            ladda: {
                spin: 'ladda/dist/spin'
            },
            esri: {
                dgrid: 'dgrid03'
            }
        }
    });
})();
