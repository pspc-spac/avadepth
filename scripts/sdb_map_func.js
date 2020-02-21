/**
 * Created by wsiddall on 26/08/2014.
 * Maintained by seor since 02/10/2015.
 */
var debug = true;
var locException = [];

avaMapJS.sdb_func = {
    // init function for loading custom tile file and other events
    init: function() {
        // Setting up place-holder variables
        avaMapJS.sdb_func.curWaterway = "";
        avaMapJS.sdb_func.curLocation = "";

        // KML Feature Styles and KML Layer
        mapStyle.callback_function = avaMapJS.sdb_func.checkTileRefresh;
        avaMapJS.sdb_func.kml = new OpenLayers.Layer.Vector("KML", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            projection: avaMapJS.map.displayProjection,
            renderers: avaMapJS.renderer,
            styleMap: mapStyle.area_with_label("${location}"),
            protocol: new OpenLayers.Protocol.HTTP({
                url: "sdb_tiles.kml?",
                format: new OpenLayers.Format.KML({
                    extractStyles: false,
                    extractAttributes: true,
                    maxDepth: 2
                })
            })
        });
        avaMapJS.setMapLayer(avaMapJS.sdb_func.kml);

        // Map Interaction parameters
        avaMapJS.sdb_func.HLFeat = new OpenLayers.Control.SelectFeature(avaMapJS.sdb_func.kml, {
            hover: false,
            toggle: false,
            clickout: true,
            multiple: false,
            toggleKey: "ctrlKey",
            multipleKey: "shiftKey"
        });
        avaMapJS.setMapControls([avaMapJS.sdb_func.HLFeat]);
        avaMapJS.sdb_func.HLFeat.activate();
        avaMapJS.sdb_func.HLFeat.handlers.feature.stopDown = false;
        avaMapJS.sdb_func.kml.events.on({
            'featureselected': avaMapJS.sdb_func.tileSelect,
            'featureunselected': avaMapJS.sdb_func.tileUnselect
        });

        // Sets extents of map
        avaMapJS.sdb_func.setExtents(Object.keys(incl_ava_defs.locDefs)[0]);
    },

    /*** Page-specific functions ***/
    // setExtents: Using the name of provided Waterways selector, draw extents from 'locationExtents' dict.
    setExtents: function(waterway) {
        if (!waterway) {
            return;
        }
        var obj = incl_ava_defs.locDefs[waterway].Coords;
        try {
            avaMapJS.map.zoomToExtent(new OpenLayers.Bounds(obj.Lon.min, obj.Lat.min, obj.Lon.max, obj.Lat.max));
        } catch (err) {
            if (debug) console.log("void setExtents(): " + err);
        }
    },

    // page specific
    setChannelExtents: function(waterway, channel) {
        if (!channel || !waterway) {
            if (debug) console.log("void setChannelExtents(): Both channel and waterway needs to be defined");
            return;
        }

        var obj = incl_ava_defs.locDefs[waterway].Sections[channel].Coords;
        // if (debug) {
            // console.log("void setChannelExtents(): minLat=" + obj.Lat.min);
            // console.log("void setChannelExtents(): maxLat=" + obj.Lat.max);
            // console.log("void setChannelExtents(): minLon=" + obj.Lon.min);
            // console.log("void setChannelExtents(): maxLon=" + obj.Lon.max);
            // console.log("void setChannelExtents(): channel=" + channel);
        // }

        try {
            avaMapJS.map.zoomToExtent(new OpenLayers.Bounds(obj.Lon.min, obj.Lat.min, obj.Lon.max, obj.Lat.max));
        } catch (err) {
            if (debug) console.log("void setChannelExtents(): " + err);
        }
        avaMapJS.sdb_func.refreshTiles(channel, "");
    },

    setExtentsLatLon : function(obj) {
        try {
            // LatLon to Spherical Mercator projection
            var proj = new OpenLayers.Projection("EPSG:4326");
            var targetProj = new OpenLayers.Projection("EPSG:3857");
            var box = new OpenLayers.Bounds(obj.Lon.min, obj.Lat.min, obj.Lon.max, obj.Lat.max);
            box.transform(proj, targetProj);
            avaMapJS.map.zoomToExtent(box);
        } catch (err) {
            if (debug) console.log("void setExtentsLatLon(): " + err);
        }
    },

    /**
     * Convert LatLon to Spherical Mercator Projection in console
     * @param  {[Array]} obj [minLon, minLat, maxLon, maxLat]
     * @return {[Object]}     [OpenLayers.Bounds object]
     */
    projectLatLon : function(obj) {
        // LatLon to Spherical Mercator projection
        var proj = new OpenLayers.Projection("EPSG:4326");
        var targetProj = new OpenLayers.Projection("EPSG:3857");
        var box = new OpenLayers.Bounds(obj[0], obj[1], obj[2], obj[3]);
        box.transform(proj, targetProj);
        console.log("Lat min/max: " + Math.round(box.bottom) + " & " + Math.round(box.top));
        console.log("Lon min/max: " + Math.round(box.left) + " & " + Math.round(box.right));
        return box;
    },

    tileUnselect: function(tile) {
        if(debug) console.log("tileUnselect(" + tile.feature.data.location + ")");
        if(debug) console.log(avaMapJS.sdb_func.curLocation == tile.feature.data.location);
        if (tile.feature.data.location == avaMapJS.sdb_func.curLocation) {
            avaMapJS.sdb_func.curLocation = "";
            avaMapJS.sdb_func.curWaterway = "";
        }
    },

    // tileSelect: callBack function for tile selection from the map interface
    tileSelect: function(tile) {
        var tileName = tile.feature.data.name;
        if(debug) console.log("tileSelect(" + tile.feature.data.location + ")");
        if (debug) {
            console.log("void tileSelect(): " + tileName);
            console.log(tile.feature.data);
        }
        if (tileName.indexOf('/') >= 0) {
            parent.window.open("http://www2.pac.dfo-mpo.gc.ca" + tileName, '_blank');
            parent.avaIFaceJS.sdb_func.update(); // refresh page from updated parameters
        } else {
            parent.avaIFaceJS.sdb_func.updateParameters({
                "data": tile.feature.data
            });
            parent.avaIFaceJS.sdb_func.update(tileName); // refresh page from updated parameters
        }
    },

    // refreshTiles: function to refresh the draw of the tile layer using the new selected form settings
    refreshTiles: function(channel, location) {
        if(debug) console.log("void refreshTiles()");
        avaMapJS.sdb_func.curWaterway = channel;
        avaMapJS.sdb_func.curLocation = location;
        if (location == "") {
            avaMapJS.sdb_func.kml.redraw();
        }
        //parent.avaIFaceJS.sdb_func.update();
    },

    /**
     * [refreshLocation refresh the layer with new selected feature]
     * @param  {[String]} location [the string value of location to highlight]
     * @return {[void]}
     */
    refreshLocation : function(location) {
        if(debug) console.log("refreshLocation(" + location + ")");
        this.checkRemainingFeaturesOnLayer();
        if (location != "") {
            var featureToSelect = this.getFeaturesByLocation(location);
            if (featureToSelect != -1) this.HLFeat.select(featureToSelect);
            // else parent.avaIFaceJS.sdb_func.update();
        }
        // else parent.avaIFaceJS.sdb_func.update(); 
        avaMapJS.sdb_func.kml.redraw();
    },

    /**
     * [refreshChannel refresh the layer with new selected feature]
     * @param  {[String]} channel [the string value of channel to highlight]
     * @return {[void]}
     */
    refreshChannel : function(channel) {
        if(debug) console.log("refreshLocation(" + channel + ")");
        this.checkRemainingFeaturesOnLayer();
        if (channel != "") {
            var featureToSelect = this.getFeaturesByChannel(channel);
                if (featureToSelect != -1) this.HLFeat.select(featureToSelect);
            // else parent.avaIFaceJS.sdb_func.update();
        }
        // else parent.avaIFaceJS.sdb_func.update();
        avaMapJS.sdb_func.kml.redraw();
    },

    /**
     * [getFeaturesByLocation return tile that contains passed location]
     * @param  {[String]} location [a location to search inside the vector]
     * @return {[Object]}          [tile object]
     */
    getFeaturesByLocation : function(location) {
        if(debug) console.log("getFeaturesByLocation(" + location + ")");
        var features = this.kml.features;
        for (var i = 0; i < features.length; i++) {
            var data = features[i].data.location;
            if(location == data) return features[i]; 
            // var regEx = new RegExp(location);
            // var start = /^/;
            // regEx = (start.source + regEx.source);
            // if (data.search(regEx) > -1) return features[i];
        }
        return -1;
    },

    /**
     * [getFeaturesByChannel return tile that contains passed location]
     * @param  {[String]} channel [a location to search inside the vector]
     * @return {[Object]}          [tile object]
     */
    getFeaturesByChannel : function(channel) {
        if(debug) console.log("getFeaturesByChannel(" + channel + ")");
        var features = this.kml.features;
        for (var i = 0; i < features.length; i++) {
            var data = features[i].data.location;
            if(channel == data) return features[i]; 
        }
        return -1;
    },

    /**
     * [checkRemainingFeaturesOnLayer Check if features are remaining on the layer, and remove them if they are]
     * @return {[Boolean]}          [return true if the function executes successfully]
     */
    checkRemainingFeaturesOnLayer : function() {
        if(debug) console.log("checkRemainingFeaturesOnLayer()\n");
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
    unselectSelectedFeaturesOnLayer : function(features) {
        for (var i = 0; i < features.length; i++) {
            this.unselectAFeatureOnLayer(features[i]);
        }
    },

    /**
     * [unselectFeatureOnLayer unselect a feature on the layer by giving an ID of the vector layer element]
     * @param  {[String]} feature [a feature]
     * @return {[void]}
     */
    unselectAFeatureOnLayer : function(feature) {
        this.HLFeat.unselect(feature);
    },

    /**
     * [getSelectedFeatures get all selected features]
     * @return {[Array]} [all selected feature objects in an array]
     */
    getSelectedFeatures : function() {
        return this.kml.selectedFeatures;
    },

    // checkTileRefresh: checks if the tile's attributes match the currently selected values
    checkTileRefresh: function(feat) {
        var temp;
        if (window.location.href.indexOf("fra") > -1) {
            //If url contains 'fra' use
            if (avaMapJS.sdb_func.curLocation.length > 0 && avaMapJS.sdb_func.curLocation != " - Aperçu du chenal") {
                temp = feat.data.location == avaMapJS.sdb_func.curLocation;
            } else {
                temp = true;
            }
        } else {
            //If url does not contain 'fra' use
            if (avaMapJS.sdb_func.curLocation.length > 0 && avaMapJS.sdb_func.curLocation != "Channel Overview") {
                temp = feat.data.location == avaMapJS.sdb_func.curLocation;
            } else {
                temp = true;
            }
        }
        return temp && (feat.data.waterway == avaMapJS.sdb_func.curWaterway);
    }
};
//# sourceURL=sdb_map_func.js