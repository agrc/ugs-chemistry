define([
    'app/config',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-construct',
    'dojo/query',
    'dojo/text!app/charts/templates/Controls.html',
    'dojo/_base/declare',

    'ladda',

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
    declare,

    Ladda
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
        initSpinner: function () {
            // summary:
            //      description
            // param or return
            console.log('app.charts.Controls:initSpinner', arguments);

            if (!this.spinner) {
                this.spinner = Ladda.create(this.btn);
            }
        },
        onClick: function () {
            // summary:
            //      description
            console.log('app/charts/Controls:onClick', arguments);

            this.spinner.start();
            this.emit('update-chart', {
                param: this.paramTxt.value,
                chartType: this.typeSelect.value
            });

            // this.btn.innerHTML = 'Update Chart';
        },
        validate: function () {
            // summary:
            //      validate that both controls are filled out and disable/enable button
            console.log('app.charts.Controls:validate', arguments);

            this.btn.disabled = this.paramTxt.value.length === 0 || this.typeSelect.value === '-1';
        },
        resetSpinner: function () {
            // summary:
            //      description
            // param or return
            console.log('app.charts.Controls:resetSpinner', arguments);

            this.spinner.stop();
        }
    });
});
