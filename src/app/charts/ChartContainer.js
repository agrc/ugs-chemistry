define([
    'agrc/modules/Formatting',

    'app/charts/Controls',
    'app/config',
    'app/_ResultsQueryMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/string',
    'dojo/text!app/charts/templates/ChartContainer.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/tasks/Geoprocessor',

    'plotlyjs',

    'dojo-bootstrap/Button',
    'xstyle/css!app/charts/resources/ChartContainer.css'
], function (
    formatting,

    Controls,
    config,
    _ResultsQueryMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    dojoString,
    template,
    topic,
    declare,
    lang,

    Geoprocessor,

    Plotly
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ResultsQueryMixin], {
        // description:
        //      Container that holds all of the chart widgets.

        templateString: template,
        baseClass: 'chart-container',
        widgetsInTemplate: true,

        // gp: Geoprocessor
        gp: null,

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.charts.ChartContainer::postCreate', arguments);

            var controls = new Controls({}, this.chartControlsDiv);
            controls.startup();
            var that = this;
            this.own(
                controls,
                controls.on('update-chart', lang.hitch(this, 'updateChart')),
                topic.subscribe(config.topics.queryIdsComplete, function (newQuery) {
                    that.currentQuery = newQuery;
                })
            );

            this.inherited(arguments);
        },
        updateChart: function (evt) {
            // summary:
            //      regenerates the chart with the new parameters
            // evt: Event Object
            // {
            //      param: String
            //      type: String
            // }
            console.log('app.charts.ChartContainer:updateChart', arguments);

            var query = this.convertToResultsQuery(this.currentQuery) + ' AND Param = \'' + evt.param + '\'';

            if (!this.gp) {
                this.gp = new Geoprocessor(config.urls.buildChart);
                this.own(
                    this.gp.on('error', function () {
                        // TODO: toast?
                        console.error('error with chart service');
                    }),
                    this.gp.on('execute-complete', function (evt) {
                        console.debug(evt);
                    })
                );
            }

            this.gp.execute({
                defQuery: query,
                chartType: evt.chartType
            });
        },
        toggle: function () {
            // summary:
            //      toggles the visibility of the dialog
            console.log('app/charts/ChartContainer:toggle', arguments);

            domClass.toggle(this.panel, 'hidden');
        },
        updateMsg: function (num_results, num_stations) {
            // summary:
            //      Sets the chart message numbers
            // num_results: Number
            // num_stations: Number
            console.log('app/charts/ChartContainer:updateMsg', arguments);

            this.chartMsg.innerHTML = dojoString.substitute(
                config.chartMsgTxt,
                [formatting.addCommas(num_results), formatting.addCommas(num_stations)]
            );
        },
        toggleAlert: function (show) {
            // summary:
            //      toggles the visibility of the heads up alert
            // show: Boolean
            console.log('app/charts/ChartContainer:toggleAlert', arguments);

            var f = (show) ? domClass.remove : domClass.add;
            f(this.alert, 'hidden');
        }
    });
});
