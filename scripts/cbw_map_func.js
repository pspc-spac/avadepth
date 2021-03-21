/**
 * Created by wsiddall on 09/03/2021
 */
let debug = false;
let hostname = document.URL.split("/")[2].split(":")[0] === "localhost" ? "localhost:8080" : "ava-proto.com"
let avadepthSFE = `https://${hostname}/avadepthserver/services/ows/wmts/avadepth`;
let SFETileFormat = "default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png";
let tl = new OpenLayers.LonLat(-2.0037508342789244E7, 2.0037508342789244E7);
let matrixIds = [
    {
        identifier: 0,
        scaleDenominator: 5.590822640287178e8,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 1,
        scaleDenominator: 2.795411320143589E8,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 2,
        scaleDenominator: 1.397705660071794E8,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 3,
        scaleDenominator: 6.988528300358972E7,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 4,
        scaleDenominator: 3.494264150179486E7,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 5,
        scaleDenominator: 1.747132075089743E7,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 6,
        scaleDenominator: 8735660.375448715,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 7,
        scaleDenominator: 4367830.187724357,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 8,
        scaleDenominator: 2183915.093862179,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 9,
        scaleDenominator: 1091957.546931089,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 10,
        scaleDenominator: 545978.7734655447,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 11,
        scaleDenominator: 272989.3867327723,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 12,
        scaleDenominator: 136494.6933663862,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 13,
        scaleDenominator: 68247.34668319309,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 14,
        scaleDenominator: 34123.67334159654,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 15,
        scaleDenominator: 17061.83667079827,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 16,
        scaleDenominator: 8530.918335399136,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 17,
        scaleDenominator: 4265.459167699568,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
    {
        identifier: 18,
        scaleDenominator: 2132.729583849784,
        topLeftCorner: tl,
        tileWidth: 256,
        tileHeight: 256
    },
]

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
                        url: `${avadepthSFE}/1.0.0/Outline.Fraser_Outline_Cells/${SFETileFormat}`
                    }),
                    channel_outline: format_cap.createLayer(capabilities, {
                        layer: "Outline.Fraser_Outline_Channel",
                        name: "Channel",
                        matrixSet: "GoogleMapsCompatible",
                        format: "image/png",
                        isBaseLayer: false,
                        requestEncoding: 'REST',
                        url: `${avadepthSFE}/1.0.0/Outline.Fraser_Outline_Channel/${SFETileFormat}`
                    })
                }
                avaMapJS.cbw_func.wmts_layers.difference.setVisibility(false);
                avaMapJS.cbw_func.wmts_layers.conformance.setVisibility(false);
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

    changeSurface: function(evt){
        let layerName = evt.target.value;
        if(layerName === avaMapJS.cbw_func.currentSurface)return;
        avaMapJS.cbw_func.wmts_layers[avaMapJS.cbw_func.currentSurface].setVisibility(false);
        avaMapJS.cbw_func.currentSurface = layerName;
        avaMapJS.cbw_func.wmts_layers[avaMapJS.cbw_func.currentSurface].setVisibility(true);
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