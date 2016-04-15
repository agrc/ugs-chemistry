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

    'toaster/dist/Toaster',

    'dijit/layout/BorderContainer'
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
        startup: function () {
            // summary:
            //      Fires when
            console.log('app.App::startup', arguments);

            this.inherited(arguments);

            this.loginRegister = new LoginRegister({
                appName: config.appName,
                logoutDiv: this.logoutDiv,
                showOnLoad: false,
                securedServicesBaseUrl: config.urls.baseUrl
            });
            this.grid = new Grid(null, this.gridDiv);
            this.filterContainer = new FilterContainer(null, this.filterDiv);
            this.children = [
                this.loginRegister,
                this.filterContainer,
                this.grid,
                new ChartContainer(null, this.chartsDiv),
                new Toaster['default']({
                    topic: config.topics.toast
                }, domConstruct.create('div', {}, document.body))
            ];

            this.children.forEach(function (child) {
                child.startup();
            });

            // set version number
            this.version.innerHTML = AGRC.version;

            topic.subscribe(this.loginRegister.topics.signInSuccess, lang.hitch(this, 'onSignInSuccess'));
            this.loginRegister.on('remember-me-unsuccessful', lang.hitch(this, 'onRememberMeUnsuccessful'));
        },
        onSignInSuccess: function (evt) {
            // wired to LoginRegister event
            console.log('app.App:onSignInSuccess', arguments);

            config.user = evt.user;

            if (mapController.map) {
                mapController.switchToSecure();
            } else {
                mapController.initMap(this.mapDiv, mapController.securityLevels.secure);
            }

            this.grid.switchToSecure();

            this.filterContainer.onFilterChange();
        },
        onRememberMeUnsuccessful: function () {
            // load unsecure app
            console.log('app.App:onRememberMeUnsuccessful', arguments);

            mapController.initMap(this.mapDiv, mapController.securityLevels.open);
        }
    });
});
