require([
    'app/AGSStore'
], function (
    AGSStore
) {
    describe('app/AGSStore', function () {
        var obj;
        beforeEach(function () {
            obj = new AGSStore({
                outFields: ['Id', 'Two']
            });
        });

        describe('Sanity', function () {
            it('should create a AGSStore', function () {
                expect(obj).toEqual(jasmine.any(AGSStore));
            });
        });
        describe('parse', function () {
            it('flattens the feature set', function () {
                var response = JSON.stringify({
                    features: [{
                        attributes: { id: 1 }
                    }, {
                        attributes: { id: 2 }
                    }]
                });
                var result = obj.parse(response);

                expect(result.length).toBe(2);
                expect(result[1].id).toBe(2);
            });
        });
        describe('_renderSortParams', function () {
            it('constructs sort parameter', function () {
                var result = obj._renderSortParams([{
                    descending: true,
                    property: 'FieldName'
                }]);
                expect(result).toEqual(['orderByFields=FieldName DESC']);

                result = obj._renderSortParams([{
                    descending: true,
                    property: 'FieldName'
                }, {
                    descending: false,
                    property: 'FieldName2'
                }]);
                expect(result).toEqual(['orderByFields=FieldName DESC, FieldName2 ASC']);
            });
        });
    });
});
