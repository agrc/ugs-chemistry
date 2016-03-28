/* jshint maxlen:false */
define([
    'dojo/has',

    'esri/Color',
    'esri/config',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol',

    'dojo/domReady!'
], function (
    has,

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

    var baseUrl = window.location.protocol + '//' + agsDomain + '/arcgis/rest/services/UGSChemistry';
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
        appName: 'ugs-chemistry',

        // version.: String
        //      The version number.
        version: '0.5.1',

        // apiKey: String
        //      The api key used for services on api.mapserv.utah.gov
        apiKey: '', // acquire at developer.mapserv.utah.gov

        urls: {
            mapService: baseUrl + '/MapService/MapServer',
            geometry: baseUrl + '/Geometry/GeometryServer',
            buildChart: baseUrl + '/Toolbox/GPServer/BuildChart'
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

        queryByResults: StationId + " IN (SELECT " + StationId + " FROM Results WHERE ",

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
            toast: 'ugs-toast'
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
        parameters: [
            ['2,4 - D (2,4 - dichlorophenoxyacetic acid)', '2,4 - D (2,4 - dichlorophenoxyacetic acid)'],
            ['2,4 - D (2,4 - dichlorophenoxyacetic acid)', '2,4 - D (2,4 - dichlorophenoxyacetic acid)'],
            ['2,4,5-TP (Silvex)', '2,4,5-TP (Silvex)'],
            ['Alachlor', 'Alachlor'],
            ['Aldicarb', 'Aldicarb'],
            ['Aldicarb sulfone', 'Aldicarb sulfone'],
            ['Aldicarb sulfoxide', 'Aldicarb sulfoxide'],
            ['Alkalinity', 'Alkalinity'],
            ['Alkalinity', 'Alkalinity'],
            ['Aluminum', 'Aluminum'],
            ['Ammonia and ammonium', 'Ammonia and ammonium'],
            ['Ammonia and ammonium', 'Ammonia and ammonium'],
            ['Antimony', 'Antimony'],
            ['Arsenic', 'Arsenic'],
            ['Atrazine', 'Atrazine'],
            ['Barium', 'Barium'],
            ['Benzene', 'Benzene'],
            ['Beryllium', 'Beryllium'],
            ['Bicarbonate', 'Bicarbonate'],
            ['Boron', 'Boron'],
            ['Cadmium', 'Cadmium'],
            ['Calcium', 'Calcium'],
            ['Carbofuran', 'Carbofuran'],
            ['Carbofuran', 'Carbofuran'],
            ['Carbon Dioxide', 'Carbon Dioxide'],
            ['Carbon tetrachloride', 'Carbon tetrachloride'],
            ['Carbonate (CO3)', 'Carbonate (CO3)'],
            ['Chloride', 'Chloride'],
            ['Chromium (Total)', 'Chromium (Total)'],
            ['Copper', 'Copper'],
            ['Dibromochloromethane', 'Dibromochloromethane'],
            ['Dichlorobenzene o-', 'Dichlorobenzene o-'],
            ['Dichlorobenzene p-', 'Dichlorobenzene p-'],
            ['Dichloroethane (1,2-)', 'Dichloroethane (1,2-)'],
            ['Dichloroethylene (1,1-)', 'Dichloroethylene (1,1-)'],
            ['Dichloroethylene (cis-1,2-)', 'Dichloroethylene (cis-1,2-)'],
            ['Dichloroethylene (trans-1,2-)', 'Dichloroethylene (trans-1,2-)'],
            ['Dichloromethane', 'Dichloromethane'],
            ['Dichloropropane (1,2-)', 'Dichloropropane (1,2-)'],
            ['Dinoseb', 'Dinoseb'],
            ['Endrin', 'Endrin'],
            ['Ethylbenzene', 'Ethylbenzene'],
            ['Heptachlor', 'Heptachlor'],
            ['Heptachlor epoxide', 'Heptachlor epoxide'],
            ['Inorganic nitrogen (nitrate and nitrite)', 'Inorganic nitrogen (nitrate and nitrite)'],
            ['Inorganic nitrogen (nitrate and nitrite)', 'Inorganic nitrogen (nitrate and nitrite)'],
            ['Iron', 'Iron'],
            ['Lead', 'Lead'],
            ['Lindane', 'Lindane'],
            ['Lindane', 'Lindane'],
            ['Magnesium', 'Magnesium'],
            ['Manganese', 'Manganese'],
            ['Monochlorobenzene', 'Monochlorobenzene'],
            ['Nickel', 'Nickel'],
            ['Nitrate', 'Nitrate'],
            ['Nitrate', 'Nitrate'],
            ['Nitrite', 'Nitrite'],
            ['Nitrite', 'Nitrite'],
            ['Nitrogen, mixed forms (NH3), (NH4), organic, (NO2) and (NO3)', 'Nitrogen, mixed forms (NH3), (NH4), organic, (NO2) and (NO3)'],
            ['Nitrogen, mixed forms (NH3), (NH4), organic, (NO2) and (NO3)', 'Nitrogen, mixed forms (NH3), (NH4), organic, (NO2) and (NO3)'],
            ['Oxamyl (Vydate)', 'Oxamyl (Vydate)'],
            ['pH', 'pH'],
            ['pH, lab', 'pH, lab'],
            ['Phosphate', 'Phosphate'],
            ['Phosphate', 'Phosphate'],
            ['Phosphorus', 'Phosphorus'],
            ['Phosphorus', 'Phosphorus'],
            ['Polychlorinated biphenyls (PCBs)', 'Polychlorinated biphenyls (PCBs)'],
            ['Potassium', 'Potassium'],
            ['Selenium', 'Selenium'],
            ['Silica', 'Silica'],
            ['Silver', 'Silver'],
            ['Simazine', 'Simazine'],
            ['Sodium', 'Sodium'],
            ['Sodium plus potassium', 'Sodium plus potassium'],
            ['Specific conductance', 'Specific conductance'],
            ['Specific conductance', 'Specific conductance'],
            ['Strontium-90', 'Strontium-90'],
            ['Styrene', 'Styrene'],
            ['Sulfate', 'Sulfate'],
            ['Temperature, water', 'Temperature, water'],
            ['Tetrachloroethylene', 'Tetrachloroethylene'],
            ['Thallium', 'Thallium'],
            ['Toluene', 'Toluene'],
            ['Total dissolved solids', 'Total dissolved solids'],
            ['Toxaphene', 'Toxaphene'],
            ['Trichlorobenzene (1,2,4-)', 'Trichlorobenzene (1,2,4-)'],
            ['Trichloroethylene', 'Trichloroethylene'],
            ['Uranium (only if gross alpha MCL is exceeded)', 'Uranium (only if gross alpha MCL is exceeded)'],
            ['Vinyl chloride', 'Vinyl chloride'],
            ['Zinc', 'Zinc']
        ],
        chartMsgTxt: 'Showing ${0} results from ${1} stations.'
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
