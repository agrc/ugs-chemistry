define([
    'agrc/modules/Formatting',

    'app/config',
    'app/filters/_Filter',
    'app/mapController',

    'dojo/aspect',
    'dojo/has!web-workers?esri/geometry/geometryEngineAsync:esri/geometry/geometryEngine',
    'dojo/text!app/filters/templates/ShapeFilter.html',
    'dojo/topic',
    'dojo/when',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/toolbars/draw'
], function (
    formatting,

    config,
    _Filter,
    mapController,

    aspect,
    geometryEngine,
    template,
    topic,
    when,
    declare,
    lang,

    Draw
) {
    return declare([_Filter], {
        // description:
        //      Filter by drawing a shape on the map

        templateString: template,

        // draw: Draw
        //      description
        draw: null,

        // currentGeometry: Polygon
        currentGeometry: null,

        // Properties to be sent into constructor

        constructor: function () {
            // summary:
            //      apply base css class
            console.log('app/filters/ShapeFilter:constructor', arguments);

            this.baseClass += ' shape-filter';
        },
        startup: function () {
            console.log('app/filters/ShapeFilter:startup', arguments);

            var that = this;
            $(this.body).on('show.bs.collapse', lang.hitch(this, 'enableDrawing'));
            $(this.body).on('hide.bs.collapse', function () {
                that.draw.deactivate();
            });

            this.inherited(arguments);
        },
        open: function () {
            // summary:
            //      show the body of this widget
            //      enables the drawing toolbar
            console.log('app/filters/ShapeFilter:open', arguments);

            this.enableDrawing();

            this.inherited(arguments);
        },
        enableDrawing: function () {
            // summary:
            //      turn on drawing tool
            console.log('app/filters/ShapeFilter:enableDrawing', arguments);

            if (!this.draw) {
                this.draw = new Draw(mapController.map, {
                    showTooltips: true
                });
                this.draw.on('draw-complete', lang.hitch(this, 'onDrawComplete'));

                aspect.after(this.draw, 'deactivate', function () {
                    topic.publish(config.topics.resumeMapClick);
                });
                aspect.after(this.draw, 'activate', function () {
                    topic.publish(config.topics.pauseMapClick);
                });
            }

            this.draw.activate(Draw.POLYGON);

            this.inherited(arguments);
        },
        onDrawComplete: function (evt) {
            // summary:
            //      user has finished drawing the polygon
            //      calculates area and sends to map graphics
            // evt: Event Object
            console.log('app/filters/ShapeFilter:onDrawComplete', arguments);

            var that = this;

            this.currentGeometry = evt.geometry;

            // 109413 = square miles
            when(geometryEngine.planarArea(evt.geometry, 109413), function (sqMiles) {
                that.numSpan.innerHTML = formatting.addCommas(formatting.round(sqMiles, 0));
            });

            topic.publish(config.topics.addGraphic, evt.geometry);

            this.emit('changed');
        },
        clear: function () {
            // summary:
            //      clears current drawing an graphics if any
            console.log('app/filters/ShapeFilter:clear', arguments);

            topic.publish(config.topics.removeGraphic);

            this.currentGeometry = null;

            this.draw.deactivate();
            this.draw.activate(Draw.POLYGON);

            this.emit('changed');
        },
        remove: function () {
            // summary:
            //      removes widget from visible filters
            console.log('app/filters/ShapeFilter:remove', arguments);

            this.inherited(arguments);

            this.draw.deactivate();
        },
        getQuery: function () {
            // summary:
            //      returns the last draw geometry or null
            console.log('app/filters/ShapeFilter:getQuery', arguments);

            return this.currentGeometry;
        }
    });
});
