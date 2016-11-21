define([
    'app/config',
    'app/filters/DateFilter',
    'app/filters/FreeTypeFilter',
    'app/filters/ListFilter',
    'app/filters/ShapeFilter',
    'app/mapController',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/text!app/templates/FilterContainer.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    config,
    DateFilter,
    FreeTypeFilter,
    ListFilter,
    ShapeFilter,
    mapController,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    domConstruct,
    template,
    topic,
    array,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // description:
        //      Control for managing the filter for the application. Contains a variety of FilterType's.

        templateString: template,
        baseClass: 'filter-container',
        widgetsInTemplate: true,

        // filters: _Filter[]
        //      list of filters for this widget
        filters: null,

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      init's all filters and add's them to the drop down
            console.log('app/FilterContainer:postCreate', arguments);

            this.filters = [
                new ListFilter({
                    name: 'County',
                    items: config.counties,
                    parent: this.container,
                    fieldName: config.fieldNames.CountyCode,
                    fieldType: ListFilter.TYPE_NUMBER
                }),
                new ListFilter({
                    name: 'Data Source',
                    items: config.dataSources,
                    parent: this.container,
                    fieldName: config.fieldNames.DataSource,
                    fieldType: ListFilter.TYPE_TEXT,
                    relatedTableQuery: true
                }),
                new DateFilter({
                    name: 'Date Range',
                    parent: this.container,
                    fieldName: config.fieldNames.SampleDate
                }),
                new FreeTypeFilter({
                    name: 'HUC',
                    parent: this.container,
                    fieldName: config.fieldNames.HUC8
                }),
                new FreeTypeFilter({
                    name: 'Organization ID',
                    parent: this.container,
                    fieldName: config.fieldNames.OrgId
                }),
                new FreeTypeFilter({
                    name: 'Parameter',
                    parent: this.container,
                    fieldName: config.fieldNames.Param,
                    relatedTableQuery: true,
                    options: mapController.getParameters()
                }),
                new ListFilter({
                    name: 'Parameter Group',
                    items: config.parameterGroups,
                    parent: this.container,
                    fieldName: config.fieldNames.ParamGroup,
                    fieldType: ListFilter.TYPE_TEXT,
                    relatedTableQuery: true,
                    anyAllToggle: true
                }),
                new ShapeFilter({
                    name: 'Polygon',
                    parent: this.container
                }),
                new FreeTypeFilter({
                    name: 'Site ID',
                    parent: this.container,
                    fieldName: config.fieldNames.StationId
                }),
                new ListFilter({
                    name: 'Site Type',
                    items: config.siteTypes,
                    parent: this.container,
                    fieldName: config.fieldNames.StationType,
                    fieldType: ListFilter.TYPE_TEXT
                }),
                new ListFilter({
                    name: 'State',
                    items: config.states,
                    parent: this.container,
                    fieldName: config.fieldNames.StateCode,
                    fieldType: ListFilter.TYPE_NUMBER
                })
            ];

            var that = this;
            var addOption = function (name, id) {
                domConstruct.create('option', {
                    innerHTML: name,
                    value: id
                }, that.select);
            };
            this.filters.forEach(function (f) {
                f.startup();
                that.own(f);
                addOption(f.name, f.id);

                // add back to the drop down when it's removed from the container
                f.on('removed', function (filter) {
                    that.updateOptionVisibility(filter.id, true);
                    that.container.removeChild(filter.domNode);
                });
                f.on('changed', lang.hitch(that, 'onFilterChange'));
            });

            this.own(topic.subscribe(config.topics.showLimitMessage, function () {
                domClass.remove(this.limitWarning, 'hidden');
            }.bind(this)));

            this.inherited(arguments);
        },
        updateOptionVisibility: function (id, visible) {
            // summary:
            //      adds or removes the hidden class for the option
            // id: String
            //      corresponds with the value of the option
            // visible: Boolean
            console.log('app.FilterContainer:updateOptionVisibility', arguments);

            array.some(this.select.children, function (option) {
                if (option.value === id) {
                    domClass.toggle(option, 'hidden', !visible);
                    return true;
                }
            });
        },
        addFilter: function () {
            // summary:
            //      Show a filter in the filter container where the user can interact with it
            //      Also, remove it from the drop down so that it can't be selected twice
            console.log('app/FilterContainer:addFilter', arguments);

            var id = this.select.value;
            if (id !== 'none') {
                var filter = this.getFilter(id);
                domConstruct.place(filter.domNode, this.container);
                filter.open();
                this.updateOptionVisibility(id, false);
                this.select.value = 'none';
            }
        },
        getFilter: function (id) {
            // summary:
            //      searches through the filters list and returns the one
            //      with the matching id
            // id: String
            console.log('app/FilterContainer:getFilter', arguments);

            var filter;
            this.filters.some(function (f) {
                filter = f;
                return f.id === id;
            });

            return filter;
        },
        onFilterChange: function () {
            // summary:
            //      builds a def query and/or geometry and sends it to the map controller
            console.log('app/FilterContainer:onFilterChange', arguments);

            var geo;
            var wheres = [];
            this.filters.forEach(function (f) {
                var query = f.getQuery();
                if (query) {
                    if (typeof query === 'string') {
                        wheres.push(query);
                    } else {
                        // must be a geometry
                        geo = query;
                    }
                }
            });
            var where = (wheres.length) ? wheres.join(' AND ') : undefined;
            topic.publish(config.topics.filterFeatures, where, geo);

            domClass.add(this.limitWarning, 'hidden');
        }
    });
});
