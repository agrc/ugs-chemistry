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

    'bootstrap',
    'highcharts',
    'highcharts/modules/boost.src'
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

        // currentQuery: string
        currentQuery: null,

        // currentChartType: string
        currentChartType: null,

        // currentParam: string
        currentParam: null,

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

            if (!this.currentQuery || '') {
                topic.publish(config.topics.toast, 'You must add at least one filter.');
                this.controls.resetSpinner();
                return;
            }
            var query = this.convertToResultsQuery(this.currentQuery) + ' AND Param = \'' + evt.param + '\'';

            if (!this.gp) {
                this.initGP(config.urls.buildChart);
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

            this.currentChartType = chartType;
            this.currentParam = evt.param;
        },
        initGP: function (url) {
            // summary:
            //      set up geoprocessor
            console.log('app/charts/ChartContainer:initGP', arguments);

            var that = this;
            this.gp = new Geoprocessor(url);
            this.own(
                this.gp.on('error', function () {
                    topic.publish(config.topics.toast, {
                        message: 'error with chart service',
                        type: 'danger'
                    });
                    that.controls.resetSpinner();
                }),
                this.gp.on('execute-complete', lang.hitch(this, 'onChartGPComplete'))
            );
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

            var chartType;
            var plotOptions;
            var xAxis;
            var yAxis;
            var seriesData;
            var color;
            var header = '';
            if (this.currentChartType === 'histogram') {
                chartType = 'column';
                plotOptions = {
                    column: {
                        pointPadding: 0,
                        groupPadding: 0,
                        borderWidth: 0.5,
                        shadow: false,
                        tooltip: {
                            headerFormat: header
                        }
                    },
                    tooltip: {
                        headerFormat: header
                    }
                };
                xAxis = {
                    categories: data[1],
                    labels: {
                        formatter: function () {
                            return formatting.round(this.value, 2);
                        }
                    }
                };
                yAxis = {
                    title: false
                };
                seriesData = data[0];
                color = 'rgb(124, 181, 236)';
            } else {
                chartType = 'scatter';
                plotOptions = {
                    scatter: {
                        tooltip: {
                            headerFormat: header,
                            pointFormatter: function () {
                                return new Date(this.x).toLocaleDateString() + '<br>' + this.y + ' mg/L';
                            }
                        }
                    }
                };
                xAxis = {
                    type: 'datetime'
                };
                yAxis = {
                    title: false
                };
                seriesData = data;
                color = 'rgba(124, 181, 236, 0.5)';
            }
            new window.Highcharts.Chart({
                chart: {
                    renderTo: this.chartDiv,
                    type: chartType,
                    height: 300
                },
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: 'count',
                    data: seriesData,
                    color: color
                }],
                plotOptions: plotOptions,
                title: false,
                xAxis: xAxis,
                yAxis: yAxis
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
        },
        switchToSecure: function () {
            // summary:
            //      switches to secure chart
            console.log('app/charts/ChartContainer:switchToSecure', arguments);

            this.initGP(config.urls.secureBuildChart);
        }
    });
});
