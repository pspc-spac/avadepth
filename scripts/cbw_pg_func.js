let elementIds = [
    "chkLyrSounding",
    "chkLyrSurface"
]
let channelIds = [
    "chkLyrChannel",
    "chkLyrCells",
]

function addWatch() {
    let clearcheck = setInterval(repeatCheck, 50);
    function repeatCheck(){
        if(avaIFaceJS.mapJS.cbw_func !== undefined){
            clearInterval(clearcheck);
            document.getElementById("ddRiverName").addEventListener("change", avaIFaceJS.cbw_func.setRiver);
            for(let lyr of elementIds){
                let el = document.getElementById(lyr);
                el.addEventListener('click', avaIFaceJS.mapJS.cbw_func.triggerLayer, false);
            }
            avaIFaceJS.mapJS.map.events.register("zoomend", this, avaIFaceJS.cbw_func.toggleChannelCells);
            for(let lyr of channelIds){
                document.getElementById(lyr).addEventListener("click", avaIFaceJS.cbw_func.toggleChannelCells, false);
            }
            for(let el of document.getElementsByName('surface')){
                el.addEventListener('click', avaIFaceJS.cbw_func.changeSurface, false);
            }
            for(let el of document.getElementsByName("surfDetails")){
                el.hidden = true;
            }
            document.getElementById('surf_combined').hidden = false;
        }
    }
}


function parseDateString(input_date){
    return new Date(
        parseInt(input_date.slice(0, 4)),
        parseInt(input_date.slice(4, 6)) - 1,
        parseInt(input_date.slice(6, 8))
    )
}

function toDateString(input_date){
    return input_date.getDate().toString()
        .padStart(2, "0") + "-" + (input_date.getMonth() + 1).toString()
        .padStart(2, "0") + "-" + input_date.getFullYear().toString();
}

avaIFaceJS.cbw_func = {
    images:[],
    selected_zone:1,
    riverUpdates:{},
    surfaceLayers: [
        {
            "name": "combined",
            legend: {
                en: '<table><tbody><tr><th>Rating</th><th>Colour</th></tr>' +
                    '<tr><td> -20 - -1.5 (or >-1.5)</td><td><div class="surface_legend" style="background-color:#C89600"></div></td></tr>' +
                    '<tr><td>-1.5 - 0.5</td><td><div class="surface_legend" style="background-color:#DAD25F"></div></td></tr>' +
                    '<tr><td>0.5 -2.5</td><td><div class="surface_legend" style="background-color:#00FFFF"></div></td></tr>' +
                    '<tr><td>2.5 - 4.5</td><td><div class="surface_legend" style="background-color:#00D5E4"></div></td></tr>' +
                    '<tr><td>4.5 - 6.5</td><td><div class="surface_legend" style="background-color:#00AAE1"></div></td></tr>' +
                    '<tr><td>6.5 - 12.5</td><td><div class="surface_legend" style="background-color:#0080E1"></div></td></tr>' +
                    '<tr><td>12.5 - 20.5</td><td><div class="surface_legend" style="background-color:#0024BF"></div></td></tr>' +
                    '<tr><td>20.0 - 20.5 (or <20.5)</td><td><div class="surface_legend" style="background-color:#00007F"></div></td></tr>' +
                    '</tbody></table>',
                fr: '<table><tbody><tr><th>profondeur</th><th>couleur</th></tr>' +
                    '<tr><td> -20 - -1.5 (ou >-1.5)</td><td><div class="surface_legend" style="background-color:#C89600"></div></td></tr>' +
                    '<tr><td>-1.5 - 0.5</td><td><div class="surface_legend" style="background-color:#DAD25F"></div></td></tr>' +
                    '<tr><td>0.5 -2.5</td><td><div class="surface_legend" style="background-color:#00FFFF"></div></td></tr>' +
                    '<tr><td>2.5 - 4.5</td><td><div class="surface_legend" style="background-color:#00D5E4"></div></td></tr>' +
                    '<tr><td>4.5 - 6.5</td><td><div class="surface_legend" style="background-color:#00AAE1"></div></td></tr>' +
                    '<tr><td>6.5 - 12.5</td><td><div class="surface_legend" style="background-color:#0080E1"></div></td></tr>' +
                    '<tr><td>12.5 - 20.5</td><td><div class="surface_legend" style="background-color:#0024BF"></div></td></tr>' +
                    '<tr><td>20.0 - 20.5 (ou <20.5)</td><td><div class="surface_legend" style="background-color:#00007F"></div></td></tr>' +
                    '</tbody></table>',
            }
        },
        {
            "name": "conformance",
            legend: {
                en: '<table><tbody><tr><th>Rating</th><th>Colour</th></tr>' +
                    '<tr><td>-20 - -1</td><td><div class="surface_legend" style="background-color:#ff9632"></div></td></tr>' +
                    '<tr><td>-1 - -0.5</td><td><div class="surface_legend" style="background-color:#ffc832"></div></td></tr>' +
                    '<tr><td>-0.5 - 0</td><td><div class="surface_legend" style="background-color:#fff56e"></div></td></tr>' +
                    '<tr><td>0 - 0.5</td><td><div class="surface_legend" style="background-color:#82e6ff"></div></td></tr>' +
                    '<tr><td>0.5 - 1</td><td><div class="surface_legend" style="background-color:#5ac8fa"></div></td></tr>' +
                    '<tr><td>1 - 1.5</td><td><div class="surface_legend" style="background-color:#324bff"></div></td></tr>' +
                    '<tr><td>1 - 20</td><td><div class="surface_legend" style="background-color:#969696"></div></td></tr>' +
                    '</tbody></table>',
                fr: '<table><tbody><tr><th>valeur</th><th>couleur</th></tr>' +
                    '<tr><td>-20 - -1</td><td><div class="surface_legend" style="background-color:#ff9632"></div></td></tr>' +
                    '<tr><td>-1 - -0.5</td><td><div class="surface_legend" style="background-color:#ffc832"></div></td></tr>' +
                    '<tr><td>-0.5 - 0</td><td><div class="surface_legend" style="background-color:#fff56e"></div></td></tr>' +
                    '<tr><td>0 - 0.5</td><td><div class="surface_legend" style="background-color:#82e6ff"></div></td></tr>' +
                    '<tr><td>0.5 - 1</td><td><div class="surface_legend" style="background-color:#5ac8fa"></div></td></tr>' +
                    '<tr><td>1 - 1.5</td><td><div class="surface_legend" style="background-color:#324bff"></div></td></tr>' +
                    '<tr><td>1 - 20</td><td><div class="surface_legend" style="background-color:#969696"></div></td></tr>' +
                    '</tbody></table>'
            }
        },
        {
            "name": "difference",
            legend: {
                en: '<table><tbody><tr><th>Rating</th><th>Colour</th></tr>' +
                    '<tr><td>-20 - -0.8</td><td><div class="surface_legend" style="background-color:#ff0000"></div></td></tr>' +
                    '<tr><td>-0.8 - -0.6</td><td><div class="surface_legend" style="background-color:#008040"></div></td></tr>' +
                    '<tr><td>-0.6 - -0.4</td><td><div class="surface_legend" style="background-color:#808040"></div></td></tr>' +
                    '<tr><td>-0.4 - -0.2</td><td><div class="surface_legend" style="background-color:#ff8000"></div></td></tr>' +
                    '<tr><td>-0.2 - -0.1</td><td><div class="surface_legend" style="background-color:#e8e800"></div></td></tr>' +
                    '<tr><td>-0.1 - 0.1</td><td><div class="surface_legend" style="background-color:#c0c0c0"></div></td></tr>' +
                    '<tr><td>0.1 - 0.2</td><td><div class="surface_legend" style="background-color:#00ffff"></div></td></tr>' +
                    '<tr><td>0.2 - 0.4</td><td><div class="surface_legend" style="background-color:#0080ff"></div></td></tr>' +
                    '<tr><td>0.4 - 0.6</td><td><div class="surface_legend" style="background-color:#0000ff"></div></td></tr>' +
                    '<tr><td>0.6 - 0.8</td><td><div class="surface_legend" style="background-color:#ff00ff"></div></td></tr>' +
                    '<tr><td>0.8 - 20</td><td><div class="surface_legend" style="background-color:#8000ff"></div></td></tr>' +
                    '</tbody></table>',
                fr: '<table><tbody><tr><th>valeur</th><th>couleur</th></tr>' +
                    '<tr><td>-20 - -0.8</td><td><div class="surface_legend" style="background-color:#ff0000"></div></td></tr>' +
                    '<tr><td>-0.8 - -0.6</td><td><div class="surface_legend" style="background-color:#008040"></div></td></tr>' +
                    '<tr><td>-0.6 - -0.4</td><td><div class="surface_legend" style="background-color:#808040"></div></td></tr>' +
                    '<tr><td>-0.4 - -0.2</td><td><div class="surface_legend" style="background-color:#ff8000"></div></td></tr>' +
                    '<tr><td>-0.2 - -0.1</td><td><div class="surface_legend" style="background-color:#e8e800"></div></td></tr>' +
                    '<tr><td>-0.1 - 0.1</td><td><div class="surface_legend" style="background-color:#c0c0c0"></div></td></tr>' +
                    '<tr><td>0.1 - 0.2</td><td><div class="surface_legend" style="background-color:#00ffff"></div></td></tr>' +
                    '<tr><td>0.2 - 0.4</td><td><div class="surface_legend" style="background-color:#0080ff"></div></td></tr>' +
                    '<tr><td>0.4 - 0.6</td><td><div class="surface_legend" style="background-color:#0000ff"></div></td></tr>' +
                    '<tr><td>0.6 - 0.8</td><td><div class="surface_legend" style="background-color:#ff00ff"></div></td></tr>' +
                    '<tr><td>0.8 - 20</td><td><div class="surface_legend" style="background-color:#8000ff"></div></td></tr>' +
                    '</tbody></table>'
            }
        },
        {
            "name": "isa",
            legend: {
                en: '',
                fr: ''
            }
        }
    ],

    toggleChannelCells: function(evt) {
        let wmtsLayers = avaIFaceJS.mapJS.cbw_func.wmts_layers;
        if (wmtsLayers.channel_outline === undefined) return;
        let currentScale = avaIFaceJS.mapJS.map.getZoom();
        let lowScale = currentScale > 13;
        let channels = document.getElementById("chkLyrChannel");
        let cells = document.getElementById("chkLyrCells");
        cells.disabled = !lowScale;
        wmtsLayers.channel_outline.setVisibility(channels.checked && (!cells.checked || !lowScale));
        wmtsLayers.channel_cells.setVisibility(channels.checked && cells.checked && lowScale);
    },

    changeSurface: function(evt) {
        let layerName = evt.target.value;
        if (layerName === 'isa') {
            document.getElementById("surf_" + avaIFaceJS.mapJS.cbw_func.currentSurface).hidden = true;
            document.getElementById("surfLegend").hidden = true;
            document.getElementById("chkLyrChannel").checked = false;
            avaIFaceJS.mapJS.cbw_func.changeSurface(layerName);
            avaIFaceJS.isa_func.init();
        } else {
            document.getElementById("surf_" + layerName).hidden = false;
            document.getElementById("surfLegend").hidden = false;
            document.getElementById("surf_" + avaIFaceJS.mapJS.cbw_func.currentSurface).hidden = true;
            let legend = avaIFaceJS.cbw_func.surfaceLayers.find(r => r.name === layerName).legend[page_lang];
            document.getElementById("surfLegend").innerHTML = legend;
            document.getElementById("chkLyrChannel").checked = true;
            avaIFaceJS.mapJS.cbw_func.changeSurface(layerName);
        }
    },

    setOpacity: function(ev) {
        let newOpacity = Math.max(10, ev.target.value) / 100;
        avaIFaceJS.mapJS.cbw_func.wmts_layers.conformance&&avaIFaceJS.mapJS.cbw_func.wmts_layers.conformance.setOpacity(newOpacity);
        avaIFaceJS.mapJS.cbw_func.wmts_layers.combined&&avaIFaceJS.mapJS.cbw_func.wmts_layers.combined.setOpacity(newOpacity);
        avaIFaceJS.mapJS.cbw_func.wmts_layers.difference&&avaIFaceJS.mapJS.cbw_func.wmts_layers.difference.setOpacity(newOpacity);
    },

    init: function() {
        addWatch();
        document.getElementById("surfTrans").addEventListener("input", avaIFaceJS.cbw_func.setOpacity);
        document.getElementById("surfLegend").innerHTML = avaIFaceJS.cbw_func.surfaceLayers.find(r => r.name === "combined").legend[page_lang];
        fetch("https://ava-proto.com/river_updates.json", {method: "GET"})
            .then(r => r.json())
            .then(r => {
                avaIFaceJS.cbw_func.riverUpdates = r;
                avaIFaceJS.cbw_func.setRiver({target: {value: "FRSA"}});
            });
    },

    setRiver: function(evt){
        const river = evt.target.value;
        let armDates = avaIFaceJS.cbw_func.riverUpdates[river];
        for(let el of document.getElementsByName("srfDateCur")){
            el.textContent = armDates?toDateString(parseDateString(armDates.current_date)):"-";
        }
        for(let el of document.getElementsByName("srfDatePrev")){
            el.textContent = armDates?toDateString(parseDateString(armDates.compare_date)):"-";
        }
        avaIFaceJS.mapJS.cbw_func.setRiver(river);
    }
};

// ISA Page Function
var debug = false;
var locException = [];
avaIFaceJS.isa_func = {
    /** @propery {string} location - Location of the selected tile */
    location: null,
    init: function () {
        locException.push({
            riverCode: "FSD",
            re: /Fraser\sSurrey\sDocks/
        });

        // Colour and resize map extents when waterway field changes
        $('#isa_waterway').change(function () {
            avaIFaceJS.mapJS.isa_func.setExtents($(this).val());
            return $('#map').css("min-height", "400px");
        });

        // Colour Tiles when location field changes
        $('#location').change(function () {
            return avaIFaceJS.mapJS.isa_func.refreshLocation($(this).val());
        });
    },
    update: function (tileName) {
        $.getJSON(
            getAPI(
                'api2/isas?location=' + tileName,
                '/api/isa/' + tileName + '.json'))
            .then(function (ISAs) {
                console.log(ISAs);
                avaIFaceJS.reportWindow.addTitle("Search Results", "", "");
                avaIFaceJS.isa_func.tableReport || (avaIFaceJS.isa_func.tableReport = $('#report_tbl').DataTable({
                    "paging": false,
                    "ordering": false,
                    "searching": false,
                    "info": false,
                }));

                avaIFaceJS.reportWindow.addTitle("Search Results for", avaIFaceJS.isa_func.location, "");
                avaIFaceJS.isa_func.tableReport.clear();
                $('#report_tbl tbody tr').remove();

                $.each(ISAs, function () {
                    avaIFaceJS.isa_func.tableReport.row.add([
                        "<a href='https://avadepth.ccg-gcc.gc.ca/Data/" +
                        "channel_infill_pdfs/" +
                        this.Filename + "' target='_blank'>" +
                        this.Filename + "</a>",
                        this.Year
                    ]);
                });
                avaIFaceJS.isa_func.tableReport.draw();
                $('#report_tbl tbody tr td').each(function () {
                    $(this).css('text-align', 'center');
                });

                // (3) Add a button that allows the user to jump back to the map (a href=`${window.href.location} + #map`); - Last Update 2018-09-28
                avaIFaceJS.sideNavPanel.reset();

                var refMapString = (window.location.href.indexOf("fra") > -1) ? "Carte Physique" : "Reference Map";
                var repHeaderString = (window.location.href.indexOf("fra") > -1) ? "Haut du rapport" : "Top of Report";
                var sideNavTitleString = (window.location.href.indexOf("fra") > -1) ? "Aller à" : "Navigate To";

                avaIFaceJS.sideNavPanel.addTitle(sideNavTitleString);
                avaIFaceJS.sideNavPanel.addLink(refMapString, "#ava_map_ttl");
                avaIFaceJS.sideNavPanel.addLink(repHeaderString, "#reportTitleDiv");
                avaIFaceJS.sideNavPanel.display();

                avaIFaceJS.reportWindow.show();

                if (avaIFaceJS.isa_func.tableReport) {
                    // (1) Place user page in the survey search results, as per client request - Last Updated 2018-09-28  
                    var elemLocation = $("#reportTitleDiv").offset();
                    window.scrollTo(elemLocation.left, elemLocation.top);
                }
            });
    }
};
//# sourceURL=cbw_pg_func.js