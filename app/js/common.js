'use strict';

$(document).ready( () => {

	let car_imgColor = new Array();
	car_imgColor[1] = "black"; car_imgColor[2] = "lilac";
	car_imgColor[3] = "light_blue"; car_imgColor[4] = "red";
	car_imgColor[5] = "orange"; car_imgColor[6] = "blue";
	car_imgColor[7] = "green"; car_imgColor[8] = "light_green";
	car_imgColor[9] = "light_blue"; car_imgColor[10] = "yellow";
	car_imgColor[11] = "lilac"; car_imgColor[12] = "brown";
	car_imgColor[13] = "yellow"; car_imgColor[14] = "lemon";//car_imgColor[15] = "white";
	car_imgColor[15] = "violet"; car_imgColor[16] = "t";

	let car_Fun = new Array();
	car_Fun[1] = "ПГ"; car_Fun[2] = "ССВ";
	car_Fun[3] = "М"; car_Fun[4] = "РТ";
	car_Fun[5] = "РУ"; car_Fun[6] = "ПМ";
	car_Fun[7] = "ПУ"; car_Fun[8] = "В";
	car_Fun[9] = "Щ"; car_Fun[10] = "П";
	car_Fun[11] = "Б"; car_Fun[12] = "РЖ";
	car_Fun[13] = "Т"; car_Fun[14] = "Р"; car_Fun[15] = "К"; car_Fun[16] = "ПР";

	let car_Color = new Array();
	car_Color[1] = "black"; car_Color[2] = "#9B30FF";
	car_Color[3] = "turquoise"; car_Color[4] = "red";
	car_Color[5] = "orange"; car_Color[6] = "blue";
	car_Color[7] = "green"; car_Color[8] = "lime";
	car_Color[9] = "#00D5D5"; car_Color[10] = "yellow";
	car_Color[11] = "#FF6A00"; car_Color[12] = "brown";
	car_Color[13] = "yellow"; car_Color[14] = "green";
	car_Color[15] = "grey"; car_Color[16] = "green"; car_Color[14] = "C3F266"; car_Color[15] = "violet";

	let global = {data: new Array()};
	let evt = $.Event('startpoint');
	let marker = [];

  let input = document.createElement('input', '');
  $('#search_clear').append(input);

  function setAttributes(el, attrs) {
		for(let key in attrs) {
			el.setAttribute(key, attrs[key]);
		}
  }

  setAttributes(input, {"type": "text", "id": "search_query", "class": "clearable",  "placeholder": "Поиск по"});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

	// let successCallback = function (data) {
	//
	// 	let size = 32;
	// 	if (L.Browser.touch) size = 32;
	// 	let greenIcon = L.icon({
	// 		iconUrl: 'images/car/circle_ya_32.png',
	// 		iconSize: [size, size], // size of the icon
	// 	});
	//
	// 	L.marker([data.coords.latitude, data.coords.longitude], { icon: greenIcon }).addTo(map);
	// 	map.panTo(L.latLng(data.coords.latitude, data.coords.longitude), 16);
	// 	//map.setZoom(16);
	// 	//console.log('latitude: ' + data.coords.latitude + ' longitude: ' + data.coords.longitude);
	// };
	//
	// let failureCallback = function () {
	// 	console.log('location failure :(');
	// };
	//
	// let logLocation = function () {
	//
	// 	if (navigator.geolocation) {
	// 		navigator.geolocation.getCurrentPosition(successCallback, failureCallback);
	// 	}
	// 	else {
	// 		alert("Functionality not available");
	// 	}
	// };
	//
	function WaitForConnect() {

		$.ajax({
			type: 'GET',
			url: 'http://176.97.34.40:6064/?command=connect&principal=1',
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
			async: true,
			cache: false,
			success: function (data) {
				let json = eval('(' + data + ')');
				let str = JSON.stringify(json);
				let slice = JSON.parse(str);

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
				WaitForPool(id);
			},
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				WaitForPool(id);
			}
		});
	}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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

		let map,
			marker,
			spbCenter,
			resizeTimer;

		$(window).resize(() => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(resizeMap, 100);
		});

		function mapDraw () {
			let pointLayer = new L.FeatureGroup();
			let cloudmadeUrl = 'http://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/{styleId}/256/{z}/{x}/{y}.png';
			let minimal = new L.tileLayer('http://190.0.0.14/osm_tiles/{z}/{x}/{y}.png', {
				detectRetina: true
			});
			let midnightCommander = new L.TileLayer(cloudmadeUrl, {styleId: 999});
			spbCenter = new L.LatLng(59.930967, 30.302636);
			map = new L.Map('map_canvas', {center: spbCenter, zoom: 11, layers: [minimal, /*motorways,*/ pointLayer]});
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
			map.addControl(layersControl);
		}

		let carDraw = () => {
			$.ajax({
				url: "/js/info.json",
				success: function (data) {
					for (let k in data.result) {
						if (typeof data.result[k] === 'object') {
							global.data[data.result[k]['did']] = data.result[k];
						}
					}
					let conId = WaitForConnect();
				}
			});
			// function get_function_car(obj, sensors) {
			// 	let arr_FName = new Array();
			// 	obj = obj.car_info || obj;
			// 	let s_fun = "";
			// 	let color = "";
			//
			// 	if (car_Fun[obj.F1_ID] != undefined) {
			// 		arr_FName[0] = car_Fun[obj.F1_ID];
			// 	} else { arr_FName[0] = ""; }
			// 	if (car_Fun[obj.F2_ID] != undefined) {
			// 		arr_FName[1] = car_Fun[obj.F2_ID];
			// 	} else { arr_FName[1] = ""; }
			// 	if (car_Fun[obj.F3_ID] != undefined) {
			// 		arr_FName[2] = car_Fun[obj.F3_ID];
			// 	} else { arr_FName[2] = ""; }
			// 	if (car_Fun[obj.F4_ID] != undefined) {
			// 		arr_FName[3] = car_Fun[obj.F4_ID];
			// 	} else { arr_FName[3] = ""; }
			//
			// 	if ((((sensors & 1024) / 1024) == obj.GB_AL) && (((sensors & 8) / 8) == 1)) {
			// 		if (((sensors & obj.F1_MASK) / obj.F1_MASK) == obj.F1_AL) {
			// 			color = car_Color[obj.F1_ID];
			// 			s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[0] + "</b></span> ";
			// 		} else { s_fun += "<span style='color:grey;'><b>" + arr_FName[0] + "</b></span> " + " "; }
			// 		if (((sensors & obj.F2_MASK) / obj.F2_MASK) == obj.F2_AL) {
			// 			color = car_Color[obj.F2_ID];
			// 			s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[1] + "</b></span> ";
			// 		}
			// 		else { s_fun += "<span style='color:grey;'><b>" + arr_FName[1] + "</b></span> " + " "; }
			// 		if (((sensors & obj.F3_MASK) / obj.F3_MASK) == obj.F3_AL) {
			// 			color = car_Color[obj.F3_ID];
			// 			s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[2] + "</b></span> ";
			// 		}
			// 		else { s_fun += "<span style='color:grey;'><b>" + arr_FName[2] + "</b></span> " + " "; }
			// 		if (((sensors & obj.F4_MASK) / obj.F4_MASK) == obj.F4_AL) {
			// 			color = car_Color[obj.F4_ID];
			// 			s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[3] + "</b></span> ";
			// 		}
			// 		else { s_fun += "<span style='color:grey;'><b>" + arr_FName[3] + "</b></span> " + " "; }
			// 	}
			// 	else {
			// 		s_fun = arr_FName[0] + " " + arr_FName[1] + " " + arr_FName[2] + " " + arr_FName[3];
			// 	}
			// 	return s_fun;
			// }
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
					}
					else {
						c = "white";
					}
				} else {
					c = "grey";
				}
				return c;
			}

			$(window).on('startpoint', function (e) {
				// if (global.data[e.did] === undefined) return;
				// if (global.data[e.did]['imgType'] === undefined) return;
				let color, func, imgType, myMovingMarker, greenIcon, imgPath;
				color = getFunColor(e.obj, global.data[e.did]);
				// func = get_function_car(global.data[e.did], e.obj.sensors);
				imgType = global.data[e.did]['imgType'];
				imgPath = 'images/car/' + imgType + color + '_32.png';
				greenIcon = L.icon({iconUrl: imgPath, iconSize: [32, 32]});
				if (marker[e.did] !== undefined) {
					startMarkerTo(e);
					return;
				}
				myMovingMarker = L.Marker.movingMarker(e.latlon,
					[], {icon: greenIcon}).addTo(map);
				//
				// let pupuptext = "<p><b>Тип: </b>" + global.data[e.did]['job'] + "</br>" +
				// 	//"<b>Предприятие: </b>" + global.data[e.did]['vgn'] + "</br>" +
				// 	//"<b>Автоколонна: </b>" +global.data[e.did]['acn'] +"</br>" +
				// 	"<b>Марка: </b>" + global.data[e.did]['bn'] + "</br>" +
				// 	"<b>Функция: </b>" + func + "</br>" +
				// 	"<b>Скорость: </b>" + e.obj.speed + "(км/ч)</p>";
				//
				// JSON.stringify(global.data[e.did]);
				// marker[e.did] = { 'm_move': myMovingMarker, 'time': 1 };
				// marker[e.did].m_move.bindPopup(pupuptext);
			});
			return carDraw();
		};

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
				marker = {lat, lon};
				map.setView(marker, 18);
				let dot = L.marker(marker).addTo(map);
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

	$( "#progressbar" ).progressbar({
		value: false
	});

  return Map();

});
