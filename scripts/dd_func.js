/**
 * Created by wsiddall on 26/08/2014.
 * Modified by mwongrm on 20/11/2019.
 */

// Daily Depths Object
if (!(typeof avaIFaceJS === 'undefined')) {

    /*** Interface functions ***/
    avaIFaceJS.dd_func = {
        tableReport: null,
        tableDetail: null,
        limit_text: "",
        dateFormat: null,
        $date: null,
        $chainage: null,
        $flowRate: null,
        $flowType: null,
        $width: null,
        $spinner: null,

        init: function() {
            avaIFaceJS.detailWindow.loadLayout();
            $date = $('#date');
            $chainage = $('#chainage');
            $flowRate = $('#flowRate');
            $flowType = $('#flowType');
            $width = $('#width');
            $spinner = $('.spinner');
            dateFormat = {
                eng: "MMMM D, YYYY",
                fra: "D MMMM YYYY"
            }

            // Style Elements
            $(".yaxislabel").css("color", "black");

            /** Event Handlers **/
            // Retrieve content on Date change
            $date.change(function() {
                avadepth.util.getFlow({
                    date: $(this).val(),
                    selected: $("#selected_discharge"),
                    actual: $("#actual_discharge")
                });
            }).datepicker().datepicker('setDate', new Date()).change();

            $('#selected_discharge').change(function() {
                $('#selected_radio').prop('checked', true).change();
            });
            // Check "User Defined" radio on "User Defined" input is focused on
            $('#defined_discharge').on("click", function() {
                $('#defined_radio').prop('checked', true).change();
            });

            // default Current Soundings
            $date.datepicker("option", "minDate", 0);
            // $('input[type=radio][name=condition]').change(function() {
            //     if (this.value == '0') {
            //         $("#date").datepicker("option", "minDate", 0);
            //     }
            //     else if (this.value == '1') {
            //         $("#date").datepicker("option", "minDate", null);
            //     }
            // });

            // Retrieve content on form submission
            return $("#submit").click(function() {
                if (!$('input[name=discharge]').is(":checked")) {
                    $("#error_message").show();
                    $("#error_message").html("Place select one of the options for the field \"River Discharge @ Hope\"");
                    return $("#report_body").hide();

                } else if (avadepth.util.getSelectedFlow().flowRate === ""
                        && avadepth.util.getSelectedFlow().flowType === 'UserDefined') {
                    // user has left user-defined m^3/s value blank
                    $('#defined_discharge').focus();
                    return;
                } else {
                    $spinner.show();
                    $("#error_message").hide();
                    $("#report_body").show();

                    // resets detail window if open when report is requested
                    avaIFaceJS.detailWindow.hide();

                    return avaIFaceJS.dd_func.update();
                }
            });
        },


        // Process Report content and update Report Window
        update: function() {
            var self = this;
            var flow, title1, title2, subT1, subT2;

            var channel = $('input[name="channel"]:checked').val();
            var $condition = $('input[name="condition"]:checked');

            // define report type values
            flow = avadepth.util.getSelectedFlow();
            $flowRate.val(flow.flowRate);
            $flowType.val(flow.flowType);

            //TODO: Replace bottom line for production
            return $.getJSON(getAPI(("/api/depths/calculate?date=" + ($date.val()) + "&")
                    + ("chainage=" + $chainage.val() + "&")
                    + ("flowRate=" + $flowRate.val() + "&")
                    + ("flowType=" + $flowType.val() + "&")
                    + ("width=" + $width.val() + "&")
                    + ("sounding=" + $condition.val()), "api/depths/calculate.json"), function(data) {
                var points = [];
                self.tableReport || (self.tableReport = $('#depths').DataTable({
                    "paging": false,
                    "ordering": false,
                    "searching": false,
                    "info": false,
                    "autoWidth": false,
                    "columnDefs": [{
                        "targets": 1,
                        "orderData": [4]
                    }, {
                        "targets": -1,
                        "visible": false
                    }]
                }));
                self.tableReport.clear();
                $("#depths th").css("cursor", "default")
                $('#depths tbody tr').remove();
                $.each(data.items[channel].items, function() {
                    self.tableReport.row.add(
                        ['<a href="javascript:void(0)">' + this.period + "</a>",
                            this.chainage,
                            this.depth.toFixed(1),
                            this.location,
                            this.chainage.split('-')[0]
                        ]);
                    return points.push([this.period, this.depth]);
                });

                self.tableReport.draw();
                $('#depths tbody tr td:first-child a').click(function() {
                    self.showDetail($(this).text());
                });
                limit_text = (function() {
                    switch (false) {
                        case channel !== '0':
                            if (window.location.href.indexOf("eng") > -1) {
                                return "Inner Channel Limit";
                            } else {
                                return "Limite Intérieure";
                            }
                            break;
                        case channel !== '1':
                            if (window.location.href.indexOf("eng") > -1) {
                                return 'Outer Channel Limit';
                            } else {
                                return "Limite Extérieure";
                            }
                            break;
                        default:
                            return '';
                    }
                })();

                if (window.location.href.indexOf("fra") > -1) { //If url contains 'fra' use 
                    moment.locale('fr');
                    title1 = "Rapport sur les profondeurs disponibles pour " + moment($date.val()).format(dateFormat.fra);
                    title2 = "Fleuve Fraser – Bras Sud, " + limit_text;
                    subT1 = $condition.next().text()
                        + " pour KM 1-" + $chainage.val()
                        + " à " + $width.val() + "% Largeur disponible";
                    subT2 = "Débit fluvial à Hope, " + $flowRate.val() + " m\u00B3/s (" + translate_flow() + ")";
                } else { //If url does not contain 'fra' use
                    moment.locale('en');
                    title1 = "Available Depth Report for " + moment($date.val()).format(dateFormat.eng);
                    title2 = "Fraser River – South Arm, " + limit_text;
                    subT1 = $condition.next().text()
                        + " for KM 1 to " + $chainage.val()
                        + " at " + $width.val() + "% Available Width";
                    subT2 = "River Discharge @ Hope, " + $flowRate.val() + " m\u00B3/s (" + translate_flow() + ")";
                }
                avaIFaceJS.reportWindow.addTitle(title1, title2, subT1, subT2);
                avaIFaceJS.reportWindow.show();
                avaIFaceJS.setMapOpen(avaIFaceJS.MapState.Close);
                self.createGraph(points);
            }).success(function() {
                pBarToggle();
                return $spinner.hide();
            }).error(function() {
                $spinner.hide();
                avaIFaceJS.reportWindow.show();
                avaIFaceJS.setMapOpen(avaIFaceJS.MapState.Close);
                return avaIFaceJS.reportWindow.showError('An error occured while retrieving your results');
            });
        },

        // Update values and apply to Detail Window
        showDetail: function(period) {
        var self = this;
            var $condition = $('input[name="condition"]:checked');

            //avaIFaceJS.detailWindow.show();
            $('#static-time').text(period);
            $('#date-display').text(moment($date.val()).format(dateFormat.eng));
            $('#static-limit').text(limit_text);
            $('#static-type').text($condition.next().text());
            $('#static-chainage').text($chainage.val());
            $('#static-width').text($width.val());
            $('#static-discharge').text($flowRate.val());
            $('#static-discharge-eval').text(translate_flow());
            //TODO: Replace line for production:
            
            var dataURL = getAPI(("/api/depths/verify?date=" + $date.val()+ "&")
                + ("chainage=" + $chainage.val() + "&")
                + ("flowRate=" + $flowRate.val() + "&")
                + ("flowType=1&")
                + ("sounding=" + $condition.val() + "&")
                + ("width=" + $width.val() + "&")
                + ("lane=" + (parseInt($('input[name="channel"]:checked').val()) + 1) + "&")
                + ("period=" + (parseInt(period.substring(0, 2)) / 2 + 1)), "api/depths/verify.json");
            $.getJSON(dataURL, function(data) {
                var least_depth;
                self.tableDetail || (self.tableDetail = $('#verify').DataTable({
                    "paging": false,
                    "ordering": false,
                    "searching": false,
                    "info": false,
                    "autoWidth": false,
                    "columnDefs": [{
                        "targets": 0,
                        "orderData": [7]
                    }, {
                        "targets": -1,
                        "visible": false
                    }]
                }));

                self.tableDetail.clear();
                $('#verify tbody tr').remove();
                least_depth = 10000;
                $.each(data.items, function(index) {
                    var depth, fixed_depth;
                    fixed_depth = this.depth.toFixed(1);
                    if (this.depth <= least_depth) {
                        least_depth = parseFloat(fixed_depth);
                        $('#verify td').find('.low_depth').removeClass('low_depth');
                        depth = "<span class=\"low_depth\">" + fixed_depth + "</span>";
                    } else {
                        depth = fixed_depth;
                    }
                    return self.tableDetail.row.add([
                        this.location,
                        this.designGrade.toFixed(1),
                        this.sounding.toFixed(1),
                        this.width,
                        this.percent,
                        this.tidalAid.toFixed(1),
                        depth,
                        index
                    ]).draw();
                });

                window.open("dd_detail.html");
                return $('#verify td')
                    .find('.low_depth')
                    .closest('tr')
                    .addClass('least-depth');
            });

        },

        // Create line graph using provided points from JSON query
        createGraph: function(p) {
            var d1, leadingZero, xLabel, yLabel;
            d1 = {
                color: "red",
                lines: {
                    lineWidth: 3
                },
                data: p
            };
            leadingZero = function(num, axis) {
                var s;
                s = "0" + num;
                return s.substr(s.length - 4);
            };
            if (window.location.href.indexOf("fra") > -1) {
                xLabel = "Heure Normale du Pacifique (hrs)";
                yLabel = "Profondeurs disponibles (m)";
            } else {
                xLabel = "Pacific Standard Time (hrs)";
                yLabel = "Available Depth (m)";
            }
            return $.plot("#depth_chart", [d1], {
                xaxis: {
                    color: 'black',
                    tickColor: '#aaa',
                    axisLabel: xLabel,
                    tickSize: 200,
                    tickFormatter: leadingZero
                },
                yaxis: {
                    color: 'black',
                    tickColor: '#aaa',
                    position: 'left',
                    axisLabel: yLabel
                }
            })
        }
    }
} else if (!(typeof avaMapJS === 'undefined')) {

    /*** Map Interaction functions ***/

    avaMapJS.dd_func = {
        init: function() {}
    }
} else if (!(typeof avaMapDetJS === 'undefined')) {
    avaMapDetJS.dd_func = {
        init: function() {}
    };
}

//# sourceURL=dd_func.js