require([
    'app/charts/Controls',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    domConstruct
) {
    describe('app/charts/Controls', function () {
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
            it('should create a Controls', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('buildParameterOptions', function () {
            it('builds the correct number of options', function () {
                domConstruct.empty(widget.paramSelect);
                widget.buildParameterOptions([
                    ['hello', 'hello hello'],
                    ['goodbye', 'goodbye goodbye'],
                    ['blah', 'blah blah']
                ]);

                expect(widget.paramSelect.children.length).toBe(3);
            });
        });
    });
});
