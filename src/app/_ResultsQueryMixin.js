define([
    'dojo/_base/declare'
], function (
    declare
) {
    return declare([], {
        convertToResultsQuery: function (defQuery) {
            // summary:
            //      convert the defQuery to make work with Results table
            // defQuery: String
            console.log('app._ResultsQueryMixin:convertToResultsQuery', arguments);

            // if the def query is a query on the results table then strip out the stations part of it
            var match = defQuery.match(/FROM Results WHERE (.*)\)/);
            if (match) {
                return match[1];
            } else {
                // this is a query on just the stations table which requires wrapping it in the query below
                return 'StationId IN (SELECT StationId FROM ugswaterchemistry.Stations WHERE ' + defQuery + ')';
            }
        }
    });
});
