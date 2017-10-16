'use strict';

$(document).ready(function () {

  let car_imgColor = new Array();
  car_imgColor[1] = "black"; car_imgColor[2] = "lilac";
  car_imgColor[3] = "light_blue"; car_imgColor[4] = "red";
  car_imgColor[5] = "orange"; car_imgColor[6] = "blue";
  car_imgColor[7] = "green"; car_imgColor[8] = "light_green";
  car_imgColor[9] = "light_blue"; car_imgColor[10] = "yellow";
  car_imgColor[11] = "lilac"; car_imgColor[12] = "brown";
  car_imgColor[13] = "yellow"; car_imgColor[14] = "lemon";
  car_imgColor[15] = "violet"; car_imgColor[16] = "t";

  let car_Fun = new Array();
  car_Fun[1] = "ПГ"; car_Fun[2] = "ССВ";
  car_Fun[3] = "М"; car_Fun[4] = "РТ";
  car_Fun[5] = "РУ"; car_Fun[6] = "ПМ";
  car_Fun[7] = "ПУ"; car_Fun[8] = "В";
  car_Fun[9] = "Щ"; car_Fun[10] = "П";
  car_Fun[11] = "Б"; car_Fun[12] = "РЖ";
  car_Fun[13] = "Т"; car_Fun[14] = "Р";
  car_Fun[15] = "К"; car_Fun[16] = "ПР";

  let car_Color = new Array();
  car_Color[1] = "black"; car_Color[2] = "#9B30FF";
  car_Color[3] = "turquoise"; car_Color[4] = "red";
  car_Color[5] = "orange"; car_Color[6] = "blue";
  car_Color[7] = "green"; car_Color[8] = "lime";
  car_Color[9] = "#00D5D5"; car_Color[10] = "yellow";
  car_Color[11] = "#FF6A00"; car_Color[12] = "brown";
  car_Color[13] = "yellow"; car_Color[14] = "green";
  car_Color[15] = "grey"; car_Color[16] = "green";
  car_Color[17] = "C3F266"; car_Color[18] = "violet";

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

	  let cloudmadeUrl = 'http://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/{styleId}/256/{z}/{x}/{y}.png';

	  let minimal = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		detectRetina: true
	  });

	  let midnightCommander = new L.TileLayer(cloudmadeUrl, { styleId: 999 });

	  let spbCenter = new L.LatLng(59.930967, 30.302636);

	  let map = new L.Map('map_canvas', { center: spbCenter, zoom: 11, layers: [minimal, /*motorways,*/ pointLayer] });

	  map.locate({ setView: true });

	  let baseMaps = {
		"Карта СПб": minimal,
		"Карта СПб(ночь)": midnightCommander
	  };

	  let overlayMaps = {
		"Уборочная техника": pointLayer,
		"Тракера": pointLayer
	  };

	  let layersControl = new L.Control.Layers(baseMaps, overlayMaps);

	  map.locate({ setView: true });

	  map.addControl(layersControl);
	}
	return mapDraw();
  }
  Map();

  $('.col-middle #search').click( () => {
	$(this).addClass('focus')
  });

  $('form').blur( () => {
	// $(this).removeClass('active');
	alert('hello')
  });

  $('.col-right').click(() => {
    if ($(".aside").hasClass("in")) {
	  $('.aside').asidebar('close')
	} else {
	  $('.aside').asidebar('open')
	}
  });

});
