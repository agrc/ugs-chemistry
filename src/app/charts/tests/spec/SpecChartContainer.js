require([
    'app/charts/ChartContainer',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/charts/ChartContainer', function () {
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
            it('should create a ChartContainer', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('updateMsg', function () {
            it('renders the correct message', function () {
                widget.updateMsg(11000, 200);

                expect(widget.chartMsg.innerHTML).toBe('Showing 11,000 results from 200 stations.');
            });
        });
        describe('updateChart', function () {
            it('does not fire gp task if there is not existing filter', function () {
                widget.gp = {
                    execute: jasmine.createSpy()
                };
                widget.currentQuery = null;

                widget.updateChart({});

                expect(widget.gp.execute).not.toHaveBeenCalled();
            });
        });
    });
});
