define([
    'app/charts/ChartContainer',
    'app/config',
    'app/FilterContainer',
    'app/Grid',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-construct',
    'dojo/fx',
    'dojo/text!app/templates/App.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/fx',
    'dojo/_base/lang',

    'ijit/widgets/authentication/LoginRegister',

    'toaster/dist/Toaster'
], function (
    ChartContainer,
    config,
    FilterContainer,
    Grid,
    mapController,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domConstruct,
    coreFx,
    template,
    topic,
    declare,
    baseFx,
    lang,

    LoginRegister,

    Toaster
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            AGRC.app = this;
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            this.version.innerHTML = AGRC.version;

            this.own(
                new LoginRegister({
                    appName: config.appName,
                    logoutDiv: this.logoutDiv,
                    showOnLoad: false,
                    securedServicesBaseUrl: '??'
                }),
                new FilterContainer(null, this.filterDiv),
                new Grid(null, this.gridDiv),
                new ChartContainer(null, this.chartsDiv),
                new Toaster['default']({
                    topic: config.topics.toast
                }, domConstruct.create('div', {}, document.body))
            );
            mapController.initMap(this.mapDiv);

            this.inherited(arguments);
        }
    });
});
