require([
    'app/Grid',

    'dojo/dom-class',
    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domClass,
    domConstruct
) {
    describe('app/Grid', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a Grid', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('populateGrid', function () {
            it('creates the correct query for results table', function () {
                domClass.remove(widget.stationsTab, 'active');

                // query on the stations table
                expect(widget.populateGrid('Blah = 2'))
                    .toBe('StationId IN (SELECT StationId FROM ugswaterchemistry.Stations WHERE Blah = 2)');

                // query on results tabls
                expect(widget.populateGrid("StationId IN (SELECT StationId FROM Results WHERE SampleDate >= '01/01/2015' AND SampleDate <= '02/01/2015')"))
                    .toBe("SampleDate >= '01/01/2015' AND SampleDate <= '02/01/2015'");
            });
            it('init\'s grids if they are not existing', function () {
                widget.stationsGrid = null;
                spyOn(widget, 'initStationsGrid').and.callThrough();

                widget.populateGrid('blah');
                widget.populateGrid('blah');

                expect(widget.initStationsGrid.calls.count()).toBe(1);

                widget.resultsGrid = null;
                domClass.remove(widget.stationsTab, 'active');
                spyOn(widget, 'initResultsGrid').and.callThrough();

                widget.populateGrid('blah');
                widget.populateGrid('blah');

                expect(widget.initResultsGrid.calls.count()).toBe(1);
            });
            it('doesn\'t create a new store if the def query hasn\'t changed', function () {
                widget.initStationsGrid();
                spyOn(widget.stationsGrid, 'set').and.callThrough();

                widget.populateGrid('blah');
                widget.populateGrid('blah');

                expect(widget.stationsGrid.set.calls.count()).toBe(1);
            });
        });
    });
});
