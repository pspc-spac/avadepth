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

//Channel Infill & Scour Analysis Function

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
                var sideNavTitleString = (window.location.href.indexOf("fra") > -1) ? "Aller à" : "Navigate To";

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