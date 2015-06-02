define([
    'agrc/modules/Formatting',

    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/declare',
    'dojo/dom-class',
    'dojo/string',
    'dojo/text!app/charts/templates/ChartContainer.html',

    'dojo-bootstrap/Button',
    'xstyle/css!app/charts/resources/ChartContainer.css'
], function (
    formatting,

    config,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    declare,
    domClass,
    dojoString,
    template
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Container that holds all of the chart widgets.

        templateString: template,
        baseClass: 'chart-container',
        widgetsInTemplate: true,

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.charts.ChartContainer::postCreate', arguments);

            this.inherited(arguments);
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
