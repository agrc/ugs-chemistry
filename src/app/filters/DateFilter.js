define([
    'agrc/modules/Formatting',

    'app/config',
    'app/filters/_Filter',

    'dojo/date',
    'dojo/date/locale',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/string',
    'dojo/text!app/filters/templates/DateFilter.html',
    'dojo/_base/declare',

    'dijit/form/DateTextBox'
], function (
    Formatting,

    config,
    _Filter,

    date,
    locale,
    domClass,
    on,
    query,
    dojoString,
    template,
    declare
) {
    return declare([_Filter], {
        // description:
        //      Filter by from and to date.

        templateString: template,

        // Properties to be sent into constructor

        // fieldName: String
        fieldName: null,

        constructor: function () {
            // summary:
            //      apply base css class
            console.log('app/filters/DateFilter:constructor', arguments);

            this.baseClass += ' date-filter';
        },
        postCreate: function () {
            // summary:
            //      description
            console.log('app/filters/DateFilter:postCreate', arguments);

            this.inherited(arguments);
        },
        clear: function () {
            // summary:
            //      description
            console.log('app/filters/DateFilter:clear', arguments);

            this.fromDate.value = '';
            this.toDate.value = '';
            domClass.add(this.numSpan, 'hidden');

            this.emit('changed');
        },
        onChange: function () {
            // summary:
            //      on of the date pickers was changed
            console.log('app/filters/DateFilter:onChange', arguments);

            if (this.isValid()) {
                var num = Formatting.addCommas(date.difference(
                    this.fromDate.value,
                    this.toDate.value
                ));
                this.numSpan.innerHTML = '(' + num + ' days)';
                domClass.remove(this.numSpan, 'hidden');
            } else {
                domClass.add(this.numSpan, 'hidden');
            }

            this.emit('changed');
        },
        isValid: function () {
            // summary:
            //      checks to make sure that there are valid dates
            console.log('app/filters/DateFilter:isValid', arguments);

            return !isNaN(this.fromDate.value.getTime()) &&
                !isNaN(this.toDate.value.getTime());
        },
        getQuery: function () {
            // summary:
            //      builds the where clause using the dates
            console.log('app/filters/DateFilter:getQuery', arguments);

            var formatDate = function (date) {
                return locale.format(date, {
                    selector: 'date',
                    datePattern: 'MM/dd/yyyy'
                });
            };
            if (this.isValid()) {
                var where = "${fieldName} >= '${from}' AND ${fieldName} <= '${to}')";
                return config.queryByResults + dojoString.substitute(where, {
                    fieldName: this.fieldName,
                    from: formatDate(this.fromDate.value),
                    to: formatDate(this.toDate.value)
                });
            } else {
                return undefined;
            }
        }
    });
});
