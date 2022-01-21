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
    zoomOffset: 1,
    units: "m"
}

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
        console.log(layers);
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
            avaMapJS.map.zoomToExtent(RiverSections.get(avaMapJS.cbw_func.current_river).extents);
        } catch (err) {
            if (debug) console.log("void setExtents(): " + err);
        }
    },
}
