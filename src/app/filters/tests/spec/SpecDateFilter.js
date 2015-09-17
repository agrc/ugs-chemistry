require([
    'app/filters/DateFilter',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/filters/DateFilter', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        beforeEach(function () {
            widget = new WidgetUnderTest({
                fieldName: 'FieldName',
                name: 'hello'
            }, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a DateFilter', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('getQuery', function () {
            it('builds a where clause', function () {
                widget.fromDate.value = '03/30/2015';
                widget.from.update();
                widget.toDate.value = '03/27/2015';
                widget.to.update();

                var result = widget.getQuery();

                expect(result).toBe("StationId IN (SELECT StationId FROM Results WHERE " +
                    "FieldName >= '03/30/2015' AND FieldName <= '03/27/2015')");
            });
            it('returns undefined if there are not valid dates', function () {
                expect(widget.getQuery()).toBeUndefined();
            });
        });
    });
});
