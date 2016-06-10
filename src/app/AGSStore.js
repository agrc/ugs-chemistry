define([
    'app/config',

    'dojo/io-query',
    'dojo/request/xhr',
    'dojo/when',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dstore/QueryResults',
    'dstore/Request'
], function (
    config,

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
            this.params = {
                f: 'json',
                returnGeometry: false,
                outFields: outFields,
                where: options.where || '1=1',
                token: (config.user) ? config.user.token : null
            };
            this.target += '/query';

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
                totalLength: when(request(this.target, {
                    method: 'POST',
                    data: lang.mixin({
                        returnCountOnly: true
                    }, this.params),
                    handleAs: 'json',
                    headers: {'X-Requested-With': ''}
                }), function (response) {
                    return response.count;
                }),
                response: results.response
            });
        },
        _request: function (kwArgs) {
            // overriden from dstore/Request to switch to a POST request
            kwArgs = kwArgs || {};

            // perform the actual query
            var headers = lang.delegate(this.headers, { Accept: this.accepts, 'X-Requested-With': ''});

            if ('headers' in kwArgs) {
                lang.mixin(headers, kwArgs.headers);
            }

            var qParams = {};
            kwArgs.queryParams.forEach(function decouple(pair) {
                var parts = pair.split('=');
                qParams[parts[0]] = parts[1];
            });

            var requestUrl = this._renderUrl();

            var response = request(requestUrl, {
                method: 'POST',
                headers: headers,
                data: lang.mixin(qParams, this.params)
            });
            var collection = this;
            var parsedResponse = response.then(function (response) {
                return collection.parse(response);
            });
            return {
                data: parsedResponse.then(function (data) {
                    // support items in the results
                    var results = data.items || data;
                    for (var i = 0, l = results.length; i < l; i++) {
                        results[i] = collection._restore(results[i], true);
                    }
                    return results;
                }),
                total: parsedResponse.then(function (data) {
                    // check for a total property
                    var total = data.total;
                    if (total > -1) {
                        // if we have a valid positive number from the data,
                        // we can use that
                        return total;
                    }
                    // else use headers
                    return response.response.then(function (response) {
                        var range = response.getHeader('Content-Range');
                        return range && (range = range.match(/\/(.*)/)) && +range[1];
                    });
                }),
                response: response.response
            };
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
