'use strict';

$(document).ready(function () {

  let L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

  let input = this._input = document.createElement('input', '');

  let ul = this._alts = document.createElement('ul', '');
  ul.setAttribute("class", "search-ul-alternatives search-ul-minimized");
  L.DomEvent.disableClickPropagation(ul);

  $('#search_clear').append(input);
  $('#map_canvas').append(ul);

  function setAttributes(el, attrs) {
	for(var key in attrs) {
	  el.setAttribute(key, attrs[key]);
	}
  }

  setAttributes(input, {"type": "text", "id": "search_query", "class": "clearable",  "placeholder": "Поиск по"});

  function _geocodeResult(results, suggest) {
	if (!suggest && results.length === 1) {
	  this._geocodeResultSelected(results[0]);
	} else if (results.length > 0) {
	  this._alts.innerHTML = '';
	  this._results = results;
	  L.DomUtil.removeClass(this._alts, 'leaflet-control-geocoder-alternatives-minimized');
	  for (var i = 0; i < results.length; i++) {
		this._alts.appendChild(this._createAlt(results[i], i));
	  }
	} else {
	  L.DomUtil.addClass(this._errorElement, 'leaflet-control-geocoder-error');
	}
  }

  function _geocode(suggest) {
	var requestCount = ++this._requestCount,
	  mode = suggest ? 'suggest' : 'geocode',
	  eventData = {input: this._input.value};

	this._lastGeocode = this._input.value;
	if (!suggest) {
	  this._clearResults();
	}

	this.fire('start' + mode, eventData);
	this.options.geocoder[mode](this._input.value, function(results) {
	  if (requestCount === this._requestCount) {
		eventData.results = results;
		this.fire('finish' + mode, eventData);
		this._geocodeResult(results, suggest);
	  }
	}, this);
  }

  function _geocodeResultSelected(result) {
	if (!this.options.collapsed) {
	  this._clearResults();
	}

	this.fire('markgeocode', {geocode: result});
  }

  function _clearResults() {
	L.DomUtil.addClass(this._alts, 'search-ul-minimized');
	this._selection = null;
	L.DomUtil.removeClass(this._errorElement, 'search-ul-error');
  }

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

	  // //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	  // var geocoder = L.Control.geocoder({
		// defaultMarkGeocode: false
	  // })
		// .on('markgeocode', function(e) {
		//   var bbox = e.geocode.bbox;
		//   var poly = L.polygon([
		// 	bbox.getSouthEast(),
		// 	bbox.getNorthEast(),
		// 	bbox.getNorthWest(),
		// 	bbox.getSouthWest()
		//   ]).addTo(map);
		//   map.fitBounds(poly.getBounds());
		// })
		// .addTo(map);
	  var geocoder = new Geocoder('nominatim', {
		provider: 'mapquest',
		key: '__some_key__',
		lang: 'pt-BR', //en-US, fr-FR
		placeholder: 'Search for ...',
		targetType: 'text-input',
		limit: 5,
		keepOpen: true
	  });
	  map.addControl(geocoder);
	  // //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	  map.locate({setView: true});
	  map.addControl(layersControl);

	  // //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	  // map.addControl(geocoder);
	  // //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	}
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

  // $(function($) {
	// function tog(v){
	//   return v ? 'addClass' : 'removeClass';
	// }
	// $(document).on('input', '.clearable', function() {
	//   $(this)[tog(this.value)]('x');
	// }).on('mousemove', '.x', function(e) {
	//   $(this)[tog(this.offsetWidth - 18 < e.clientX - this.getBoundingClientRect().left)]('onX');
	// }).on('touchstart click', '.onX', function(ev) {
	//   ev.preventDefault();
	//   $(this).removeClass('x onX').val('').change();
	// });
  // });
  Map();

});
