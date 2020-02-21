// Animated Currents and Velocities Objects
/*** Map functions ***/
avaMapJS.acv_func = {
  init: function () {
    mapStyle.callback_function=function(feat){return true};
    avaMapJS.acv_func.kml=new OpenLayers.Layer.Vector("KML", {
      strategies: [new OpenLayers.Strategy.Fixed()],
      projection: avaMapJS.map.displayProjection,
      styleMap: mapStyle.area_with_label("${Zone}"),
      protocol: new OpenLayers.Protocol.HTTP({
        url: "acv_zones.kml?",
        format: new OpenLayers.Format.KML({
          extractStyles: false,
          extractAttributes: true,
          maxDepth: 2
        })
      })
    });
    avaMapJS.setMapLayer(avaMapJS.acv_func.kml);

    // Map Interaction parameters
    // hover
    avaMapJS.acv_func.HLFeat = new OpenLayers.Control.SelectFeature(avaMapJS.acv_func.kml, {
      hover:false,
      highlightOnly:true,
      renderIntent:'select'
    });
    avaMapJS.setMapControls([avaMapJS.acv_func.HLFeat]);
    //avaMapJS.acv_func.HLFeat.activate();
    //avaMapJS.acv_func.SLFeat.activate();
    avaMapJS.acv_func.kml.events.on({'loadend':avaMapJS.acv_func.layerLoad,'featureselected':avaMapJS.acv_func.newZoneSelect});

    // Set Map Extents
    avaMapJS.setExtents("POV");

    avaMapJS.map.setCenter(new OpenLayers.LonLat(-13687000,6291500),6);
  },
  newZoneSelect: function(feat){
    parent.avaIFaceJS.acv_func.setZone(parseInt(feat.feature.data.Zone));
  },
  layerLoad: function(){
    avaMapJS.acv_func.zoneSelect(1);
  },
  zoneSelect: function(zone){
    avaMapJS.acv_func.HLFeat.unselectAll();
    for (var f = 0; f < avaMapJS.acv_func.kml.features.length; f++) {
      var ft=avaMapJS.acv_func.kml.features[f];
      if ((zone) == ft.data.Zone) {
        avaMapJS.acv_func.HLFeat.select(ft);
        avaMapJS.acv_func.kml.redraw();
        break;
      }
    }
  }
};
//# sourceURL=acv_map_func.js