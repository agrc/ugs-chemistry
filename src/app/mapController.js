define([
    'agrc/widgets/map/BaseMap',

    'app/config',

    'dojo/Deferred',
    'dojo/on',
    'dojo/topic',
    'dojo/_base/lang',

    'esri/Color',
    'esri/graphic',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/FeatureLayer',
    'esri/tasks/IdentifyParameters',
    'esri/tasks/IdentifyTask',
    'esri/tasks/query',
    'esri/tasks/QueryTask'
], function (
    BaseMap,

    config,

    Deferred,
    on,
    topic,
    lang,

    Color,
    Graphic,
    ArcGISDynamicMapServiceLayer,
    FeatureLayer,
    IdentifyParameters,
    IdentifyTask,
    Query,
    QueryTask
) {
    return {
        // map: BaseMap
        map: null,

        // dLayer: ArcGISDynamicMapServiceLayer
        //      layer that is displayed at smaller scales
        dLayer: null,

        // fLayer: FeatureLayer
        //      layer that is displayed at larger scales
        fLayer: null,

        // layerEventHandlers: Object[]
        layerEventHandlers: [],

        // identifyTask: IdentifyTask
        identifyTask: null,

        // selectedStationId: Number
        //      The id of the currently selected station if there is one
        selectedStationId: null,

        // mapClickHandler: Object
        //      Used to pause this event during polygon draw
        mapClickHandler: null,

        securityLevels: {
            open: 'open',
            secure: 'secure'
        },

        initMap: function (mapDiv, securityLevel) {
            // summary:
            //      Sets up the map
            // mapDiv: Node
            // securityLevel: string
            console.info('app/mapController:initMap', arguments);

            var that = this;

            this.map = new BaseMap(mapDiv, {
                defaultBaseMap: 'Terrain'
            });

            this.initLayers(securityLevel);

            topic.subscribe(config.topics.filterFeatures, lang.hitch(this, 'filterFeatures'));
            topic.subscribe(config.topics.addGraphic, function (geo) {
                that.map.graphics.clear();
                that.map.graphics.add(new Graphic(geo, config.drawingSymbol));
            });
            topic.subscribe(config.topics.removeGraphic, function () {
                that.map.graphics.clear();
            });
            topic.subscribe(config.topics.clearStationSelection, lang.hitch(this, 'clearStationSelection'));

            this.mapClickHandler = on.pausable(this.map, 'click', lang.hitch(this, 'onMapClick'));
            topic.subscribe(config.topics.pauseMapClick, lang.hitch(this.mapClickHandler, 'pause'));
            topic.subscribe(config.topics.resumeMapClick, lang.hitch(this.mapClickHandler, 'resume'));
        },
        initLayers: function (securityLevel) {
            // summary:
            //      description
            // securityLevel: string
            console.log('app.mapController:initLayers', arguments);

            var that = this;
            var mapServiceUrl;
            var fLayerUrl;
            var queryFLayerUrl;
            if (securityLevel === this.securityLevels.open) {
                mapServiceUrl = config.urls.mapService;
                fLayerUrl = config.urls.mapService;
                queryFLayerUrl = config.urls.mapService + '/' + config.layerIndices.main;
            } else {
                mapServiceUrl = config.urls.secureMapService + '?token=' + config.user.token;
                fLayerUrl = config.urls.secureMapService;
                queryFLayerUrl = config.urls.secureMapService + '/' + config.layerIndices.main + '?token=' + config.user.token;
            }

            if (this.layerEventHandlers.length > 0) {
                this.map.removeLayer(this.dLayer);
                this.map.removeLayer(this.fLayer);
            }

            this.dLayer = new ArcGISDynamicMapServiceLayer(mapServiceUrl, {
                maxScale: config.minFeatureLayerScale
            });
            this.map.addLayer(this.dLayer);
            this.map.addLoaderToLayer(this.dLayer);

            this.fLayer = new FeatureLayer(fLayerUrl + '/' + config.layerIndices.main, {
                minScale: config.minFeatureLayerScale
            });
            this.layerEventHandlers.push(this.fLayer.on('load', function () {
                that.fLayer.renderer.symbol.setSize(config.stationSymbolSize);
            }));
            this.layerEventHandlers.push(this.fLayer.on('click', function selectFeatureLayerStation(evt) {
                that.clearStationSelection();
                that.selectStation(evt.graphic);
                evt.stopPropagation();
            }));
            this.map.addLayer(this.fLayer);
            this.map.addLoaderToLayer(this.fLayer);

            this.queryFLayer = new FeatureLayer(queryFLayerUrl);
            this.layerEventHandlers.push(
                this.queryFLayer.on('query-ids-complete', lang.hitch(this, 'queryIdsComplete'))
            );
        },
        onMapClick: function (evt) {
            // summary:
            //      user clicks on the map
            //      query for feature from dynamic service and update selection accordingly
            // evt: Event Object
            console.log('app.mapController:onMapClick', arguments);

            var that = this;

            if (this.map.getScale() >= config.minFeatureLayerScale) {
                var identifyParams = new IdentifyParameters();
                lang.mixin(identifyParams, {
                    geometry: evt.mapPoint,
                    height: this.map.height,
                    layerDefinitions: this.dLayer.layerDefinitions,
                    layerIds: [0],
                    mapExtent: this.map.extent,
                    returnGeometry: true,
                    tolerance: 7,
                    width: this.map.width
                });

                if (!this.identifyTask) {
                    this.identifyTask = new IdentifyTask(config.urls.mapService);
                    this.identifyTask.on('complete', function processResults(evt) {
                        that.clearStationSelection();
                        if (evt.results.length > 0) {
                            that.selectStation(evt.results[0].feature);
                        } else {
                            that.clearStationSelection();
                        }
                    });
                    this.identifyTask.on('error', function processError(evt) {
                        console.error(evt.error);
                        that.clearStationSelection();
                    });
                }

                this.identifyTask.execute(identifyParams);
            } else {
                this.clearStationSelection();
            }
        },
        clearStationSelection: function () {
            // summary:
            //      description
            // param or return
            console.log('app.mapController:clearStationSelection', arguments);

            if (this.map.graphics) {
                this.map.graphics.clear();
            }
            this.selectedStationId = null;
            this.updateLayerDefs(this.fLayer.getDefinitionExpression() || '1 = 1');
        },
        selectStation: function (feature) {
            // summary:
            //      description
            // param or return
            console.log('app.mapController:selectStation', arguments);

            this.map.graphics.add(new Graphic(feature.geometry, config.selectionSymbol));
            this.selectedStationId = feature.attributes[config.fieldNames.Id];
            this.updateLayerDefs(this.fLayer.getDefinitionExpression() || '1 = 1');
        },
        filterFeatures: function (defQuery, geometry) {
            // summary:
            //      selects stations on the map
            //      applies selection to dLayer & fLayer
            // defQuery[optional]: String
            //      select by definition query
            // geometry[optional]: Polygon
            //      select by geometry
            console.log('app/mapController:filterFeatures', arguments);

            if (defQuery || geometry) {
                this.map.showLoader();
                if (geometry) {
                    // only query for ids if there is a geometry
                    var query = new Query();
                    if (defQuery) {
                        query.where = defQuery;
                    }
                    if (geometry) {
                        query.geometry = geometry;
                    }
                    this.queryFLayer.queryIds(query);
                } else {
                    this.updateLayerDefs(defQuery);
                }
            } else {
                this.updateLayerDefs('1 = 1');
            }
        },
        queryIdsComplete: function (response) {
            // summary:
            //      callback for fLayer.queryIds
            // response: {objectIds: Number[]}
            console.log('app/mapController:queryIdsComplete', arguments);

            this.map.hideLoader();
            var def;
            if (response.objectIds) {
                def = config.fieldNames.Id + ' IN (' + response.objectIds.join(', ') + ')';
            } else {
                def = '1 = 2';
            }

            this.updateLayerDefs(def);
        },
        updateLayerDefs: function (def) {
            // summary
            //      update layer defs
            // def: String
            console.log('app.mapController:updateLayerDefs', arguments);
            this.fLayer.setDefinitionExpression(def);

            var defs = [];
            defs[config.layerIndices.main] = def;
            this.dLayer.setLayerDefinitions(defs);

            var gridDef = (this.selectedStationId) ?
                def + ' AND ' + config.fieldNames.Id + ' = ' + this.selectedStationId : def;

            topic.publish(config.topics.queryIdsComplete, gridDef);
        },
        getParameters: function () {
            // summary:
            //      query tasks for the parameter values
            console.log('app/mapController:getParameters', arguments);

            var def = new Deferred();
            var q = new Query();
            q.returnGeometry = false;
            q.outFields = [config.fieldNames.Param];
            q.where = '1 = 1';

            var qt = new QueryTask(config.urls.mapService + '/' + config.layerIndices.parameters);

            qt.execute(q).then(function (fSet) {
                var params = fSet.features.map(function (f) {
                    return f.attributes[config.fieldNames.Param];
                });
                def.resolve(params);
            }, function () {
                def.reject();
            });

            return def;
        },
        switchToSecure: function () {
            // summary:
            //      description
            console.log('app.mapController:switchToSecure', arguments);

            this.initLayers(this.securityLevels.secure);

            this.identifyTask = new IdentifyTask(config.urls.secureMapService);
        }
    };
});
