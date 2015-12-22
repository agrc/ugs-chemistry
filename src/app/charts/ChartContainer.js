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

    'dojo-bootstrap/Button',
    'highcharts',
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

    Geoprocessor
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

            this.controls = new Controls({}, this.chartControlsDiv);
            this.controls.startup();
            var that = this;
            this.own(
                this.controls,
                this.controls.on('update-chart', lang.hitch(this, 'updateChart')),
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
            var that = this;

            if (!this.gp) {
                this.gp = new Geoprocessor(config.urls.buildChart);
                this.own(
                    this.gp.on('error', function () {
                        // TODO: toast?
                        console.error('error with chart service');
                        that.controls.resetSpinner();
                    }),
                    this.gp.on('execute-complete', lang.hitch(this, 'onChartGPComplete'))
                );
            }

            var chartType;
            var logTransform = false;
            if (evt.chartType === 'histogram-log-transform') {
                chartType = 'histogram';
                logTransform = true;
            } else {
                chartType = evt.chartType;
            }

            this.gp.execute({
                defQuery: query,
                chartType: chartType,
                logTransform: logTransform
            });
        },
        onChartGPComplete: function (evt) {
            // summary:
            //      callback for gp task
            // evt: Event Object
            console.log('app.charts.ChartContainer:onChartGPComplete', arguments);

            this.controls.resetSpinner();
            var data = evt.results[0].value;
            var numResults = evt.results[1].value;
            var numStations = evt.results[2].value;
            this.updateMsg(numResults, numStations);
            new window.Highcharts.Chart({
                chart: {
                    renderTo: this.chartDiv,
                    type: 'column',
                    height: 300
                },
                plotOptions: {
                    column: {
                        pointPadding: 0,
                        groupPadding: 0,
                        borderWidth: 0.5,
                        shadow: false
                    }
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: 'count',
                    data: data[0]
                }],
                title: false,
                xAxis: {
                    categories: data[1],
                    labels: {
                        formatter: function () {
                            return formatting.round(this.value, 2);
                        }
                    }
                },
                yAxis: {
                    title: false
                }
            });
        },
        toggle: function () {
            // summary:
            //      toggles the visibility of the dialog
            console.log('app/charts/ChartContainer:toggle', arguments);

            domClass.toggle(this.panel, 'hidden');

            this.controls.initSpinner();
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
