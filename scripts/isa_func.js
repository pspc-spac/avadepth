/**
 * Created by wsiddall on 26/08/2014.
 * Maintained by seor since 02/10/2015.
 */
var debug = false;
var locException = [];

/*** Interface functions ***/
if (!(typeof avaIFaceJS === 'undefined')) {

    avaIFaceJS.isa_func = {
        init: function() {

            locException.push({ riverCode: "FSD",
                                re: /Fraser\sSurrey\sDocks/});

            // Colour and resize map extents when waterway field changes
            $('#isa_waterway').change(function() {
                avaIFaceJS.mapJS.isa_func.setExtents($(this).val());
                return $('#map').css("min-height", "400px");
            });

            // Colour Tiles when location field changes
            $('#location').change(function() {
                return avaIFaceJS.mapJS.isa_func.refreshLocation($(this).val());
            });
            //document.getElementById('pBarContainer').style.display = 'none'; 
            document.getElementById('submit').style.display = 'none'; 

        },
        update: function(tileName) {
            $.getJSON(getAPI('/api3/isa/' + tileName + '.json','api3/isa/' + tileName + '.json'), function(data){
                console.log(data);
                var ISAs = data.ISAs;
                avaIFaceJS.reportWindow.addTitle("Search Results", "", "");
                avaIFaceJS.isa_func.tableReport || (avaIFaceJS.isa_func.tableReport = $('#isas').DataTable({
                    "paging": false,
                    "ordering": false,
                    "searching": false,
                    "info": false,
                }));

                avaIFaceJS.isa_func.tableReport.clear();
                $('#isas tbody tr').remove();

                $.each(ISAs, function() {
                    avaIFaceJS.isa_func.tableReport.row.add([
                        "<a href='https://avadepth.ccg-gcc.gc.ca/Data/" +
                            "channel_infill_pdfs/" +
                            this.Filename + "' target='_blank'>" +
                            this.Filename + "</a>",
                        this.Year
                    ]);
                });
                    
                avaIFaceJS.isa_func.tableReport.draw();
                avaIFaceJS.sideNavPanel.reset();

                var refMapString = (window.location.href.indexOf("fra") > -1) ? "Carte Physique" : "Reference Map";
                var repHeaderString = (window.location.href.indexOf("fra") > -1) ? "Top of Report" : "Top of Report";
                var sideNavTitleString = (window.location.href.indexOf("fra") > -1) ? "Navigate To" : "Navigate To";

                avaIFaceJS.sideNavPanel.addTitle(sideNavTitleString);
                avaIFaceJS.sideNavPanel.addLink(refMapString,"#ava_map_ttl");
                avaIFaceJS.sideNavPanel.addLink(repHeaderString,"#reportTitleDiv");
                avaIFaceJS.sideNavPanel.display();

                avaIFaceJS.reportWindow.show();

                if (avaIFaceJS.isa_func.tableReport){
                    // (1) Place user page in the survey search results, as per client request - Last Updated 2018-09-28  
                    var elemLocation = $("#reportTitleDiv").offset();
                    window.scrollTo(elemLocation.left,elemLocation.top);
                }
            });
        }
    };
} else if (!(typeof avaMapJS === 'undefined')) {
    /*** Map Interaction functions ***/
    avaMapJS.isa_func = {
        // init function for loading custom tile file and other events
        init: function() {
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
            avaMapJS.isa_func.HLFeat = new OpenLayers.Control.SelectFeature(avaMapJS.isa_func.kml, {
                hover:true,
                highlightOnly:true,
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
            avaMapJS.isa_func.setExtents();
        },

        /*** Page-specific functions ***/
        // setExtents: Using the name of provided Waterways selector, draw extents from 'locationExtents' dict.
        setExtents: function() {
            try {
                avaMapJS.map.zoomToExtent(new OpenLayers.Bounds(-13730138, 6282692,-13677350, 6314133));
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

            var obj = incl_ava_defs.locDefs[waterway]['Sections'][channel].Coords;
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

        tileUnselect: function(tile) {
            if (tile.feature.data.location == avaMapJS.isa_func.curLocation) {
                avaMapJS.isa_func.curLocation = "";
                avaMapJS.isa_func.curWaterway = "";
            }
        },

        // tileSelect: callBack function for tile selection from the map interface
        tileSelect: function(tile) {
            var tileName = tile.feature.data.name;
            if (debug) {
                console.log("void tileSelect(): " + tileName);
                console.log("void tileSelect(): " + tile.feature.data);
                console.log(tile.feature.data);
            }
            if (tileName.indexOf('/') >= 0) {
                parent.window.open("http://www2.pac.dfo-mpo.gc.ca" + tileName, '_blank');
            } else {
                parent.avaIFaceJS.isa_func.update(tileName); // refresh page from updated parameters
            }
        },

        // refreshTiles: function to refresh the draw of the tile layer using the new selected form settings
        refreshTiles: function(channel, location) {
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
        refreshLocation : function(location) {
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
        getFeaturesByLocation : function(location) {
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
        checkRemainingFeaturesOnLayer : function() {
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
            return temp && (feat.data.waterway == avaMapJS.isa_func.curWaterway)
        }
    };
} else if (!(typeof avaMapDetJS === 'undefined')) {
    avaMapDetJS.isa_func = {
        init: function() {}
    };
};

function assert(condition, message) {
    if(!condition) {
        message = message || "Assertion failed.";
        if (typeof Error !== "undefined") throw new Error(message);
        throw message;
    }
}

//# sourceURL=isa_func.js