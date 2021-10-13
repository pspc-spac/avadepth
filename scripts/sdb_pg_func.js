/**
 * Created by wsiddall on 26/08/2014.
 * Maintained by seor since 02/10/2015.
 */
var debug = true;
var locException = [];

/*** Interface functions ***/
avaIFaceJS.sdb_func = {
    $channel: null,
    $location: null,
    $sdb_waterway: null,
    $submit: null,

    /**
     * Initializes sdb_func object. Sets $channel, $location and
     * $sdb_waterway jQuery objects. Sets event handlers for
     * waterway, channel and type dropdown event handlers. 
     */
    init: function() {
        $channel = $('#channel');
        $location = $('#location');
        $sdb_waterway = $('#sdb_waterway');
        $submit = $('#submit');

        $('#report_body').css({marginTop: '+=30px'});
        locException.push({ riverCode: "FSD",
                            re: /Fraser\sSurrey\sDocks/});

        avaIFaceJS.sdb_func.fillChannel(); // populate dropdowns on load

        /** Event Handlers **/
        // Load and fill channel drop down
        $sdb_waterway.change(function(){
            avaIFaceJS.setMapOpen(avaIFaceJS.MapState.Open);
            //avaIFaceJS.sdb_func.fillChannel();
            // avaIFaceJS.sdb_func.update();
        });

        // Load and fill location drop down
        // $('#channel').change(avaIFaceJS.sdb_func.fillLocation);

        // Colour and resize map extents when waterway field changes
        $sdb_waterway.change(function() {
            avaIFaceJS.mapJS.sdb_func.setExtents($sdb_waterway.val());
            avaIFaceJS.sdb_func.fillChannel();
            avaIFaceJS.sdb_func.fillLocation();
            if ($channel.val() !== "Select a channel") 
                avaIFaceJS.mapJS.sdb_func.setChannelExtents($sdb_waterway.val(), $channel.val());
            else
                avaIFaceJS.mapJS.sdb_func.setExtents($sdb_waterway.val());
                $submit.prop("disabled", "disabled");
            return $('#map').css("min-height", "400px");
        });

        // Colour and resize map, and fill location drop down when channel field changes
        $channel.change(function() {
            $("#sel_chan_opt").remove();
            if ($channel.val() !== "GLOBAL"){
                avaIFaceJS.mapJS.sdb_func.refreshLocation("");
                //avaIFaceJS.mapJS.sdb_func.refreshChannel($('#channel :selected').text());
                // console.profile("channel change event");
                avaIFaceJS.mapJS.sdb_func.setChannelExtents($sdb_waterway.val(), $channel.val()); // Broken?
                avaIFaceJS.sdb_func.fillLocation();
                // console.profileEnd();
                return $('#map').css("min-height", "400px");
            } else {
                avaIFaceJS.mapJS.sdb_func.setExtents($sdb_waterway.val());
                $submit.prop("disabled", "");
                return $('#map').css("min-height", "400px");
            }
        });

        $('#location').change(function() {
            $("#sel_loc_opt").remove();
            return $submit.prop("disabled", "");
        });

        $('#type').change(function() {
            avaIFaceJS.sdb_func.update();
        });

        // Submit form
        $submit.click(function() {
            avaIFaceJS.mapJS.sdb_func.refreshLocation($location.val());   // Colour map tile of location selected.
            return avaIFaceJS.sdb_func.update();
        });

        $submit.prop("disabled", "disabled");
    },

    // Load and fill channel drop down
    fillChannel: function() {
        $location.find('option').remove();
        $channel.find('option').remove();
        $channel.append('<option id=\'sel_chan_opt\'>Select a channel</option>');
        $.each(incl_ava_defs.locDefs[$sdb_waterway.val()].Sections, function() {
            return $channel.append("<option value='" + this.Form.Key + "'>" + this.Form.Title + "</option>");
        });
        return $channel.append('<option value=\'GLOBAL\'>Select All</option>');
    },

    // Load and fill location drop down
    fillLocation: function() {
        locationDropdownFilled = true;
        if($channel.val() == "Select All"){
            $location.find('option').remove();
        }
        if($channel.val() != "Select a channel"){
            var locations = incl_ava_defs.locDefs[$sdb_waterway.val()].Sections[$channel.val()].Locations;
            $location.find('option').remove();

            if (debug) {
                console.log("void fillLocation(): sdb_waterway=" + $sdb_waterway.val());
                console.log("void fillLocation(): channel=" + $channel.val());
            }

            if(locations.length !== 0){
                $location.append('<option id=\'sel_loc_opt\'>Select a location</option>');

                try {
                    $.each(locations, function() {
                        return $location.append("<option value='" + this.Name + "'>" + this.Name + "</option>");
                    });

                    $location.append('<option value=\'GLOBAL\'>Select All</option>');
                    $submit.prop("disabled", "disabled");
                } catch (err) {
                    if (debug) console.log("void fillLocation(): No location defined for channel " + $channel.val());
                    return;
                }
            } else {
                //enable submit;
                $submit.prop("disabled", "");
            }
        }
    },

    // process report content and update window
    update: function(tileName) {
        $('.spinner').show();
        if(debug) console.log("void update(tileName = " + tileName + ")");

        var header, wat, chann, location, type;
        wat = $sdb_waterway.find(':selected').text();
        chann = $channel.find(':selected').text();
        location = $location.find(':selected').text();
        type = $('#type :selected').text(); 

        var apiBase = "/api2/SurveyDrawings?";
        var apiParams = [];

        //if tile has been clicked on map, query all drawings under clicked tile
        if(tileName != undefined)
        {
            apiParams.push("Tile=", tileName);
            $submit.prop("disabled", "");
        }
        // if no channel selected, query all drawings under selected waterway
        else if(chann == "")
        {
            apiParams.push("River=", wat);
        } 
        // if the channel selected was a global channel, query all drawings under the waterway
        else if ($channel.find(':selected').val() == "GLOBAL"){
            apiParams.push("River=", wat);
        }
        // else, a regular channel has been selected
        else
        {
            var riverVal = $sdb_waterway.val();
            var channelVal = $channel.val();
            var locationVal = $location.val();
            var tile;
            var channelStruct = incl_ava_defs.locDefs[riverVal].Sections[channelVal];
            //if a location hasn't been selected, get all drawings listed under channel 
            if(location == "Select All" || location == "")
            {
                //if the channel has its own tile, query for drawings under that tile
                if(channelStruct.Form.hasOwnProperty("Tile") && channelStruct.Form.Tile != null)
                {
                    tile = channelStruct.Form.Tile;
                    apiParams.push("Tile=", tile);
                }
                //else, query for all drawings under selected river-channel 
                else apiParams.push("River=", wat, "&Channel=", chann);
            }
            //else, if a location has been selected and the channel contains locations in the local definition...
            else if(channelStruct.Locations != "")
            {
                //find the location's tile and query drawings under that tile
                $.each(channelStruct.Locations, function(index, location){
                    if(location.Name == locationVal)
                    {
                        tile = location.Tile;
                        return false;
                    }
                });
                
                apiParams.push("Tile=", tile);
            }
        }
        if(type != "Select All") apiParams.push("&Type=", type);

        if(apiParams.length != 0) 
        {
            apiURL = apiBase + apiParams.join("");
            if (debug) console.log("update() is calling: " + apiURL);
            $('#spinner').show();

            return $.getJSON(getAPI(apiURL, ""), function(data) {
                // set report title
                var old_date_format = "YYYY-MM-DD\THH:mm:ss";
                var new_date_format = "YYYY-MM-DD";
                if (window.location.href.indexOf("fra") > -1) { //If url contains 'fra' use
                    header = "Enquêtes Résultats de la recherche";
                } else {
                    header = "Surveys Search Results";
                }

                var title = (chann == "")? (wat) : (wat + " - " + chann); 

                location = (location == "" || location == "Select All")
                    ? ""
                    : "At " + location;


                avaIFaceJS.reportWindow.addTitle(header, title, location);

                avaIFaceJS.sdb_func.tableReport || (avaIFaceJS.sdb_func.tableReport = $('#report_tbl').DataTable({
                    bPaginate: false,
                    bInfo: false,
                    bSort: false,
                    bFilter: false
                }));
                avaIFaceJS.sdb_func.tableReport.clear();
                $('#report_tbl tbody tr').remove();
                $.each(data, function() {
                    avaIFaceJS.sdb_func.tableReport.row.add(
                        [moment(this.Date, old_date_format).format(new_date_format),
                        "<a href='http://www2.pac.dfo-mpo.gc.ca/Data/dwf/"
                            + this.Filename + "." +
                            this.FileType +
                            "' target='_blank'>"
                            + this.Filename + "</a>",
                        this.Location,
                        this.Type,
                        this.KMStart,
                        this.KMEnd
                        ]);
                });
                avaIFaceJS.sdb_func.tableReport.draw();
                $('#report_tbl tbody tr td').each(function () {
                    $(this).css('text-align', 'center');
                });

                // (3) Add a button that allows the user to jump back to the map (a href=`${window.href.location} + #map`); - Last Update 2018-09-28
                avaIFaceJS.sideNavPanel.reset();
                
                var refMapString = (window.location.href.indexOf("fra") > -1) ? "Carte Physique" : "Reference Map";
                var repHeaderString = (window.location.href.indexOf("fra") > -1) ? "Haut du rapport" : "Top of Report";
                var sideNavTitleString = (window.location.href.indexOf("fra") > -1) ? "Aller à" : "Navigate To";

                avaIFaceJS.sideNavPanel.addTitle(sideNavTitleString);
                avaIFaceJS.sideNavPanel.addLink(refMapString,"#ava_map_ttl");
                avaIFaceJS.sideNavPanel.addLink(repHeaderString,"#reportTitleDiv");
                avaIFaceJS.sideNavPanel.display();

                //avaIFaceJS.setMapOpen(avaIFaceJS.MapState.Close); // (2) Keep map open after opening survey results as per client request - Last Updated 2018-09-28 
                
                avaIFaceJS.reportWindow.show();

                if (avaIFaceJS.sdb_func.tableReport){
                    // (1) Place user page in the survey search results, as per client request - Last Updated 2018-09-28  
                    var elemLocation = $("#reportTitleDiv").offset();
                    window.scrollTo(elemLocation.left,elemLocation.top);
                }
                
                // (4) Display the number of results on the page.
                $("#reportCount").empty();
                $("#reportCount").text("Number of Results: " + data.length);
                $("#sel_chan_opt").remove();
                $("#sel_loc_opt").remove();

            }).done(function() {
                $('.spinner').hide();
                // pBarToggle();
                });
        }
        else $('.spinner').hide();
    },

    // update parameter bar from map selected channel
    updateParameters: (function(jsonData) {
        if(debug) console.log("void updateParameters: ");
        console.log(jsonData);
        var data = jsonData.data;
        switch (data.waterway) {
            case "FRMA":
            case "FRMA_SC":
            case "FRNA":
            case "FRNA_SC":
            case "FRPR":
            case "FRSA":
            case "FRSA_SC":
            case "FRUR":
                $sdb_waterway.val("FR");
                break;
            case "FSD":
                $sdb_waterway.val("FR");
                avaIFaceJS.sdb_func.fillChannel();
                $channel.val("FRSA");
                avaIFaceJS.sdb_func.fillLocation();
                $location.val(data.location);
                return;
            default:
                $sdb_waterway.val("CWC");
        }
        if ((/WS*/).test(data.waterway)) $sdb_waterway.val("WS");
        if ((/IN*/).test(data.waterway)) $sdb_waterway.val("IW");
        if ((/POV*/).test(data.waterway)) $sdb_waterway.val("POV");

        avaIFaceJS.sdb_func.fillChannel();
        $channel.val(data.waterway);
        avaIFaceJS.sdb_func.fillLocation();
        // $('#location').text(data.location);
        $location.val(data.location);
    }),
};

function assert(condition, message) {
    if(!condition) {
        message = message || "Assertion failed.";
        if (typeof Error !== "undefined") throw new Error(message);
        throw message;
    }
}
//# sourceURL=sdb_pg_func.js