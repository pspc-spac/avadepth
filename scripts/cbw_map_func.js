/**
 * Created by wsiddall on 09/03/2021
 */

let debug = false;
let hostname = document.URL.split("/")[2].split(":")[0] === "localhost" ? "localhost:8080" : "ava-proto.com"
const avadepthTMS = `https://${hostname}/tiles`;
const TMSTileFormat = "GoogleMapsCompatible/${z}/${y}/${x}.png";
const TMSOptions = {
    sphericalMercator: true,
    format: "image/png",
    isBaseLayer: false,
    projection: new OpenLayers.Projection("EPSG:3857"),
    units: "m",
    alwaysInRange: true,
    serverResolutions: [
        156543.03392804097,
        78271.51696402048,
        39135.75848201024,
        19567.87924100512,
        9783.93962050256,
        4891.96981025128,
        2445.98490512564,
        1222.99245256282,
        611.4962262814101,
        305.74811314070485,
        152.8740565703525,
        76.43702828517625,
        38.218514142588134,
        19.109257071294063,
        9.554628535647032,
        4.777314267823516,
        2.388657133911758,
        1.194328566955879,
        0.5971642834779395
    ]
};

let layerMap = new Map([
    ["channel", ["channel_cells", "channel_outline"]],
    ["soundings", ["soundings"]]
]);
const LayerNames = new Map([
    ["combined", {title: "Combined", name: "#_Surface_Depth.#_Combined"}],
    ["conformance", {title: "Conformance", name: "#_Surface_Conformance.#_Conformance"}],
    ["difference", {title: "Difference", name: "#_Surface_Difference.#_Difference"}],
    ["soundings", {title: "Depths", name: "#_Depth_Channel.#_Channel_Depths"}],
    ["channel_outline", {title: "Channel Extents", name: "#_Channel_Outline.#_Outline_Channel"}],
    ["channel_cells", {title: "Channel Cells", name: "#_Channel_Cells.#_Outline_Cells"}]
]);
const RiverSections = new Map([
    ["FRSA", {
        layers: ["combined", "conformance", "difference", "soundings", "channel_cells", "channel_outline"],
        extents: new OpenLayers.Bounds(-13730138, 6282692,-13677350, 6314133)
    }],
    ["FRSC", {
        layers: ["combined", "conformance", "soundings"],
        extents: new OpenLayers.Bounds(-13730138, 6282692,-13677350, 6314133)
    }],
    ["FRNA", {
        layers: ["combined", "conformance", "soundings"],
        extents: new OpenLayers.Bounds(-13730138, 6287692,-13677350, 6319133)
    }],
    ["FRMA", {
        layers: ["combined", "conformance", "soundings"],
        extents: new OpenLayers.Bounds(-13692049.134674, 6277545.1912811, -13606133.914894, 6329522.3705077)
    }],
    ["PIRI", {
        layers: ["combined", "conformance", "soundings"],
        extents: new OpenLayers.Bounds(-13695106.615805, 6301928.6033007, -13609191.396025, 6353905.7825273)
    }],
]);

function applyRiverName(template, riverName) {
    return template.replace(/#/g, riverName);
}

avaMapJS.cbw_func = {
    init: function() {
        avaMapJS.cbw_func.wmts_layers = {};
        avaMapJS.cbw_func.current_river = "$";
        avaMapJS.cbw_func.currentSurface = "combined";
    },

    loadLayers: function(river) {
        let current_layers = avaMapJS.map.layers.filter(x => x.name&&x.name.startsWith(avaMapJS.cbw_func.current_river));
        for(let lyr of current_layers){
            avaMapJS.map.removeLayer(lyr);
        }
        avaMapJS.cbw_func.current_river = river;
        avaMapJS.cbw_func.setExtents();
        let layers = RiverSections.get(river).layers
            .map(name => [name, LayerNames.get(name).title, applyRiverName(LayerNames.get(name).name, river)]);
        avaMapJS.cbw_func.wmts_layers = {};
        for(let lyr of layers) {
            avaMapJS.cbw_func.wmts_layers[lyr[0]] = new OpenLayers.Layer.XYZ(
                lyr[2], `${avadepthTMS}/${lyr[2]}/${TMSTileFormat}`, TMSOptions
            );
        }
        avaMapJS.cbw_func.wmts_layers.difference&&avaMapJS.cbw_func.wmts_layers.difference.setVisibility(false);
        avaMapJS.cbw_func.wmts_layers.conformance&&avaMapJS.cbw_func.wmts_layers.conformance.setVisibility(false);
        avaMapJS.cbw_func.wmts_layers.channel_cells&&avaMapJS.cbw_func.wmts_layers.channel_cells.setVisibility(false);
        avaMapJS.map.addLayers(Object.keys(avaMapJS.cbw_func.wmts_layers).map(x => avaMapJS.cbw_func.wmts_layers[x]));
        avaMapJS.cbw_func.setLayer("surface", true);
    },

    setRiver: function(river) {
        avaMapJS.cbw_func.loadLayers(river);
    },

    triggerLayer: function(evt) {
        avaMapJS.cbw_func.setLayer(evt.target.value, evt.target.checked);
    },

    setLayer: function(layerName, toggleValue) {
        if(layerName === "surface"){
            avaMapJS.cbw_func.wmts_layers[avaMapJS.cbw_func.currentSurface].setVisibility(toggleValue);
        } else {
            for (let lyrName of layerMap.get(layerName)) {
                avaMapJS.cbw_func.wmts_layers[lyrName].setVisibility(toggleValue);
            }
        }
    },

    changeSurface: function (layerName) {
        if (layerName === avaMapJS.cbw_func.currentSurface) return;
        if (layerName === 'isa') {
            avaMapJS.isa_func.init();
            avaMapJS.cbw_func.wmts_layers[avaMapJS.cbw_func.currentSurface].setVisibility(false);
        } else {
            avaMapJS.cbw_func.wmts_layers[layerName].setVisibility(true);
            if (avaMapJS.cbw_func.currentSurface === 'isa') {
                avaMapJS.map.removeLayer(avaMapJS.isa_func.kml);
            } else {
                avaMapJS.cbw_func.wmts_layers[avaMapJS.cbw_func.currentSurface].setVisibility(false);
            }
        }
        avaMapJS.cbw_func.currentSurface = layerName;
    },

    /*** Page-specific functions ***/
    // setExtents: Using the name of provided Waterways selector, draw extents from 'locationExtents' dict.
    setExtents: function() {
        try {
            avaMapJS.map.zoomToExtent(RiverSections.get(avaMapJS.cbw_func.current_river).extents);
        } catch (err) {
            if (debug) console.log("void setExtents(): " + err);
        }
    },
}

// isa function
var locException = [];
avaMapJS.isa_func = {
    // init function for loading custom tile file and other events
    init: function () {
        // Setting up place-holder variables
        avaMapJS.isa_func.curWaterway = "";
        avaMapJS.isa_func.curLocation = "";

        // KML Feature Styles and KML Layer
        mapStyle.callback_function = avaMapJS.isa_func.checkTileRefresh;
        avaMapJS.isa_func.kml = new OpenLayers.Layer.Vector("KML", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            projection: avaMapJS.map.displayProjection,
            renderers: avaMapJS.renderer,
            styleMap: mapStyle.area_for_channel("${location}"),
            protocol: new OpenLayers.Protocol.HTTP({
                url: "isa_tiles.kml?",
                format: new OpenLayers.Format.KML({
                    extractStyles: false,
                    extractAttributes: true,
                    maxDepth: 2
                })
            })
        });

        avaMapJS.setMapLayer(avaMapJS.isa_func.kml);

        // Map Interaction parameters
        // Tiles clicking listener
        avaMapJS.isa_func.HLFeat = new OpenLayers.Control.SelectFeature(avaMapJS.isa_func.kml, {
            hover: true,
            highlightOnly: true,
            toggle: false,
            clickout: true,
            multiple: false,
            toggleKey: "ctrlKey",
            multipleKey: "shiftKey"
        });
        avaMapJS.setMapControls([avaMapJS.isa_func.HLFeat]);
        avaMapJS.isa_func.HLFeat.activate();
        avaMapJS.isa_func.HLFeat.handlers.feature.stopDown = false;
        avaMapJS.isa_func.kml.events.on({
            'featureselected': avaMapJS.isa_func.tileSelect,
            'featureunselected': avaMapJS.isa_func.tileUnselect
        });

        // Sets extents of map and disable parameter
        // Zoom in
        avaMapJS.isa_func.setExtents();
    },

    /*** Page-specific functions ***/
    // setExtents: Using the name of provided Waterways selector, draw extents from 'locationExtents' dict.
    setExtents: function () {
        try {
            avaMapJS.map.zoomToExtent(new OpenLayers.Bounds(-13730138, 6282692, -13677350, 6314133));
        } catch (err) {
            if (debug) console.log("void setExtents(): " + err);
        }
    },

    // page specific
    setChannelExtents: function (waterway, channel) {
        if (!channel || !waterway) {
            if (debug) console.log("void setChannelExtents(): Both channel and waterway needs to be defined");
            return;
        }

        var obj = incl_ava_defs.locDefs[waterway].Sections[channel].Coords;
        if (debug) {
            console.log("void setChannelExtents(): minLat=" + obj.Lat.min);
            console.log("void setChannelExtents(): channel=" + channel);
        }

        try {
            avaMapJS.map.zoomToExtent(new OpenLayers.Bounds(obj.Lon.min, obj.Lat.min, obj.Lon.max, obj.Lat.max));
        } catch (err) {
            if (debug) console.log("void setChannelExtents(): " + err);
        }
        avaMapJS.isa_func.refreshTiles(channel, "");
    },

    tileUnselect: function (tile) {
        if (tile.feature.data.location == avaMapJS.isa_func.curLocation) {
            avaMapJS.isa_func.curLocation = "";
            avaMapJS.isa_func.curWaterway = "";
        }
    },

    // tileSelect: callBack function for tile selection from the map interface
    tileSelect: function (tile) {
        var tileName = tile.feature.data.name;
        if (debug) {
            console.log("void tileSelect(): " + tileName);
            console.log("void tileSelect(): " + tile.feature.data);
            console.log(tile.feature.data);
        }
        if (tileName.indexOf('/') >= 0) {
            parent.window.open("http://www2.pac.dfo-mpo.gc.ca" + tileName, '_blank');
        } else {
            parent.avaIFaceJS.isa_func.location = tile.feature.data.location;
            parent.avaIFaceJS.isa_func.update(tileName); // refresh page from updated parameters
        }
    },

    // refreshTiles: function to refresh the draw of the tile layer using the new selected form settings
    refreshTiles: function (channel, location) {
        avaMapJS.isa_func.curWaterway = channel;
        avaMapJS.isa_func.curLocation = location;
        if (location == "") {
            avaMapJS.isa_func.kml.redraw();
        }
    },

    /**
     * [refreshLocation refresh the layer with new selected feature]
     * @param  {[String]} location [the string value of location to highlight]
     * @return {[void]}
     */
    refreshLocation: function (location) {
        this.checkRemainingFeaturesOnLayer();
        if (location.length != "") {
            var featureToSelect = this.getFeaturesByLocation(location);
            if (featureToSelect != -1) this.HLFeat.select(featureToSelect);
        }
        avaMapJS.isa_func.kml.redraw();
    },

    /**
     * [getFeaturesByLocation return an array of features that contain passed location]
     * @param  {[String]} location [a location to search inside the vector]
     * @return {[Object]}          [feature object]
     */
    getFeaturesByLocation: function (location) {
        var features = this.kml.features;
        for (var i = 0; i < features.length; i++) {
            var data = features[i].data.location;
            var regEx = new RegExp(location);
            var start = /^/;
            regEx = (start.source + regEx.source);
            if (data.search(regEx) > -1) return features[i];
        }
        return -1;
    },

    /**
     * [checkRemainingFeaturesOnLayer Check if features are remaining on the layer, and remove them if they are]
     * @return {[Boolean]}          [return true if the function executes successfully]
     */
    checkRemainingFeaturesOnLayer: function () {
        var selectedFeatures = this.getSelectedFeatures();
        if (selectedFeatures.length == 0) {
            return true;
        } else if (selectedFeatures.length > 0) {
            this.unselectSelectedFeaturesOnLayer(selectedFeatures);
            return true;
        }
        return false;
    },

    /**
     * [unselectSelectedFeaturesOnLayer unselect all features on the layer]
     * @param  {[Array]} features [all selected feature objects in an array]
     * @return {[void]}
     */
    unselectSelectedFeaturesOnLayer: function (features) {
        for (var i = 0; i < features.length; i++) {
            this.unselectAFeatureOnLayer(features[i]);
        }
    },

    /**
     * [unselectFeatureOnLayer unselect a feature on the layer by giving an ID of the vector layer element]
     * @param  {[String]} feature [a feature]
     * @return {[void]}
     */
    unselectAFeatureOnLayer: function (feature) {
        this.HLFeat.unselect(feature);
    },

    /**
     * [getSelectedFeatures get all selected features]
     * @return {[Array]} [all selected feature objects in an array]
     */
    getSelectedFeatures: function () {
        return this.kml.selectedFeatures;
    },

    // checkTileRefresh: checks if the tile's attributes match the currently selected values
    checkTileRefresh: function (feat) {
        var temp;
        if (window.location.href.indexOf("fra") > -1) {
            //If url contains 'fra' use 
            if (avaMapJS.isa_func.curLocation.length > 0 && avaMapJS.isa_func.curLocation != " - Aperçu du chenal") {
                temp = feat.data.location == avaMapJS.isa_func.curLocation;
            } else {
                temp = true;
            }
        } else {
            //If url does not contain 'fra' use
            if (avaMapJS.isa_func.curLocation.length > 0 && avaMapJS.isa_func.curLocation != "Channel Overview") {
                temp = feat.data.location == avaMapJS.isa_func.curLocation;
            } else {
                temp = true;
            }
        }
        return temp && (feat.data.waterway == avaMapJS.isa_func.curWaterway);
    }
};
//# sourceURL=cbw_map_func.js
