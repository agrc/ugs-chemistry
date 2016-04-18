define([
    'app/config',
    'app/_GPMixin',
    'app/_ResultsQueryMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/text!app/templates/Download.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'ladda'
], function (
    config,
    _GPMixin,
    _ResultsQueryMixin,

    _TemplatedMixin,
    _WidgetBase,

    domAttr,
    domClass,
    template,
    declare,
    lang,

    Ladda
) {
    return declare([_WidgetBase, _TemplatedMixin, _ResultsQueryMixin, _GPMixin], {
        // description:
        //      Download the currently filtered data.
        templateString: template,
        baseClass: 'download',

        // Properties to be sent into constructor

        initSpinner: function () {
            // summary:
            //      set up the ladda spinner
            console.log('app.Download:initSpinner', arguments);

            if (!this.spinner) {
                this.spinner = Ladda.create(this.btn);
            }
        },
        onClick: function () {
            // summary:
            //      submit form
            console.log('app.Download::onClick', arguments);

            this.initSpinner();

            if (!this.checkForCurrentQuery()) {
                return;
            }

            this.reset();
            this.spinner.start();

            this.submitJob({
                format: this.formatSelect.value,
                query: this.convertToResultsQuery(this.currentQuery)
            });
        },
        onFormatChange: function () {
            // summary:
            //      type changed
            console.log('app.Download:onFormatChange');

            this.btn.disabled = this.formatSelect.value === '-1';
        },
        switchToSecure: function () {
            // summary:
            //      description
            console.log('app.Download:switchToSecure', arguments);

            this.initGP(config.urls.secureDownload);
        },
        reset: function () {
            // summary:
            //      description
            console.log('app.Download:reset', arguments);

            domClass.add(this.linkContainer, 'hidden');
            this.spinner.stop();
        },
        onDownloadGPComplete: function (result) {
            // summary:
            //      callback for gp task
            // result: esri/tasks/ParameterValue
            console.log('app.Download:onDownloadGPComplete', arguments);

            this.link.href = result.value.url;

            domClass.remove(this.linkContainer, 'hidden');
            this.spinner.stop();
        },
        onJobComplete: function (results) {
            // summary:
            //      description
            // results: Event Object
            console.log('app.Download:onJobComplete', arguments);

            this.gp.getResultData(results.jobInfo.jobId, 'zipfile', lang.hitch(this, 'onDownloadGPComplete'));
        }
    });
});
