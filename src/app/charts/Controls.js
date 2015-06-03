define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/dom-construct',
    'dojo/text!app/charts/templates/Controls.html',
    'dojo/topic',

    'xstyle/css!app/charts/resources/Controls.css'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    declare,
    domConstruct,
    template,
    topic
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

            this.buildParameterOptions(config.parameters);

            this.inherited(arguments);
        },
        onClick: function () {
            // summary:
            //      description
            console.log('app/charts/Controls:onClick', arguments);

            topic.publish(config.topics.buildChart, this.paramSelect.value, this.typeSelect.value);

            this.btn.innerHTML = 'Update Chart';
        },
        buildParameterOptions: function (values) {
            // summary:
            //      description
            // values: String[][]
            console.log('app/charts/Controls:buildParameterOptions', arguments);

            var that = this;
            values.forEach(function (v) {
                domConstruct.create('option', {
                    value: v[0],
                    innerHTML: v[1]
                }, that.paramSelect);
            });
        }
    });
});
