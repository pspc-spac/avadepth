/**
 * Created by wsiddall on 26/08/2014.
 * Maintained by seor since 02/10/2015.
 */
var debug = false;
var locException = [];

/*** Interface functions ***/
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
        $.getJSON(
            getAPI(
                'api2/isas?location=' + tileName,
                '/api/isa/' + tileName + '.json'))
        .then(function(ISAs){
            console.log(ISAs);
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
//# sourceURL=isa_pg_func.js