'use strict';

// setTimeout(function () {
  //
  // let pointLayer = new L.FeatureGroup();
  //
  // let cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
	// cloudmadeOptions = { maxZoom: 18, attribution: cloudmadeAttribution },
	// cloudmadeUrl = 'http://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/{styleId}/256/{z}/{x}/{y}.png';
  //

function resizeMap() {
  scroll(0, 0);
  let mapheight = $(window).height();
  let mapwidth = $(window).width();
  let header = $(".header:visible");
  let footer = $(".footer:visible");
  let content = $(".content:visible");
  let viewport_height = $(window).height();
  let content_height = viewport_height - header.outerHeight() - footer.outerHeight();

  /* Trim margin/border/padding height */
  content_height -= (content.outerHeight() - content.height());
  content.height(content_height);
  $("#map_canvas").height(content_height);
  //$("#map_canvas").width(mapwidth);
}

resizeMap();

let resizeTimer;
$(window).resize(function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resizeMap, 100);
});

  let minimal = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	// attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	detectRetina: true
  });//.addTo(map);

  // midnightCommander = new L.TileLayer(cloudmadeUrl, { styleId: 999, attribution: cloudmadeAttribution });

  let spbCenter = new L.LatLng(59.930967, 30.302636);

  let map = new L.map('map_canvas', {
    center: spbCenter,
	zoom: 11,
	layers: [minimal, /*motorways,*/ /*pointLayer*/]
  });

  // let baseMaps = {
	// "Карта СПб": minimal,
	// "Карта СПб(ночь)": midnightCommander
  // };
  //
  // let overlayMaps = {
	// "Уборочная техника": pointLayer
  // };
  //
  // layersControl = new L.Control.Layers(baseMaps, overlayMaps);

  // map.locate({ setView: true });
  //
  // map.on('locationfound', onLocationFound);
  // map.on('locationerror', onLocationError);

  // map.addControl(layersControl);
// }, 400);