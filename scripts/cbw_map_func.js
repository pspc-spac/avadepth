/**
 * Created by wsiddall on 09/03/2021
 */

let debug = false;
let hostname = document.URL.split("/")[2].split(":")[0] === "localhost" ? "localhost:8080" : "ava-proto.com"
let avadepthSFE = `https://${hostname}/avadepthserver/services/ows/wmts/avadepth`;
let SFETileFormat = "default/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png";

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
        extents: new OpenLayers.Bounds(-13730138, 6282692,-13677350, 6314133)
    }],
    ["PIRI", {
        layers: ["combined", "conformance", "soundings"],
        extents: new OpenLayers.Bounds(-13730138, 6282692,-13677350, 6314133)
    }],
]);

function applyRiverName(template, riverName) {
    return template.replace(/#/g, riverName);
}

avaMapJS.cbw_func = {
    init: function() {
        avaMapJS.cbw_func.wmts_layers = {};
        avaMapJS.cbw_func.current_river = "$";
        avaMapJS.cbw_func.loadLayers("FRSA");
        // addWatch("chkLyrChannel", avaMapJS.cbw_func.triggerLayer);
    },

    loadLayers: function(river) {
        let current_layers = avaMapJS.map.layers.filter(x => x.layer&&x.layer.startsWith(avaMapJS.cbw_func.current_river));
        for(let lyr of current_layers){
            avaMapJS.map.removeLayer(lyr);
        }
        let format_cap = new OpenLayers.Format.WMTSCapabilities({
            yx: {
                "urn:ogc:def:crs:EPSG::3857": false
            }
        });
        let layers = RiverSections.get(river).layers
            .map(name => [name, LayerNames.get(name).title, applyRiverName(LayerNames.get(name).name, river)]);
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
                avaMapJS.cbw_func.wmts_layers = {};
                for(let lyr of layers){
                    avaMapJS.cbw_func.wmts_layers[lyr[0]] = format_cap.createLayer(capabilities, {
                        layer: lyr[2],
                        name: lyr[1],
                        matrixSet: "GoogleMapsCompatible",
                        format: "image/png",
                        isBaseLayer: false,
                        requestEncoding: 'REST',
                        url: `${avadepthSFE}/1.0.0/${lyr[2]}/${SFETileFormat}`
                    });
                }
                avaMapJS.cbw_func.wmts_layers.difference&&avaMapJS.cbw_func.wmts_layers.difference.setVisibility(false);
                avaMapJS.cbw_func.wmts_layers.conformance&&avaMapJS.cbw_func.wmts_layers.conformance.setVisibility(false);
                avaMapJS.cbw_func.wmts_layers.channel_cells&&avaMapJS.cbw_func.wmts_layers.channel_cells.setVisibility(false);
                avaMapJS.map.addLayers(Object.keys(avaMapJS.cbw_func.wmts_layers).map(x => avaMapJS.cbw_func.wmts_layers[x]));
            },
            failure: function() {
                alert("Trouble getting capabilities doc");
                OpenLayers.Console.error.apply(OpenLayers.Console, arguments);
            }
        })
        avaMapJS.cbw_func.current_river = river;
        avaMapJS.cbw_func.setExtents();
        avaMapJS.cbw_func.currentSurface = "combined";
    },

    setRiver: function(river) {
        avaMapJS.cbw_func.loadLayers(river);
    },

    triggerLayer: function(evt) {
        let layerName = evt.target.value;
        let toggleValue = evt.target.checked;
        if(layerName === "surface"){
            avaMapJS.cbw_func.wmts_layers[avaMapJS.cbw_func.currentSurface].setVisibility(toggleValue);
        } else {
            for (let lyrName of layerMap.get(layerName)) {
                avaMapJS.cbw_func.wmts_layers[lyrName].setVisibility(toggleValue);
            }
        }
    },

    changeSurface: function (layerName) {
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

//Channel Infill & Scour Analysis Function

//var debug = false;
//var locException = [];

/*** Interface functions ***/
avaMapJS.isa_func = {
    /** @propery {string} location - Location of the selected tile */
    location: null,
    init: function () {
        locException.push({
            riverCode: "FSD",
            re: /Fraser\sSurrey\sDocks/
        });

        // Colour and resize map extents when waterway field changes
        $('#isa_waterway').change(function () {
            avaMapJS.mapJS.isa_func.setExtents($(this).val());
            return $('#map').css("min-height", "400px");
        });

        // Colour Tiles when location field changes
        $('#location').change(function () {
            return avaMapJS.mapJS.isa_func.refreshLocation($(this).val());
        });
        //document.getElementById('pBarContainer').style.display = 'none'; 
        document.getElementById('submit').style.display = 'none';

    },
    update: function (tileName) {
        $.getJSON(
            getAPI(
                'api2/isas?location=' + tileName,
                '/api/isa/' + tileName + '.json'))
            .then(function (ISAs) {
                console.log(ISAs);
                avaMapJS.reportWindow.addTitle("Search Results", "", "");
                avaMapJS.isa_func.tableReport || (avaMapJS.isa_func.tableReport = $('#isas').DataTable({
                    "paging": false,
                    "ordering": false,
                    "searching": false,
                    "info": false,
                }));

                avaMapJS.reportWindow.addTitle("Search Results for", avaMapJS.isa_func.location, "");
                avaMapJS.isa_func.tableReport.clear();
                $('#isas tbody tr').remove();

                $.each(ISAs, function () {
                    avaMapJS.isa_func.tableReport.row.add([
                        "<a href='https://avadepth.ccg-gcc.gc.ca/Data/" +
                        "channel_infill_pdfs/" +
                        this.Filename + "' target='_blank'>" +
                        this.Filename + "</a>",
                        this.Year
                    ]);
                });

                avaMapJS.isa_func.tableReport.draw();
                avaMapJS.sideNavPanel.reset();

                var refMapString = (window.location.href.indexOf("fra") > -1) ? "Carte Physique" : "Reference Map";
                var repHeaderString = (window.location.href.indexOf("fra") > -1) ? "Haut du rapport" : "Top of Report";
                var sideNavTitleString = (window.location.href.indexOf("fra") > -1) ? "Aller �" : "Navigate To";

                avaMapJS.sideNavPanel.addTitle(sideNavTitleString);
                avaMapJS.sideNavPanel.addLink(refMapString, "#ava_map_ttl");
                avaMapJS.sideNavPanel.addLink(repHeaderString, "#reportTitleDiv");
                avaMapJS.sideNavPanel.display();

                avaMapJS.reportWindow.show();

                if (avaMapJS.isa_func.tableReport) {
                    // (1) Place user page in the survey search results, as per client request - Last Updated 2018-09-28  
                    var elemLocation = $("#reportTitleDiv").offset();
                    window.scrollTo(elemLocation.left, elemLocation.top);
                }
            });
    }
};
//# sourceURL=cbw_map_func.js