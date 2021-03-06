/* jshint maxlen:false */
define([
    'dojo/has',
    'dojo/request/xhr',

    'esri/Color',
    'esri/config',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol',

    'dojo/domReady!'
], function (
    has,
    xhr,

    Color,
    esriConfig,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol
) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');

    var agsDomain;
    var apiKey;
    var quadWord;
    var servicesFolder = 'UGSChemistry';
    if (has('agrc-build') === 'prod') {
        apiKey = 'AGRC-78940522976389';
        agsDomain = 'maps.geology.utah.gov';
        quadWord = 'complex-salary-gram-spain';
        servicesFolder = 'Water';
        esriConfig.defaults.io.corsEnabledServers.push(agsDomain);
    } else if (has('agrc-build') === 'stage') {
        agsDomain = 'test.mapserv.utah.gov';
        apiKey = 'AGRC-AC122FA9671436';
        quadWord = 'opera-event-little-pinball';
    } else {
        // localhost
        agsDomain = window.location.host;
    }

    var baseUrl = window.location.protocol + '//' + agsDomain + '/arcgis/rest/services/' + servicesFolder;
    var drawingColor = [51, 160, 44];
    var selectionColor = [52, 208, 231];
    var StationId = 'StationId';
    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // appName: String
        //      for permissions proxy
        appName: 'ugschemistry',

        agsDomain: agsDomain,

        // dynamicWorkspaceId: String
        dynamicWorkspaceId: 'UGSWaterChemistry',

        // version.: String
        //      The version number.
        version: '1.1.1',

        // user: Object
        //      Permission proxy user object
        user: null,

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        apiKey: apiKey, // acquire at developer.mapserv.utah.gov

        // quadWord: String
        //      For use with discover services
        quadWord: quadWord,

        // stationsDisplayLimit: Number
        //      The max number of stations that the app will display
        stationsDisplayLimit: 1000,

        urls: {
            baseUrl: baseUrl,
            mapService: baseUrl + '/MapService/MapServer',
            secureMapService: baseUrl + '/SecureMapService/MapServer',
            geometry: baseUrl + '/Geometry/GeometryServer',
            buildChart: baseUrl + '/Toolbox/GPServer/BuildChart',
            secureBuildChart: baseUrl + '/ToolboxSecure/GPServer/BuildChartSecure',
            download: baseUrl + '/Toolbox/GPServer/Download',
            secureDownload: baseUrl + '/ToolboxSecure/GPServer/DownloadSecure',
            esriStreets: '//server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
        },

        minFeatureLayerScale: 500000,
        stationSymbolSize: 9,
        drawingSymbol: new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol()
                .setColor(new Color(drawingColor)),
            new Color(drawingColor.concat([0.25]))
        ),
        selectionSymbol: new SimpleMarkerSymbol()
            .setColor(new Color(selectionColor))
            .setSize(12),

        fieldNames: {
            // Stations
            Id: 'Id',
            StateCode: 'StateCode',
            CountyCode: 'CountyCode',
            StationType: 'StationType',
            HUC8: 'HUC8',
            OrgId: 'OrgId',
            StationName: 'StationName',
            Depth: 'Depth',
            WIN: 'WIN',

            // Results
            StationId: StationId, // also used in Stations
            ParamGroup: 'ParamGroup',
            DataSource: 'DataSource', // also used in Stations
            Param: 'Param',
            ResultValue: 'ResultValue',
            SampleDate: 'SampleDate',
            Unit: 'Unit',
            DetectCond: 'DetectCond'
        },

        queryByResults: StationId + " IN (SELECT " + StationId + " FROM ugswaterchemistry.Results WHERE ",
        showAllQuery: '1 = 1',

        layerIndices: {
            main: 0,
            results: 1,
            parameters: 2
        },

        topics: {
            filterFeatures: 'ugs-filter-features',
            addGraphic: 'ugs-add-graphic',
            removeGraphic: 'ugs-remove-graphic',
            queryIdsComplete: 'ugs-query-ids-complete',
            clearStationSelection: 'ugs-clear-station-selection',
            toggleGrid: 'ugs-toggle-grid',
            toast: 'ugs-toast',
            pauseMapClick: 'ugs-pause-map-click',
            resumeMapClick: 'ugs-resume-map-click',
            showLimitMessage: 'ugs-show-limit-message'
        },

        counties: [
            ['Beaver', 49001],
            ['Box Elder', 49003],
            ['Cache', 49005],
            ['Carbon', 49007],
            ['Daggett', 49009],
            ['Davis', 49011],
            ['Duchesne', 49013],
            ['Emery', 49015],
            ['Garfield', 49017],
            ['Grand', 49019],
            ['Iron', 49021],
            ['Juab', 49023],
            ['Kane', 49025],
            ['Millard', 49027],
            ['Morgan', 49029],
            ['Piute', 49031],
            ['Rich', 49033],
            ['Salt Lake', 49035],
            ['San Juan', 49037],
            ['Sanpete', 49039],
            ['Sevier', 49041],
            ['Summit', 49043],
            ['Tooele', 49045],
            ['Uintah', 49047],
            ['Utah', 49049],
            ['Wasatch', 49051],
            ['Washington', 49053],
            ['Wayne', 49055],
            ['Weber', 49057]
        ],
        states: [
            ['Utah', 49],
            ['Idaho', 16],
            ['Wyoming', 56],
            ['Colorado', 8],
            ['New Mexico', 35],
            ['Arizona', 4],
            ['Nevada', 32]
        ],
        siteTypes: [
            ['Atmosphere', 'Atmosphere'],
            ['Facility', 'Facility'],
            ['Lake, Reservoir,  Impoundment', 'Lake, Reservoir,  Impoundment'],
            ['Land', 'Land'],
            ['Other Groundwater', 'Other Groundwater'],
            ['Other', 'Other'],
            ['Spring', 'Spring'],
            ['Stream', 'Stream'],
            ['Surface Water', 'Surface Water'],
            ['Well', 'Well'],
            ['Wetland', 'Wetland']
        ],
        parameterGroups: [
            ['Information', 'Information'],
            ['Inorganics, Minor, Metals', 'Inorganics, Minor, Metals'],
            ['Inorganics, Major, Metals', 'Inorganics, Major, Metals'],
            ['Stable Isotopes', 'Stable Isotopes'],
            ['Inorganics, Minor, Non-metals', 'Inorganics, Minor, Non-metals'],
            ['Organics, other', 'Organics, other'],
            ['Microbiological', 'Microbiological'],
            ['Biological', 'Biological'],
            ['Nutrient', 'Nutrient'],
            ['Inorganics, Major, Non-metals', 'Inorganics, Major, Non-metals'],
            ['Radiochemical', 'Radiochemical'],
            ['Organics, pesticide', 'Organics, pesticide'],
            ['Organics, PCBs', 'Organics, PCBs'],
            ['Toxicity', 'Toxicity'],
            ['Sediment', 'Sediment'],
            ['Physical', 'Physical']
        ],
        dataSources: [
            ['DOGM', 'DOGM'],
            ['DWR', 'DWR'],
            ['SDWIS', 'SDWIS'],
            ['UGS', 'UGS'],
            ['WQP', 'WQP']
        ],
        chartMsgTxt: 'Showing ${0} results from ${1} stations.'
    };

    xhr(require.baseUrl + 'secrets.json', {
        handleAs: 'json',
        sync: true
    }).then(function (secrets) {
        window.AGRC.quadWord = secrets.quadWord;
        window.AGRC.apiKey = secrets.apiKey;
    }, function () {
        throw 'Error getting secrets!';
    });

    return window.AGRC;
});
