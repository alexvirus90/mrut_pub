'use strict';

$(document).ready(function () {

  function resizeMap() {
	scroll(0, 0);
	let header = $(".header:visible");
	let footer = $(".footer:visible");
	let content = $(".content:visible");
	let viewport_height = $(window).height();
	let content_height = viewport_height - header.outerHeight() - footer.outerHeight();

	content_height -= (content.outerHeight() - content.height());
	content.height(content_height);
	$("#map_canvas").height(content_height);
  }

  function Map() {

    resizeMap();

	let resizeTimer;
	$(window).resize(function () {
	  clearTimeout(resizeTimer);
	  resizeTimer = setTimeout(resizeMap, 100);
	});

	function mapDraw () {

	  let pointLayer = new L.FeatureGroup();

	  let cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
		cloudmadeOptions = { maxZoom: 18, attribution: cloudmadeAttribution },
		cloudmadeUrl = 'http://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/{styleId}/256/{z}/{x}/{y}.png';

	  let minimal = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
		detectRetina: true
	  });//.addTo(map);

	  let midnightCommander = new L.TileLayer(cloudmadeUrl, { styleId: 999, attribution: cloudmadeAttribution });

	  let spbCenter = new L.LatLng(59.930967, 30.302636);

	  let map = new L.Map('map_canvas', { center: spbCenter, zoom: 11, layers: [minimal, /*motorways,*/ pointLayer] });

	  map.locate({ setView: true });
	}
	return mapDraw();
  }
  Map();
});
