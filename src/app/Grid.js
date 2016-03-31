define([
    'app/AGSStore',
    'app/config',
    'app/_ResultsQueryMixin',

    'dgrid/extensions/ColumnResizer',
    'dgrid/OnDemandGrid',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/date/locale',
    'dojo/dom-class',
    'dojo/store/Memory',
    'dojo/text!app/templates/Grid.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/query',

    'ijit/modules/_ErrorMessageMixin',

    'dojo-bootstrap/Tab'
], function (
    AGSStore,
    config,
    _ResultsQueryMixin,

    ColumnResizer,
    Grid,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    locale,
    domClass,
    Memory,
    template,
    topic,
    declare,
    lang,
    query,

    _ErrorMessageMixin
) {
    var fn = config.fieldNames;

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ErrorMessageMixin, _ResultsQueryMixin], {
        // description:
        //      A container to hold grids and download link.

        templateString: template,
        baseClass: 'grid',
        widgetsInTemplate: true,

        // stationsGrid: Grid
        stationsGrid: null,

        // resultsGrid: Grid
        resultsGrid: null,


        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      set up listeners
            console.log('app.Grid::postCreate', arguments);

            var that = this;
            this.own(
                topic.subscribe(config.topics.queryIdsComplete, lang.hitch(this, 'populateGrid')),
                query('a[data-toggle="tab"]').on('shown.bs.tab', function () {
                    that.populateGrid(that.lastDefQuery);
                })
            );

            this.inherited(arguments);
        },
        onError: function () {
            // summary:
            //      show an error message
            console.log('app/Grid:onError', arguments);

            this.showErrMsg('There was an error populating the grid!');
        },
        populateGrid: function (defQuery) {
            // summary:
            //      Populate the grid with a newly created store based upon defQuery
            // defQuery: String
            console.log('app/Grid:populateGrid', arguments);

            var store;

            domClass.toggle(
                this.clearSelectionBtnContainer,
                'hidden',
                defQuery.indexOf(config.fieldNames.Id + ' = ') === -1
            );
            if (domClass.contains(this.stationsTab, 'active')) {
                if (!this.stationsGrid) {
                    this.initStationsGrid();
                }
                if (!this.stationsGrid.collection ||
                    (this.stationsGrid.collection && this.stationsGrid.collection.where !== defQuery)) {
                    store = new AGSStore({
                        target: config.urls.mapService + '/' + config.layerIndices.main,
                        idProperty: 'Id',
                        outFields: [
                            fn.Id,
                            fn.DataSource,
                            fn.StationId,
                            fn.StationName,
                            fn.StationType,
                            fn.Depth,
                            fn.WIN
                        ],
                        where: defQuery
                    });
                    this.stationsGrid.set('collection', store);
                }
            } else {
                if (!this.resultsGrid) {
                    this.initResultsGrid();
                }
                defQuery = this.convertToResultsQuery(defQuery);
                if (!this.resultsGrid.collection ||
                    (this.resultsGrid.collection && this.resultsGrid.collection.where !== defQuery)) {
                    store = new AGSStore({
                        target: config.urls.mapService + '/' + config.layerIndices.results,
                        idProperty: 'Id',
                        outFields: [
                            fn.Id,
                            fn.Param,
                            fn.ResultValue,
                            fn.Unit,
                            fn.SampleDate,
                            fn.StationId,
                            fn.DetectCond
                        ],
                        where: defQuery
                    });
                    this.resultsGrid.set('collection', store);
                }
            }
            this.lastDefQuery = defQuery;

            return defQuery; // for testing only
        },
        clearSelection: function () {
            // summary:
            //      clear the station selection
            console.log('app.Grid:clearSelection', arguments);

            topic.publish(config.topics.clearStationSelection);
        },
        initResultsGrid: function () {
            // summary:
            //      initialize the results dgrid
            console.log('app/Grid:initResultsGrid', arguments);

            var resultColumns = [
                {
                    field: fn.Id
                }, {
                    field: fn.Param,
                    label: 'Parameter'
                }, {
                    field: fn.ResultValue,
                    label: 'Measure Value'
                }, {
                    field: fn.Unit,
                    label: 'Meaure Unit'
                }, {
                    field: fn.SampleDate,
                    label: 'Sample Date',
                    formatter: function (value) {
                        return locale.format(new Date(value), {
                            selector: 'date',
                            datePattern: 'MM/dd/yyyy'
                        });
                    }
                }, {
                    field: fn.StationId,
                    label: 'Station Id'
                }, {
                    field: fn.DetectCond,
                    label: 'Detection Condition'
                }
            ];

            this.resultsGrid = this.buildGrid(this.resultsGridDiv, resultColumns);
            this.resultsGrid.on('dgrid-error', lang.hitch(this, 'onError'));
        },
        initStationsGrid: function () {
            // summary:
            //      initialize the stations dgrid
            console.log('app/Grid:initStationsGrid', arguments);

            var stationColumns = [
                {
                    field: fn.Id
                }, {
                    field: fn.DataSource,
                    label: 'Database Source'
                }, {
                    field: fn.StationId,
                    label: 'ID'
                }, {
                    field: fn.StationName,
                    label: 'Name'
                }, {
                    field: fn.StationType,
                    label: 'Type'
                }, {
                    field: fn.Depth,
                    label: 'Well Depth'
                }, {
                    field: fn.WIN,
                    label: 'WR Well Id'
                }
            ];

            this.stationsGrid = this.buildGrid(this.stationsGridDiv, stationColumns);
            this.stationsGrid.on('dgrid-error', lang.hitch(this, 'onError'));
        },
        buildGrid: function (div, columns) {
            // summary:
            //      build a new dgrid
            // div: Dom Node
            // columns: Object[]
            console.log('app/Grid:buildGrid', arguments);

            var grid = new (declare([Grid, ColumnResizer]))({
                columns: columns,
                noDataMessage: 'No data found.',
                loadingMessage: 'Loading data...',
                minRowsPerPage: 100,
                maxRowsPerPage: 500
            }, div);
            grid.startup();
            return grid;
        }
    });
});
