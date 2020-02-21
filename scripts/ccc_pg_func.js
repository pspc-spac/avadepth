avaIFaceJS.ccc_func = {
  detailIsInnerChannel:true,

  init: function () {
  var table, title1, title2;
  
  avaIFaceJS.detailWindow.loadLayout();
    
  if(window.location.href.indexOf("fra") > -1) {
    moment.locale('fr-ca');
  }  else {
    moment.locale('en');
  }
    return $.getJSON(getAPI("/api/Soundings?id=" + moment().format("YYYY-M-D"), "api/depths/soundings.json"), function(data) {
      table || (table = $('#soundings').dataTable({
        bPaginate: false,
        bInfo: false,
        bSort: false,
        bFilter: false,
        aoColumnDefs: [
          {
            sClass: "1",
            "aTargets": [4, 5, 6]
          },
          {
            sClass: "2",
            "aTargets": [8, 9, 10]
          }
        ]
      }));
      table.fnClearTable();
      $.each(data, function (index) {
        table.fnAddData(
            ["<a href='javascript:void(0)' id='" + (index + 1) + "'>" + this.Chainage + "</a>",
            this.SoundingDate,
            "<a href='http://www2.pac.dfo-mpo.gc.ca/Data/dwf/" + this.Plan + ".dwf'>" + this.Plan + "</a>",
            this.Dredge,
            this.Sounding.toFixed(1),
            this.Width,
            this.WidthPerc,
            this.Dredge2,
            this.Sounding2.toFixed(1),
            this.Width2,
            this.WidthPerc2]);
        if (this.IsHigh) {
          $('#soundings tr:last').find('.1').addClass('red');
          $('#soundings tr:last td:eq(4)').append('*');
        }
        if (this.IsHigh2) {
          $('#soundings tr:last').find('.2').addClass('red');
          return $('#soundings tr:last td:eq(8)').append('*');
        }
      });
      table.fnAdjustColumnSizing();
      $('.first-row th:nth-child(1)').css('width', '123px');
      $('.first-row th:nth-child(2)').css('width', '218px');
      return $('.first-row th:nth-child(3)').css('width', '218px');
    }).success(function () {
      $('#soundings tbody tr a[id]').click(avaIFaceJS.ccc_func.showDetail);
      $('input[name=channel_select]').change(avaIFaceJS.ccc_func.setChannel);
      $('#soundings').css('width', '800px');
      
    // set title
    if(window.location.href.indexOf("fra") > -1) { //If url contains 'fra'	use 
      title1 = "Conditions actuelles du chenal – bras sud du fleuve Fraser";
      title2 = moment().format("dddd, MMMM D, YYYY");
    } else { //If url does not contain 'fra' use
      title1 = "Fraser River – South Arm Channel Condition Report";
      title2 = "for " + moment().format("dddd, MMMM D, YYYY");
    }
      avaIFaceJS.reportWindow.addTitle(title1, title2);
  
      avaIFaceJS.reportWindow.show();

      //Elimination of line breaks to fit print format 
      var e = document.getElementById('reportTitleDiv');
      var var1   = e.getElementsByTagName('br');
      for(var i = var1.length; i--;) {
        var1[i].parentNode.removeChild(var1[i]);
      }
      
    });

  },
  showDetail: function () {
    avaIFaceJS.ccc_func.chainage = this.id;
    $('input[id="inner_select"]').attr('checked','checked');
    //avaIFaceJS.detailWindow.show();
    window.open("ccc_detail.html?chainage=" + avaIFaceJS.ccc_func.chainage);
    $('#heading').text("km " + (avaIFaceJS.ccc_func.chainage - 1) + " - " + (avaIFaceJS.ccc_func.chainage));
    $('input[name=channel_select]').change();
  },
  setChannel:function(){
    if(!($(this).is(':checked'))){return;}
    avaIFaceJS.ccc_func.detailIsInnerChannel=($(this).val()==="1");
  
  $('#detail_print').find('#segment').text($(this).next().text()); // updates print div with current channel information
    $('#surveys tbody').html('');
  
    //TODO: Replace following line for production
    return $.getJSON(("/api/History?date=" + moment().format("YYYY-M-D") + "&") +
        ("lane=" + (avaIFaceJS.ccc_func.detailIsInnerChannel ? "1" : "2")) + "&" +
        ("chainage=" + avaIFaceJS.ccc_func.chainage), function(data) {
      $.each(data, function (index) {
        var row, surveydate, ishigh="", ishighast="";
        surveydate = moment(this.date).format("D-MMM-YYYY");
        if(this.grade>this.sounding){
          ishigh=" class=\"red\"";
          ishighast="*";
        }
        if(this.Plan.slice(0,2) != "FR"){
          row = "<tr>" +
                  "<td>" + surveydate + "</td>" +
                  "<td><a href=\"http://www2.pac.dfo-mpo.gc.ca/Data/dwf/" + this.Plan + ".dwf?\"" +
                          "target=\"_blank\">" + this.Plan + "</a></td>" +
                  "<td"+ishigh+">" + (this.grade.toFixed(1)) + "</td>" +
                  "<td"+ishigh+">" + (this.sounding.toFixed(1)) + ishighast + "</td>" +
                  "<td"+ishigh+">" + this.width + "</td>" +
                  "<td"+ishigh+">" + this.widthperc + "</td>" +
                "</tr>";
        }
        return $("#surveys tbody").append(row);
      });
    });
  }
};

document.getElementById('pBarContainer').style.display = 'none'; 
//# sourceURL=ccc_pg_func.js