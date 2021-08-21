/**
 * Created by wsiddall on 09/03/2021
 */
let debug = false;
let hostname = document.URL.split("/")[2].split(":")[0] === "localhost" ? "localhost:8080" : "ava-proto.com"
let avadepthSFE = `https://${hostname}/avadepthserver/services/ows/wmts/avadepth`;
let SFETileFormat = "default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png";

let layerMap = {
    channel: ["channel_cells", "channel_outline"],
    soundings: ["soundings"]
}

avaMapJS.cbw_func = {
    init: function() {
        let format_cap = new OpenLayers.Format.WMTSCapabilities({
            yx: {
                "urn:ogc:def:crs:EPSG::3857": false
            }
        })
        avaMapJS.cbw_func.wmts_layers = {}
        OpenLayers.Request.GET({
            url: avadepthSFE,
            params: {
                service: "WMTS",
                version: "1.0.0",
                request: "GetCapabilities"
            },
            success: function(request){
                let doc = request.responseXML;
                if (!doc || !doc.documentElement){
                    doc = request.responseText;
                }
                let capabilities = format_cap.read(doc);
                avaMapJS.cbw_func.wmts_layers = {
                    combined: format_cap.createLayer(capabilities, {
                        layer: "BathyAnalysis.Combined",
                        name: "Combined",
                        matrixSet: "GoogleMapsCompatible",
                        format: "image/png",
                        isBaseLayer: false,
                        requestEncoding: 'REST',
                        url: `${avadepthSFE}/1.0.0/BathyAnalysis.Combined/${SFETileFormat}`
                    }),
                    conformance: format_cap.createLayer(capabilities, {
                        layer: "Conformance.Conformance",
                        name: "Combined",
                        matrixSet: "GoogleMapsCompatible",
                        format: "image/png",
                        isBaseLayer: false,
                        requestEncoding: 'REST',
                        url: `${avadepthSFE}/1.0.0/Conformance.Conformance/${SFETileFormat}`
                    }),
                    difference: format_cap.createLayer(capabilities, {
                        layer: "BathyDifference.Difference",
                        name: "Combined",
                        matrixSet: "GoogleMapsCompatible",
                        format: "image/png",
                        isBaseLayer: false,
                        requestEncoding: 'REST',
                        url: `${avadepthSFE}/1.0.0/BathyDifference.Difference/${SFETileFormat}`
                    }),
                    soundings: format_cap.createLayer(capabilities, {
                        layer: "Soundings.Depths",
                        name: "Combined",
                        matrixSet: "GoogleMapsCompatible",
                        format: "image/png",
                        isBaseLayer: false,
                        requestEncoding: 'REST',
                        url: `${avadepthSFE}/1.0.0/Soundings.Depths/${SFETileFormat}`
                    }),
                    channel_cells: format_cap.createLayer(capabilities, {
                        layer: "Outline.Fraser_Outline_Cells",
                        name: "Channel",
                        matrixSet: "GoogleMapsCompatible",
                        format: "image/png",
                        isBaseLayer: false,
                        requestEncoding: 'REST',
                        url: `${avadepthSFE}/1.0.0/FRSA_Channel_Cells.FRSA_Outline_Cells/${SFETileFormat}`
                    }),
                    channel_outline: format_cap.createLayer(capabilities, {
                        layer: "Outline.Fraser_Outline_Channel",
                        name: "Channel",
                        matrixSet: "GoogleMapsCompatible",
                        format: "image/png",
                        isBaseLayer: false,
                        requestEncoding: 'REST',
                        url: `${avadepthSFE}/1.0.0/FRSA_Channel_Outline.FRSA_Outline_Channel/${SFETileFormat}`
                    })
                }
                avaMapJS.cbw_func.wmts_layers.difference.setVisibility(false);
                avaMapJS.cbw_func.wmts_layers.conformance.setVisibility(false);
                avaMapJS.cbw_func.wmts_layers.channel_cells.setVisibility(false);
                avaMapJS.map.addLayers([
                    avaMapJS.cbw_func.wmts_layers.combined,
                    avaMapJS.cbw_func.wmts_layers.difference,
                    avaMapJS.cbw_func.wmts_layers.conformance,
                    avaMapJS.cbw_func.wmts_layers.channel_cells,
                    avaMapJS.cbw_func.wmts_layers.channel_outline,
                    avaMapJS.cbw_func.wmts_layers.soundings
                ]);
            },
            failure: function() {
                alert("Trouble getting capabilities doc");
                OpenLayers.Console.error.apply(OpenLayers.Console, arguments);
            }
        })
        avaMapJS.cbw_func.setExtents();
        avaMapJS.cbw_func.currentSurface = "combined";
        // addWatch("chkLyrChannel", avaMapJS.cbw_func.triggerLayer);
    },

    triggerLayer: function(evt) {
        let layerName = evt.target.value;
        let toggleValue = evt.target.checked;
        if(layerName === "surface"){
            avaMapJS.cbw_func.wmts_layers[avaMapJS.cbw_func.currentSurface].setVisibility(toggleValue);
        } else {
            for (let lyrName of layerMap[layerName]) {
                avaMapJS.cbw_func.wmts_layers[lyrName].setVisibility(toggleValue);
            }
        }
    },

    changeSurface: function(layerName){
        if(layerName === avaMapJS.cbw_func.currentSurface)return;
        avaMapJS.cbw_func.wmts_layers[layerName].setVisibility(true);
        avaMapJS.cbw_func.wmts_layers[avaMapJS.cbw_func.currentSurface].setVisibility(false);
        avaMapJS.cbw_func.currentSurface = layerName;
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
}