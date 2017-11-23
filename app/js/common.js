'use strict';

let carsArray 	 = [],
		mrkOn 		 	 = [],
	 	marker 			 = [],
	 	global 			 = {data: [],slices: []},
	 	evt 				 = $.Event('startpoint'),
	  addSlice     = $.Event('onAddSlice'),
		updateSlice  = $.Event('onUpdateSlice');

let map, markerSearch, pupuptext,	spbCenter, resizeTimer;

let zoom, bounds;

let	markerOnline  = new L.LayerGroup(),
		markerOffline = new L.FeatureGroup(),
		markerTrakers = new L.layerGroup(),
		markerhide 		= new L.layerGroup();

$(document).ready( () => {
	let car_imgColor = [],
			car_Fun 		 = [],
			car_Color 	 = [];

	car_imgColor[1] = "black"; 			car_imgColor[2] = "lilac";
	car_imgColor[3] = "light_blue"; car_imgColor[4] = "red";
	car_imgColor[5] = "orange"; 		car_imgColor[6] = "blue";
	car_imgColor[7] = "green"; 			car_imgColor[8] = "light_green";
	car_imgColor[9] = "light_blue"; car_imgColor[10] = "yellow";
	car_imgColor[11] = "lilac"; 		car_imgColor[12] = "brown";
	car_imgColor[13] = "yellow"; 		car_imgColor[14] = "lemon";//car_imgColor[15] = "white";
	car_imgColor[15] = "violet"; 		car_imgColor[16] = "t";

	car_Fun[1] = "ПГ"; car_Fun[2] = "ССВ";
	car_Fun[3] = "М";  car_Fun[4] = "РТ";
	car_Fun[5] = "РУ"; car_Fun[6] = "ПМ";
	car_Fun[7] = "ПУ"; car_Fun[8] = "В";
	car_Fun[9] = "Щ";  car_Fun[10] = "П";
	car_Fun[11] = "Б"; car_Fun[12] = "РЖ";
	car_Fun[13] = "Т"; car_Fun[14] = "Р";
	car_Fun[15] = "К"; car_Fun[16] = "ПР";

	car_Color[1] = "black"; 		car_Color[2] = "#9B30FF";
	car_Color[3] = "turquoise"; car_Color[4] = "red";
	car_Color[5] = "orange"; 		car_Color[6] = "blue";
	car_Color[7] = "green"; 		car_Color[8] = "lime";
	car_Color[9] = "#00D5D5"; 	car_Color[10] = "yellow";
	car_Color[11] = "#FF6A00"; 	car_Color[12] = "brown";
	car_Color[13] = "yellow"; 	car_Color[14] = "C3F266";
	car_Color[15] = "violet"; 	car_Color[16] = "grey";

	let input = document.createElement('input');
	$('#search_clear').append(input);

  function setAttributes(el, attrs) {
		for(let key in attrs) {
			el.setAttribute(key, attrs[key]);
		}
  }
  setAttributes(input, {"type": "text", "id": "search_query", "class": "clearable", "placeholder": "Поиск по", "disabled": "disabled"});

	function WaitForConnect() {
		$.ajax({
			type: 'GET',
			url: 'http://176.97.34.40:6064/?command=connect&principal=1',
			// url: 'http://176.97.34.41:6064/?command=connect&principal=1',
			async: true,
			cache: false,
			success: (data) => {
				let json = eval('(' + data + ')');
				WaitForPool(json.root[0].connection);
			},
			error: (XMLHttpRequest, textStatus, errorThrown) => {
				WaitForPool(json.root[0].connection);
			}
		});
	}
	function WaitForPool(id) {
		$.ajax({
			type: 'GET',
			url: 'http://176.97.34.40:6064/?command=receive&connection=' + id,
			// url: 'http://176.97.34.41:6064/?command=receive&connection=' + id,
			async: true,
			cache: false,
			success: (data) => {
				let json  = eval('(' + data + ')');
				let str 	= JSON.stringify(json);
				let slice = JSON.parse(str);

				for (let k in slice.root) {
					if (slice.root[k] instanceof Object) {
						// if (typeof slice.root[k].header == "undefined") continue;
						if (typeof slice.root[k].header == "undefined") continue;
						if (!slice.root[k].header instanceof Object) continue;
						if (slice.root[k].header.type == "33") continue;
						if (slice.root[k].header.type == "34") continue;
						if (slice.root[k].lat == undefined || slice.root[k].lon == undefined) continue;
						if (slice.root[k].lat == 0 || slice.root[k].lon == 0) continue;
						if ((slice.root[k].flag & 32) == 32) continue;

						let idn = slice.root[k].header.id;
						if(global.slices[idn] !== undefined){
							updateSlice.obj = {sls: slice.root[k], latlon: [slice.root[k].lat, slice.root[k].lon]};
							updateSlice.did = idn;
							$(window).trigger(updateSlice);
						}else{
							global.slices[idn] = {sls: slice.root[k], latlon: [slice.root[k].lat, slice.root[k].lon]};
							addSlice.obj = slice.root[k];
							addSlice.did = idn;
							$(window).trigger(addSlice);
						}

						// evt.latlon = [[slice.root[k].lat, slice.root[k].lon]];
						// evt.did = slice.root[k].header.id;
						// if (global.data[evt.did] !== undefined){
						// 	global.data[evt.did].latlon = evt.latlon;
						// }
						// evt.obj = slice.root[k];
						// $(window).trigger(evt);
					}
				}
				WaitForPool(id);
			},
			error: (XMLHttpRequest, textStatus, errorThrown) => {
				WaitForPool(id);
			}
		});
	}
  function resizeMap() {
		scroll(0, 0);
		let header 					= $(".header:visible");
		let footer 					= $(".footer:visible");
		let content 				= $(".content:visible");
		let viewport_height = $(window).height();
		let content_height 	= viewport_height - header.outerHeight() - footer.outerHeight();
				content_height -= (content.outerHeight() - content.height());
				content.height(content_height);
				$("#map_canvas").height(content_height);
  }
	function newsScroll() {																										//scroll
		let info 				= $('.aside').innerHeight();
		let asideHeader = info - $('.aside-header').innerHeight();
		let navTab 			= asideHeader - $('.nav-tabs').innerHeight();
		let max_height  = {
			"max-height": navTab - 15 + 'px',
		};
		$('.feedEkList').css(max_height);
		$('#contact').css(max_height);
	}
  function Map() {
		resizeMap();
		function mapDraw () {
			let cloudmadeUrl 			= 'http://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/{styleId}/256/{z}/{x}/{y}.png';
			// let minimal = new L.tileLayer('http://190.0.0.14/osm_tiles/{z}/{x}/{y}.png', {
			// 	detectRetina: true,
			// 	minZoom: 9
			// });
			let minimal 					= new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
				detectRetina: true,
				minZoom: 9
			});
			let midnightCommander = new L.TileLayer(cloudmadeUrl, {styleId: 999});
			spbCenter 						= new L.LatLng(59.930967, 30.302636);
			map 									= new L.Map('map_canvas', {center: spbCenter, zoom: 10, layers: [minimal, markerOnline]});
			map.setMaxBounds([[59.430967, 29.302636], [60.430967, 31.302636]]);
			let lc 								= L.control.locate().addTo(map);
			let legend 						= L.control({position: 'bottomright'});
			legend.onAdd 					= () => {
				let div = L.DomUtil.create('div', 'info legend legendHide');
				div.innerHTML =
					"<div class='row'>" +
						"<div class='col-2'>" +
							"<div class='col-12'>" +
								"<img src='images/car/square_grey_32.png' width='24' height='24' />" +
							"</div>" +
							"<div class='col-12'>" +
								"<img src='images/car/triangle_grey_32.png' width='24' height='24' />" +
							"</div>" +
							"<div class='col-12'>" +
								"<img src='images/car/circle_grey_32.png' width='24' height='24' />" +
							"</div>" +
							"<div class='col-12'>" +
								"<img src='images/car/circle_t_32.png' width='24' height='24' />" +
							"</div>" +
						"</div>" +
						"<div class='col-10 colHide'>" +
							"<div class='col-12'>" +
								"<p>&nbsp-&nbspМашины для уборки тротуаров</p>" +
							"</div>" +
							"<div class='col-12'>" +
								"<p>&nbsp-&nbspМашины для уборки проезжей части</p>" +
							"</div>" +
							"<div class='col-12'>" +
								"<p>&nbsp-&nbspДругая техника</p>" +
							"</div>" +
							"<div class='col-12'>" +
								"<p>&nbsp-&nbspТреккер&nbsp(для ручной уборки)</p>" +
							"</div>" +
						"</div>" +
					"</div>";
					return div;
			};
			legend.addTo(map);
			let baseMaps 				  = {
				"Карта СПб": minimal,
				"Карта СПб(ночь)": midnightCommander
			};
			let overlayMaps 			= {
				"На линии": markerOnline,
				"В дежурстве": markerOffline,
				"Треккера": markerTrakers
			};
			let layersControl 		= new L.Control.Layers(baseMaps, overlayMaps);
			map.addControl(layersControl);

			map.on('zoomend', () => {
				zoom = map.getZoom();
				console.log('zoom', zoom);
				markerOnline.clearLayers();
				markerOffline.clearLayers();
				bounds = map.getBounds();
				for (let k in global.slices){
					let sls = global.slices[k];
					if(bounds.contains(sls.latlon)){
						addMarkerOnMap(sls.sls, global.data[sls.sls.header.id]);
					}
				}
			});
			map.on('moveend', () => {
				bounds = map.getBounds();
				console.log('bounds', bounds);
				markerOnline.clearLayers();
				markerOffline.clearLayers();
				bounds = map.getBounds();
				for (let k in global.slices){
					let sls = global.slices[k];
					if(bounds.contains(sls.latlon)){
						addMarkerOnMap(sls.sls, global.data[sls.sls.header.id]);
					}
				}
			});
			//Legend  touchstart touchend
			$(".legend").on('mouseover touchstart',(e) => {
				if (e.type != "touchstart"){
					$(".legend").removeClass('legendHide');
					e.stopPropagation();
				} else {
					let hasCl = $('.legend').hasClass('legendHide');
					if (hasCl) {
						$(".legend").removeClass('legendHide');
						e.stopPropagation();
					} else {
						$(".legend").addClass('legendHide');
						e.stopPropagation();
					}
				}
			});
			$('.legend').on('mouseout touchstart', (e) => {
				if (e.type == "touchstart"){
					$('#map_canvas').on('touchstart', (e) => {
						$(".legend").addClass('legendHide');
						e.stopPropagation();
					});
				} else {
					$(".legend").addClass('legendHide');
					e.stopPropagation();
				}
			});

			return WaitForConnect();
		}
		return mapDraw();
  }
	$.ajax({
		url: "/js/info.json",
		success: (data) => {
			for (let k in data.result) {
				if (typeof data.result[k] === 'object') {
					global.data[data.result[k]['did']] = data.result[k];
					carsArray.push(data.result[k]);
				}
			}
			let conId = WaitForConnect();
		}
	});
	function get_function_car(obj, sensors) {
		let arr_FName = new Array();
		obj = obj.car_info || obj;
		let s_fun = "";
		let color = "";

		if (car_Fun[obj.F1_ID] != undefined) {
			arr_FName[0] = car_Fun[obj.F1_ID];
		} else { arr_FName[0] = ""; }
		if (car_Fun[obj.F2_ID] != undefined) {
			arr_FName[1] = car_Fun[obj.F2_ID];
		} else { arr_FName[1] = ""; }
		if (car_Fun[obj.F3_ID] != undefined) {
			arr_FName[2] = car_Fun[obj.F3_ID];
		} else { arr_FName[2] = ""; }
		if (car_Fun[obj.F4_ID] != undefined) {
			arr_FName[3] = car_Fun[obj.F4_ID];
		} else { arr_FName[3] = ""; }

		if ((((sensors & 1024) / 1024) == obj.GB_AL) && (((sensors & 8) / 8) == 1)) {
			if (((sensors & obj.F1_MASK) / obj.F1_MASK) == obj.F1_AL) {
				color = car_Color[obj.F1_ID];
				s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[0] + "</b></span> ";
			} else { s_fun += "<span style='color:grey;'><b>" + arr_FName[0] + "</b></span> " + " "; }
			if (((sensors & obj.F2_MASK) / obj.F2_MASK) == obj.F2_AL) {
				color = car_Color[obj.F2_ID];
				s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[1] + "</b></span> ";
			}
			else { s_fun += "<span style='color:grey;'><b>" + arr_FName[1] + "</b></span> " + " "; }
			if (((sensors & obj.F3_MASK) / obj.F3_MASK) == obj.F3_AL) {
				color = car_Color[obj.F3_ID];
				s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[2] + "</b></span> ";
			}
			else { s_fun += "<span style='color:grey;'><b>" + arr_FName[2] + "</b></span> " + " "; }
			if (((sensors & obj.F4_MASK) / obj.F4_MASK) == obj.F4_AL) {
				color = car_Color[obj.F4_ID];
				s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[3] + "</b></span> ";
			}
			else { s_fun += "<span style='color:grey;'><b>" + arr_FName[3] + "</b></span> " + " "; }
		}
		else {
			s_fun = arr_FName[0] + " " + arr_FName[1] + " " + arr_FName[2] + " " + arr_FName[3];
		}
		return s_fun;
	}
	function getIcon(vehicleInfo, obj) {
		let color 			 = getFunColor(obj, vehicleInfo),
				imgType 		 = vehicleInfo['imgType'],
				imgPath 		 = 'images/car/' + imgType + color + '_32.png';
				return L.icon({iconUrl: imgPath, iconSize: [32, 32], iconAnchor: [16, 16]});
	}
	function addMarkerOnMap(obj, car_info) {
		let idn = obj.header.id,
				eP =  L.latLng(obj.lat, obj.lon),
				sP =  L.latLng(global.slices[idn].latlon),
			  lZoom = map.getZoom();
		if(car_info === undefined) return;
		let func 				 = get_function_car(car_info, obj.sensors),
				greenIcon 	 = getIcon(car_info, obj),
		 		movingMarker;

		movingMarker = L.Marker.movingMarker([eP,eP], [], {title: car_info.nc, icon: greenIcon});

		marker[obj.header.id] = {'m_move': movingMarker};

		pupuptext = "<p><b>Тип: </b>" + car_info['job'] + "</br>" +
								"<b>Предприятие: </b>" + car_info['vgn'] + "</br>" +
								"<b>Автоколонна: </b>" + car_info['acn'] +"</br>" +
								"<b>Гаражный номер: </b>" + car_info.nc + "</br>" +
								"<b>Марка: </b>" + car_info['bn'] + "</br>" +
								"<b>Функция: </b>" + func + "</br>" +
								"<b>Скорость: </b>" + obj.speed + "(км/ч)</p>";
		marker[obj.header.id].m_move.bindPopup(pupuptext);

		if (((obj.sensors & car_info.GB_MASK) / car_info.GB_MASK) === car_info.GB_AL &&
			((obj.sensors & 8) / 8) == 1) {
			markerOnline.addLayer(movingMarker);
		} else {
			markerOffline.addLayer(movingMarker);
		}
	}
	function getDuration(t1, t2) {
		return (new Date(t2) - new Date(t1))/* * 1.5*/;
	}
	function updateMarkerOnMap(obj, car_info) {
		if(car_info === undefined) return;
		let idn 	= obj.sls.header.id,
			 	slice = global.slices[idn].sls;

		if(slice.sensors !== obj.sls.sensors  ){
			let greenIcon = getIcon(car_info, obj);
			marker[idn].m_move.setIcon(greenIcon);
		}
		if(map.getZoom() >= 15 ){
			if(marker[idn].m_move.isStarted()){
				marker[idn].m_move.addLatLng(obj.latlon, getDuration(slice.time, obj.sls.time));
				if(marker[idn].m_move.isEnded()){
					marker[idn].m_move.moveTo(obj.latlon, getDuration(slice.time, obj.sls.time));
					marker[idn].m_move.start();
				}
			} else {
				marker[idn].m_move.moveTo(obj.latlon, getDuration(slice.time, obj.sls.time));
				marker[idn].m_move.start();
			}
		}else{
			marker[idn].m_move.setLatLng(obj.latlon);
		}

		global.slices[idn] = obj;
	}
	function getFunColor(obj, car_info) {
		let c = null;
		if (((obj.sensors & car_info.GB_MASK) / car_info.GB_MASK) === car_info.GB_AL && //Если включена масса
			((obj.sensors & 8) / 8) === 1) { //и если включено зажигание
			if ((car_info.F1_MASK !== "") &&
				(((obj.sensors & car_info.F1_MASK) / car_info.F1_MASK) === car_info.F1_AL)) {
				c = car_imgColor[car_info.F1_ID];
			}
			else if ((car_info.F2_MASK !== "") &&
				(((obj.sensors & car_info.F2_MASK) / car_info.F2_MASK) === car_info.F2_AL)) {
				c = car_imgColor[car_info.F2_ID];
			}
			else if ((car_info.F3_MASK !== "") &&
				(((obj.sensors & car_info.F3_MASK) / car_info.F3_MASK) === car_info.F3_AL)) {
				c = car_imgColor[car_info.F3_ID];
			}
			else if ((car_info.F4_MASK !== "") &&
				(((obj.sensors & car_info.F4_MASK) / car_info.F4_MASK) === car_info.F4_AL)) {
				c = car_imgColor[car_info.F4_ID];
			} else {
				c = "white";
			}
		} else {
			c = "grey";
		}
		return c;
	}
	// function startMarkerTo(e) {
	// 	marker[e.did].m_move.start();
	// 	if (marker[e.did].m_move.isStarted() == false) {
	// 		marker[e.did].m_move.moveTo(global.data[e.did].latlon[0], (e.obj.speed * 2000));
	// 	} else {
	// 		let latlng = L.latLng(e.latlon[0], e.latlon[1]);
	// 		if (marker[e.did].m_move._latlng.distanceTo(latlng) <= 2000) {
	// 			marker[e.did].m_move.addLatLng(e.latlon[0], (e.obj.speed * 2000));
	// 		}
	// 	}
	// }
	function searchAddress() {
		$('#search_query').autocomplete({
			appendTo: '.col-middle',
			source: (request, response) => {
				$.ajax({
					url: "http://190.0.0.14/nominatim/search",
					cache: true,
					method: "GET",
					data: {
						q: 'Санкт-Петербург, ' + request.term,
						format: 'json',
						limit: 10,
					},
					success: (data) => {
						response($.map(data, (item) => {
							return {
								value: item.display_name.split(',', 6),
								latitude: item.lat,
								longitude: item.lon
							}
						}));
						$('#progressbar').hide();
					}
				});
			},
			select: (event, point) => {
				let lat = point.item.latitude,
					lon = point.item.longitude;
				markerSearch = {lat, lon};
				map.setView(markerSearch, 18);
				let dot = L.marker(markerSearch).addTo(map);
				$('#search_clear a').click(() => {
					if (dot != undefined) {
						map.removeLayer(dot);
					}
				});
			},
			search: () => {
				$('#progressbar').show();
			}
		});
	}
	function searchCar() {
		$('#search_query').autocomplete({
			appendTo: '.col-middle',
			source: (request, response) => {
				let re = $.ui.autocomplete.escapeRegex(request.term);
				let matcher = new RegExp(re, "ig");
				response($.grep(($.map(carsArray, (v, i) => {
					return {
						label: [v.nc + " " + "(" + v.bn + ", " + v.mn + ", " + v.vgn + ", " + v.acn + ")"],
						value: [v.nc + " " + "(" + v.bn + ", " + v.mn + ", " + v.vgn + ", " + v.acn + ")"],
						did: v.did
					};
				})), (item) => {
					return matcher.test(item.value);
				}));
				$('#progressbar').hide();
			},
			select: (event, point) => {
				map.setView(marker[point.item.did].m_move._latlng, 18);
				marker[point.item.did].m_move.openPopup(marker[point.item.did].m_move._latlng);
			},
			search: () => {
				$('#progressbar').show();
			}
		});
	}
	function focusPlaceholder() {
		let int = $('#search_query');
		int.focus();
		int.removeAttr('placeholder');
	}
	$(() => {
		$("#search_query").addClear();

		if ($('#profile').is(":visible") == true){
			$('.search-input').removeAttr('data-target');
		}

		$('#profile').change(() => {
			if ($('#profile option').eq([1,2]).prop('selected',true)){
				$('input[type="text"]').prop('disabled', false).val('');
				$('#search_clear a').css('display', 'none');
			}
			$('#search_clear a').click(() => {
				$('#profile option').eq([0]).prop('selected',true);
				$('input[type="text"]').prop('disabled', true);
			});

			let that = parseInt($('#profile').val(), 10);
			switch (that) {
				case 1:
					searchAddress();
					focusPlaceholder();
					break;
				case 2:
					searchCar();
					focusPlaceholder();
					break;
			}
		});

		$('.modal-body').change(() => {
			let inpSearch = $('input[type="text"]');
			if ($('#address').is(':checked', true)){
				let hideDis = inpSearch.prop('disabled', false);
				if (hideDis){
					$('.search-input').removeAttr('data-target');
				}
				searchAddress();
			}
			if ($('#object').is(':checked', true)){
				let hideDis = inpSearch.prop('disabled', false);
				if (hideDis){
					$('.search-input').removeAttr('data-target');
				}
				searchCar();
			}
		});

		$('#search_clear a').click((e) => {
			if ($('#profile').is(":visible") == false) {
				$('input[type="text"]').prop('disabled', true);
				$('.search-input').attr('data-target', '#searchModal');
				e.stopPropagation();
			}
			$('#search_query').prop('placeholder', 'Поиск по');
		});
	});
	$(window).resize(() => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(resizeMap(), 100);
		$('.feedEkList').css('max-height', '');
		$('#contact').css('max-height', '');
		newsScroll();
	});
	$(window).on('onAddSlice', (e) => {
		addMarkerOnMap(e.obj, global.data[e.did]);
	});
	$(window).on('onUpdateSlice', (e) => {
		updateMarkerOnMap(e.obj, global.data[e.did]);
	});

		// $(window).on('startpoint', (e) => {
		// console.log('e', e);
	// 	if (global.data[e.did] === undefined) return;
	// 	if (global.data[e.did]['imgType'] === undefined) return;
	//
	// 	color 		= getFunColor(e.obj, global.data[e.did]);
	// 	func 			= get_function_car(global.data[e.did], e.obj.sensors);
	// 	imgType 	= global.data[e.did]['imgType'];
	// 	imgPath 	= 'images/car/' + imgType + color + '_32.png';
	// 	greenIcon = L.icon({iconUrl: imgPath, iconSize: [32, 32],	iconAnchor: [16, 16]});
	//
	// 	if (marker[e.did] !== undefined) {
	// 		if (zoom === 15 || zoom > 15) {
	// 			startMarkerTo(e);
	// 			return;
	// 		} else {
	// 			marker[e.did].m_move.setLatLng(e.latlon[0]);
	// 			return;
	// 		}
	// 	}
	//
	// 	movingMarker = L.Marker.movingMarker(global.data[e.did].latlon, [], {title: global.data[e.did].nc, icon: greenIcon});
	// 	movingMarker.obj = e.obj;
	// 	marker[e.did] = {'m_move': movingMarker};
	// 	getSensor(movingMarker, global.data[e.did]);
	// 	let displayedArray;
	// 	if (bounds) {
	// 		if (zoom === 15 || zoom > 15) {
	// 			// markerOnline.clearLayers();
	//
	// 		}
	// 		displayedArray = marker.filter((el) => {
	// 			let latlng = el.m_move._latlng;
	// 			return latlng.lat <= bounds._northEast.lat && latlng.lat >= bounds._southWest.lat &&
	// 						 latlng.lng <= bounds._northEast.lng && latlng.lng >= bounds._southWest.lng;
	// 		});
	// 		// console.log(displayedArray);
	// 	}
	// 	let listIdDisp = [];
	//
	// 	for(let j in displayedArray){
	// 		listIdDisp.push(displayedArray[j].m_move.obj.header.id)
	// 	}
	//
	// 	for(let k in marker){
	// 		let idm = marker[k].m_move.obj.header.id;
	// 		 if(listIdDisp.indexOf(idm) === -1){
	// 				// marker = [];
	// 		 } else {
	// 			 // marker = [];
	// 		 }
	// 	}
	//
	// 	// pupuptext = "<p><b>Тип: </b>" + global.data[e.did]['job'] + "</br>" +
	// 	// 	"<b>Предприятие: </b>" + global.data[e.did]['vgn'] + "</br>" +
	// 	// 	"<b>Автоколонна: </b>" +global.data[e.did]['acn'] +"</br>" +
	// 	// 	"<b>Гаражный номер: </b>" + global.data[e.did].nc + "</br>" +
	// 	// 	"<b>Марка: </b>" + global.data[e.did]['bn'] + "</br>" +
	// 	// 	"<b>Функция: </b>" + func + "</br>" +
	// 	// 	"<b>Скорость: </b>" + e.obj.speed + "(км/ч)</p>";
	// 	// marker[e.did].m_move.bindPopup(pupuptext);
	// });
  $('.col-right').click(() => {
		newsScroll();
		if ($(".aside").hasClass("in")) {
			$('.aside').asidebar('close')
		} else {
			$('.aside').asidebar('open')
		}
  });
	$('#news').FeedEk({
		FeedUrl:'http://gov.spb.ru/gov/otrasl/blago/news/rss/',
		MaxCount: 10,
		ShowDesc: true,
		ShowPubDate: true,
		DescCharacterLimit: 100
	});
	$("#progressbar").progressbar({
		value: false
	});
	$('.search-input').on('click touchstart', (e) => {
		if (e.type == "touchstart"){
			$('.search-input').load({
				keyboard: false,
				backdrop: 'static'
			});
			e.stopPropagation();
		}
	});
	$('.modal-footer__button').click(() => {
		focusPlaceholder();
	});
	return Map();
});
