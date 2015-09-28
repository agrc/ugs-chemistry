/* jshint maxlen:false */
define([
    'dojo/has',

    'esri/Color',
    'esri/config',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',

    'dojo/domReady!'
], function (
    has,

    Color,
    esriConfig,
    SimpleFillSymbol,
    SimpleLineSymbol
) {
    // force api to use CORS on mapserv thus removing the test request on app load
    // e.g. http://mapserv.utah.gov/ArcGIS/rest/info?f=json
    esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');

    var agsDomain;
    if (has('agrc-build') === 'prod') {
        // mapserv.utah.gov
        // apiKey = 'AGRC-1B07B497348512';
        agsDomain = 'mapserv.utah.gov';
    } else if (has('agrc-build') === 'stage') {
        // test.mapserv.utah.gov
        // apiKey = 'AGRC-AC122FA9671436';
        agsDomain = 'test.mapserv.utah.gov';
    } else {
        // localhost
        // apiKey = 'AGRC-E5B94F99865799';
        agsDomain = window.location.host;
    }

    var baseUrl = window.location.protocol + '//' + agsDomain + '/arcgis/rest/services';
    var drawingColor = [51, 160, 44];
    var StationId = 'StationId';
    window.AGRC = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // appName: String
        //      for permissions proxy
        appName: 'ugs-chemistry',

        // version.: String
        //      The version number.
        version: '0.5.1',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        apiKey: '', // acquire at developer.mapserv.utah.gov

        urls: {
            mapService: baseUrl + '/UGSChemistry/MapServer',
            geometry: baseUrl + '/Geometry/GeometryServer'
        },

        minFeatureLayerScale: 500000,
        stationSymbolSize: 9,
        drawingSymbol: new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_SOLID,
            new SimpleLineSymbol()
                .setColor(new Color(drawingColor)),
            new Color(drawingColor.concat([0.25]))
        ),

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

        queryByResults: StationId + " IN (SELECT " + StationId + " FROM Results WHERE ",

        layerIndices: {
            main: 0,
            results: 1,
            parameters: 2
        },

        topics: {
            selectFeatures: 'ugs-select-features',
            addGraphic: 'ugs-add-graphic',
            removeGraphic: 'ugs-remove-graphic',
            queryIdsComplete: 'ugs-query-ids-complete'
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
        ]
    };

    if (has('agrc-build') === 'prod') {
        // mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-A94B063C533889';
    } else if (has('agrc-build') === 'stage') {
        // test.mapserv.utah.gov
        window.AGRC.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        window.AGRC.apiKey = 'AGRC-E5B94F99865799';
    }

    return window.AGRC;
});
