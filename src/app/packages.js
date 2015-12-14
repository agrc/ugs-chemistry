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
            'put-selector',
            'xstyle',
            {
                name: 'ladda',
                location: './ladda-bootstrap',
                main: 'dist/ladda'
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
