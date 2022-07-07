// Fraser River Hydrograph Object
/*** Interface functions ***/
var curDate = new Date();
avaIFaceJS.frh_func= {
  init: function(){
    $('#date').datepicker({
      changeMonth: true,
      changeYear: true,
      minDate: new Date(1994,1,1)
    }).datepicker('setDate', new Date(curDate.getFullYear(),0,1));
    $('#submit').click(avaIFaceJS.frh_func.update);
  
    avaIFaceJS.frh_func.update(); // for initial load
  },

  update: function(){
    var options = {
      grid: {
        backgroundColor: {
          colors: ["#fff", "#e4f4f4"]
        }
      },
      series: {
        lines: {
          show: true,
          lineWidth: 1.2
        },
        points: {
          show: false
        }
      },
      colors: ['red', 'blue', '#000', '#777'],
      xaxis: {
        mode: "time",
        color: 'white',
        tickColor: 'white',
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 15,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 10
      },
      yaxis: {
        axisLabel: "Hope Discharge (m\u00B3/s)",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 20,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 6
      },
      legend: {
        container: "#legend_container",
        labelFormatter: labelFontControl,
        noColumns: 0,
        labelBoxBorderColor: "none"
      }
    };
    
    // set date language
    if(window.location.href.indexOf("fra") > -1) {
      moment.locale('fr');
    } else {
      moment.locale('en');
    }
  
    var dateFormat = "MMMM YYYY";
    var dataset, actual, maximum, minimum, predicted, period, month, curDateMom, endDateMom;
    actual=[];
    maximum=[];
    minimum=[];
    predicted=[];
  
    period=parseInt($('#period option:selected').html().split(" ")[0]); // data period in months

    curDateMom = moment($('#date').datepicker('getDate'));
    endDateMom = moment(curDateMom).add(period, 'months');

    options.xaxis.min =  curDateMom.valueOf();
    options.xaxis.max =  endDateMom.valueOf();
  
    // increment value to align with database request
    month = curDateMom.month() == 11
      ? 1
      : curDateMom.month() + 2;

  avaIFaceJS.reportWindow.loadReport();
    avaIFaceJS.reportWindow.addTitle(
        "Fraser River Hydrograph at Hope - 08MF005",
        "From " + curDateMom.format(dateFormat) +
        " to " + endDateMom.format(dateFormat));

    $('#spinner').show();
    $('#loading').show();
    $('#hydrograph_chart').html('');

    //TODO: Replace with following line for production
    $.getJSON(
        getAPI(
          ("/api/hydrograph?year=" + curDateMom.year() + "&")
            + ("month=" + (month) + "&")
            + ("period=" + ($('#period').val()) + "&")
            + "actual=false&"
            + "predicted=true",
          "api/depths/hydrograph.json"),
        function(results) {
    //$.getJSON("api/depths/hydrograph.json", function(results) {
      $.each(results, function(i,v){
        year= v.year;
        month= v.month-1;
        if ($("#minMax").prop("checked")) {
          $.each(v.minMax, function(i, v){
            var selDate, day;
            day= v.day+1;
            selDate = [year,month,day];
            minimum.push([moment(selDate), v.minValue]);
            return maximum.push([moment(selDate), v.maxValue]);
          });
        }

        if ($("#actual").prop("checked")) {
          $.each(v.actual, function(i, v) {
            var discharge;
            discharge = [moment(v.date), v.value];
            if (discharge[1] !== 0) {
              return actual.push(discharge);
            }
          });
        }

        if ($("#predicted").prop("checked")) {
          return $.each(v.predicted, function(i, v) {
            var discharge;
            discharge = [moment(v.date), v.value];
            if (discharge[1] !== 0) {
              return predicted.push(discharge);
            }
          });
        }
      });
      dataset = [
        {
          data: maximum,
          label: "Max Range"
        }, {
          data: minimum,
          label: "Min Range"
        }, {
          data: actual,
          label: "Actual"
        }, {
          data: predicted,
          label: "Predicted"
        }
      ];
      if ($('html').attr('lang') === 'fr') {
        dataset = [
          {
            data: maximum,
            label: "Portée maximale"
          }, {
            data: minimum,
            label: "Portée minimale"
          }, {
            data: actual,
            label: "Données réelles"
          }, {
            data: predicted,
            label: "Prévu"
          }
        ];
      }
      avaIFaceJS.reportWindow.show();
      avaIFaceJS.setMapOpen(avaIFaceJS.MapState.Close);
      pBarToggle();
      var h = $.plot($('#hydrograph_chart'), dataset, options);
      h.getData()[2].lines.lineWidth=2.5;
      h.getData()[3].lines.lineWidth=2.5;
      h.draw();
      $('#loading').hide();

      $('.legendColorBox').children().css("margin-top", "8px");
    });
  }
};

function labelFontControl(label,series) {
  return '<span style="font-size: 150%">' + label;
}
//# sourceURL=frh_pg_func.js