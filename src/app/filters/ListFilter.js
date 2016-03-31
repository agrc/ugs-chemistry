define([
    'app/config',
    'app/filters/_Filter',
    'app/filters/_RelatedTableQuery',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/filters/templates/ListFilter.html',

    'dojo-bootstrap/Button',
    'dojo-bootstrap/Tooltip'
], function (
    config,
    _Filter,
    _RelatedTableQuery,

    declare,
    lang,
    domClass,
    domConstruct,
    on,
    query,
    template
) {
    var c = declare([_Filter, _RelatedTableQuery], {
        // description:
        //      A control for filtering by a defined set of choices.
        //      Allows selection of one or more choices.


        templateString: template,

        // selectedValues: String[]
        //      The currently selected items
        selectedValues: null,

        // any: Boolean
        //      any or all
        any: true,


        // properties passed in via the constructor

        // items: [String, String][]
        //      description, value pairs
        items: null,

        // fieldName: String
        //      The name of the field associated with this filter
        fieldName: null,

        // fieldType: String (see TYPE* constants below)
        //      The type of the field so that we can build a proper query
        fieldType: null,

        // anyAllToggle: Boolean (default: false)
        //      If true the any/all toggle buttons appear
        anyAllToggle: false,

        constructor: function () {
            // summary:
            //      apply base class
            console.log('app/filters/ListFilter:constructor', arguments);

            this.baseClass += ' list-filter';
            this.selectedValues = [];
        },
        postCreate: function () {
            // summary:
            //      build bubbles
            console.log('app/filters/ListFilter:postCreate', arguments);

            var that = this;
            this.items.forEach(function (item) {
                domConstruct.create('button', {
                    innerHTML: item[0],
                    value: item[1],
                    'class': 'btn btn-default btn-xs',
                    'data-toggle': 'button',
                    'onclick': lang.partial(lang.hitch(that, 'itemClicked'), item[1])
                }, that.buttonContainer);
            });

            if (this.anyAllToggle) {
                domClass.remove(this.anyAllGroup, 'hidden');
            }

            query('[data-toggle="tooltip"]', this.domNode).tooltip({
                delay: {
                    show: 750,
                    hide: 100
                },
                container: 'body',
                html: true,
                placement: 'bottom'
            });
            this.inherited(arguments);
        },
        clear: function () {
            // summary:
            //      unselects all buttons
            console.log('app/filters/ListFilter:clear', arguments);

            query('.btn', this.buttonContainer).forEach(function (btn) {
                domClass.remove(btn, 'active');
                btn.setAttribute('aria-pressed', false);
            });

            this.numSpan.innerHTML = 0;
            this.selectedValues = [];
            this.emit('changed');
        },
        itemClicked: function (value) {
            // summary:
            //      description
            // value: String
            //      value of the item that was clicked
            console.log('app/filters/ListFilter:itemClicked', arguments);

            var index = this.selectedValues.indexOf(value);
            if (index === -1) {
                this.selectedValues.push(value);
            } else {
                this.selectedValues.splice(index, 1);
            }

            this.numSpan.innerHTML = this.selectedValues.length;

            this.emit('changed');
        },
        getQuery: function () {
            // summary:
            //      assembles all selected values into a def query
            console.log('app/filters/ListFilter:getQuery', arguments);

            if (this.selectedValues.length) {
                var values;
                if (this.fieldType === c.TYPE_TEXT) {
                    values = this.selectedValues.map(function (v) {
                        return "'" + v + "'";
                    });
                } else {
                    values = this.selectedValues;
                }
                if (this.any) {
                    var where = this.fieldName + ' IN (' + values.join(', ') + ')';
                    return this.getRelatedTableQuery(where);
                } else {
                    var that = this;
                    return values.reduce(function (previousReturn, currentValue) {
                        var where = that.fieldName + ' = ' + currentValue;
                        if (!previousReturn) {
                            return that.getRelatedTableQuery(where);
                        } else {
                            return previousReturn + ' AND ' + that.getRelatedTableQuery(where);
                        }
                    }, false);
                }
            } else {
                return undefined;
            }
        },
        toggleAny: function () {
            // summary:
            //      description
            console.log('app/filters/ListFilter:toggleAny', arguments);

            var that = this;
            setTimeout(function () {
                that.any = domClass.contains(that.anyBtn, 'active');
                that.emit('changed');
            }, 0);
        }
    });

    // CONSTANTS
    c.TYPE_TEXT = 'text';
    c.TYPE_NUMBER = 'number';

    return c;
});
