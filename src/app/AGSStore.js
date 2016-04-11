define([
    'dojo/io-query',
    'dojo/request',
    'dojo/when',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dstore/QueryResults',
    'dstore/Request'
], function (
    ioQuery,
    request,
    when,
    declare,
    lang,

    QueryResults,
    Request
) {
    return declare([Request], {
        // description
        //      A dstore/Store implementation for querying a arcgis server query service

        rangeStartParam: 'resultOffset',
        rangeCountParam: 'resultRecordCount',

        constructor: function (options) {
            // summary:
            //      set up the store
            // options: {
            //      target: String (url to feature layer (e.g. ServiceName/MapServer/0))
            //      idProperty: String
            //      outFields: String[] (defaults to '*')
            //      returnGeometry: Boolean (defaults to false)
            //      where: String (defaults to 1=1)
            // }
            console.log('app.AGSStore:constructor', arguments);

            // initialize options
            var outFields;
            if (options.outFields) {
                outFields = options.outFields.join(',');
            } else {
                outFields = '*';
            }

            // push options to url query and build url
            var urlQuery = ioQuery.objectToQuery({
                f: 'json',
                returnGeometry: false,
                outFields: outFields,
                where: options.where || '1=1'
            });
            this.target += '/query?' + urlQuery;

            this.inherited(arguments);
        },
        parse: function (txt) {
            // summary
            //      parse JSON and flatten FeatureSet to just attributes
            console.log('app.AGSStore:parse', arguments);

            var features = JSON.parse(txt).features.map(function (f) {
                return f.attributes;
            });

            return features;
        },
        fetchRange: function (options) {
            // summary
            //      make new request to the server for features and total count
            //      called by dgrid when a new collection is set
            // options: {start: Number, end: Number}
            console.log('app.AGSStore:fetchRange', arguments);

            var requestArgs = {
                queryParams: this._renderRangeParams(options.start, options.end)
            };

            var results = this._request(requestArgs);
            return new QueryResults(results.data, {
                totalLength: when(request(this.target + '&returnCountOnly=true', {
                    handleAs: 'json'
                }), function (response) {
                    return response.count;
                }),
                response: results.response
            });
        },
        _renderSortParams: function (sort) {
            // summary:
            //        Constructs sort-related params to be inserted in the query string
            // sort: Object
            // {
            //     descending: Boolean
            //     property: String (field name)
            // }
            // returns: String []
            //        Sort-related params to be inserted in the query string
            var fields = sort.map(function (s) {
                return s.property + ' ' + ((s.descending) ? 'DESC' : 'ASC');
            });
            return ['orderByFields=' + fields.join(', ')];
        }
    });
});
