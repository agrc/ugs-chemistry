define([
    'app/config',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-construct',
    'dojo/query',
    'dojo/text!app/charts/templates/Controls.html',
    'dojo/topic',
    'dojo/_base/declare',

    'dojo-bootstrap/Typeahead',
    'xstyle/css!app/charts/resources/Controls.css'
], function (
    config,
    mapController,

    _TemplatedMixin,
    _WidgetBase,

    domConstruct,
    query,
    template,
    topic,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Controls allowing the user to choose options and generate/update the chart.

        templateString: template,
        baseClass: 'controls',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.charts.Controls::postCreate', arguments);

            var that = this;
            mapController.getParameters().then(function (options) {
                query(that.paramTxt).typeahead({
                    source: options
                });
            });

            this.inherited(arguments);
        },
        onClick: function () {
            // summary:
            //      description
            console.log('app/charts/Controls:onClick', arguments);

            topic.publish(config.topics.buildChart, this.paramTxt.value, this.typeSelect.value);

            this.btn.innerHTML = 'Update Chart';
        },
        validate: function () {
            // summary:
            //      validate that both controls are filled out and disable/enable button
            console.log('app.charts.Controls:validate', arguments);

            this.btn.disabled = this.paramTxt.value.length === 0 || this.typeSelect.value === '-1';
        }
    });
});
