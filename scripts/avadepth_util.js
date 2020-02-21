/** @namespace */
var avadepth = avadepth || {};

avadepth.util = avadepth.util || {};

avadepth.util.getFlow = function (options, callback) {
  var thisCallback = callback;

  $.getJSON(getAPI('/api/depths?date=' + options.date,'api/depths/depths.json'), function(data){

    /* populates Actual and Selected flow values */
    selectList = $(options.selected);

    // generates 'Selected' drop down menu
    var s = '';
    $.each(data.Flowrates, function (idx, itm) {
        s += '<option value=' + itm + '>' + itm + '</option>';
    });
    $('option', selectList).remove();
    selectList.append(s);

    // populates 'Actual' flow rate
    $(options.actual).text(data.Actual);

    // sets default radio button
    if (data.Actual) {
      $("#actual_radio").attr('disabled', false);
      $('#actual_radio').prop('checked', true);
    } else {
      $("#actual_radio").attr('disabled', true);
      $("#selected_radio").prop('checked', true);
    }

    if (thisCallback) { callback(data); }
  });
};
    
avadepth.util.getSelectedFlow = function () {
  var flow = { flowRate: 0, flowType: $("input:radio[name=discharge]:checked").val() };

  getFlowRate = {
    Actual: function() {
      return $('#actual_discharge').text();
    },
    Selected: function() {
      return $('#selected_discharge').val();
    },
    Defined: function() {
      return $('#defined_discharge').val();
    }
  };

  flow.flowRate = getFlowRate[flow.flowType]();
  if (flow.flowType == "Defined"){
    flow.flowType = "UserDefined";
  }
  return flow;
};

avadepth.util.getUrlParameter = function (param) {
  var url = decodeURIComponent(window.location.search.substring(1));
  var vars = url.split('&');
  var paramName;
  for (var i = 0; i < vars.length; i++) {
      paramName = vars[i].split('=');
      if (paramName[0] === param) {
          return paramName[1] === undefined ? true : paramName[1];
      }
  }
};