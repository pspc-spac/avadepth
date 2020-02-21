/**
 * Created by wsiddall on 26/08/2014.
 */

avaMapJS.pwl_func = {
    default_extents: "South Arm",
    init: function() {
        avaMapJS.pwl_func.curRiver = {
            obj: undefined,
            key: ""
        };

        // KML Feature Styles and KML Layer
        mapStyle.callback_function = avaMapJS.pwl_func.checkMarker;
        avaMapJS.pwl_func.kml = new OpenLayers.Layer.Vector("KML", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            projection: avaMapJS.map.displayProjection,
            styleMap: mapStyle.point_with_label("${KM}"),
            protocol: new OpenLayers.Protocol.HTTP({
                url: "pwl_markers.kml?",
                format: new OpenLayers.Format.KML({
                    extractStyles: false,
                    extractAttributes: true,
                    maxDepth: 2
                })
            })
        });
        avaMapJS.setMapLayer(avaMapJS.pwl_func.kml);
        // Map Interaction parameters
        avaMapJS.pwl_func.HLFeat = new OpenLayers.Control.SelectFeature(avaMapJS.pwl_func.kml, {
            hover: true,
            highlightOnly: true,
            renderIntent: "temporary"
        });
        avaMapJS.setMapControls([avaMapJS.pwl_func.HLFeat]);
        avaMapJS.pwl_func.HLFeat.activate();
        avaMapJS.pwl_func.HLFeat.handlers.feature.stopDown = false;
        avaMapJS.pwl_func.kml.events.on({
            'featureselected': avaMapJS.pwl_func.selectMarker
        });

        // Sets extents of map
        avaMapJS.pwl_func.setExtents(avaMapJS.pwl_func.default_extents);
    },

    // checkTileRefresh: checks if the tile's attributes match the currently selected values
    checkMarker: function(feat) {
        return feat.attributes.waterway == avaMapJS.pwl_func.curRiver.key;
    },

    _hasRiver: function(rivObj, riverName) {
        try {
            if (rivObj.pwl.key == riverName) {
                return true;
            } else {
                return false;
            }
        } catch (err) {}
        return false;
    },

    lookupRiver: function(riverName) {
        var rivObj;
        for (var r in incl_ava_defs.locDefs) {
            if ('Sections' in incl_ava_defs.locDefs[r]) {
                for (var s in incl_ava_defs.locDefs[r].Sections) {
                    rivObj = incl_ava_defs.locDefs[r].Sections[s];
                    if (avaMapJS.pwl_func._hasRiver(rivObj, riverName)) {
                        return {
                            obj: rivObj,
                            key: s
                        };
                    }
                }
            } else {
                rivObj = incl_ava_defs.locDefs[r];
                if (avaMapJS.pwl_func._hasRiver(rivObj, riverName)) {
                    return {
                        obj: rivObj,
                        key: r
                    };
                }
            }
        }
        return {
            obj: undefined,
            key: ""
        };
    },

    refreshMarkers: function(riverName) {
        avaMapJS.pwl_func.curRiver = avaMapJS.pwl_func.lookupRiver(riverName);
        avaMapJS.pwl_func.kml.redraw();
    },

    selectMarker: function(feat) {
        avaMapJS.map.zoomToExtent(feat.feature.geometry.getBounds(), closest = true);
        avaMapJS.map.zoomToScale(100000);

        parent.avaIFaceJS.pwl_func.updateParameters({
            "data": feat.feature.attributes
        });
        parent.avaIFaceJS.pwl_func.update();
    },

    setMarkerExtent: function(mrkKM, mrkRiver) {
        avaMapJS.pwl_func.HLFeat.unselectAll();
        for (var f = 0; f < avaMapJS.pwl_func.kml.features.length; f++) {
            if ((lRiver.key == avaMapJS.pwl_func.kml.features[f].attributes.waterway || lRiver.key == avaMapJS.pwl_func.kml.features[f].attributes.waterway) && avaMapJS.pwl_func.kml.features[f].attributes.KM == mrkKM) {
                avaMapJS.pwl_func.HLFeat.select(avaMapJS.pwl_func.kml.features[f]);
                break;
            }
        }
    },

    // setExtents: Using the name of provided Waterways selector, draw extents from 'locationExtents' dict.
    setExtents: function(river) {
        if (!river) {
            return;
        }
        avaMapJS.pwl_func.refreshMarkers(river);
        var obj = avaMapJS.pwl_func.curRiver.obj.Coords;
        try {
            avaMapJS.map.zoomToExtent(new OpenLayers.Bounds(obj.Lon.min, obj.Lat.min, obj.Lon.max, obj.Lat.max));
        } catch (err) {}
    }
};
//# sourceURL=pwl_map_func.js