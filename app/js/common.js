'use strict';

$(document).ready(function () {

  let input = this._input = document.createElement('input', '');

  // let ul = this._alts = document.createElement('ul', '');
  // ul.setAttribute("class", "search-ul-alternatives search-ul-minimized");
  // L.DomEvent.disableClickPropagation(ul);

  $('#search_clear').append(input);
  // $('#map_canvas').append(ul);

  function setAttributes(el, attrs) {
	for(let key in attrs) {
	  el.setAttribute(key, attrs[key]);
	}
  }

  setAttributes(input, {"type": "text", "id": "search_query", "class": "clearable",  "placeholder": "Поиск по"});



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

	function mapDraw() {
	  let pointLayer = new L.FeatureGroup();
	  let cloudmadeUrl = 'http://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/{styleId}/256/{z}/{x}/{y}.png';
	  let minimal = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		detectRetina: true
	  });
	  let midnightCommander = new L.TileLayer(cloudmadeUrl, {styleId: 999});
	  let spbCenter = new L.LatLng(59.930967, 30.302636);
	  let map = new L.Map('map_canvas', {center: spbCenter, zoom: 11, layers: [minimal, /*motorways,*/ pointLayer]});
	  map.locate({setView: true});

	  let lc = L.control.locate().addTo(map);

	  let baseMaps = {
		"Карта СПб": minimal,
		"Карта СПб(ночь)": midnightCommander
	  };
	  let overlayMaps = {
		"Уборочная техника": pointLayer,
		"Тракера": pointLayer
	  };
	  let layersControl = new L.Control.Layers(baseMaps, overlayMaps);
	  map.locate({setView: true});
	  map.addControl(layersControl);
	}

/*
	function WaitForPool(id) {
	  $.ajax({
		type: 'GET',
		url: 'http://176.97.34.40:6064/?command=receive&connection=' + id,
		async: true,
		cache: false,

		success: function (data) {
		  try {
			let json = eval('(' + data + ')');

			let str = JSON.stringify(json);
			slice = JSON.parse(str);

			for (let k in slice.root) {
			  if (slice.root[k] instanceof Object) {
				if (typeof slice.root[k].header == "undefined") continue;
				if (!slice.root[k].header instanceof Object) continue;
				if (slice.root[k].header.type == "33") continue;
				if (slice.root[k].header.type == "34") continue;
				if (slice.root[k].lat == undefined || slice.root[k].lon == undefined) continue;
				if (slice.root[k].lat == 0 || slice.root[k].lon == 0) continue;

				if ((slice.root[k].flag & 32) == 32) {
				  continue;
				}
				evt.latlon = [[slice.root[k].lat, slice.root[k].lon]];
				evt.obj = slice.root[k];
				evt.did = slice.root[k].header.id;
				$(window).trigger(evt);
			  }
			}
			setTimeout('WaitForPool(' + id + ')', 100);
		  }
		  catch (e) {
		  }
		},

		error: function (XMLHttpRequest, textStatus, errorThrown) {
		  setTimeout('WaitForPool(' + id + ')', 1000);
		}
	  });
	}

	function WaitForConnect() {

	  $.ajax({
		type: 'GET',
		url: 'http://176.97.34.40:6064/?command=connect&principal=1',
		async: true,
		cache: false,

		success: function (data) {

		  let json = eval('(' + data + ')');
		  setTimeout(' WaitForPool(' + json.root[0].connection + ')', 1000);
		},

		error: function (XMLHttpRequest, textStatus, errorThrown) {
		  setTimeout(' WaitForPool(' + json.root[0].connection + ')', 1000);
		}
	  });
	}
*/

	$('#search_query').autocomplete({
	  source: function ( request, response ) {
		$.ajax({
		  url: "http://nominatim.openstreetmap.org/search?format=json&&polygon_geojson=1&limit=5&q=",
		  cache: true,
		  method: "GET",
		  types: ['(cities)'],
		  data: {
			q: request.term,
			format: 'json',
		  },
		  success: function (data) {
			response( $.map( data, function ( item ) {
			  return {
				value: item.display_name
			  }
			}));
			$.each(data, function () {
			  let bb = value.boundingbox;
			});
		  }
		});
	  }
	});

	return mapDraw();
  }

  $('.col-right').click(() => {
	if ($(".aside").hasClass("in")) {
	  $('.aside').asidebar('close')
	} else {
	  $('.aside').asidebar('open')
	}
  });

  $(() => {
	$("#search_query").addClear();
  });

  Map();

});
