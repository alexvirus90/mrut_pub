'use strict';

let carsArray 	 = [],
	 	global 			 = {data: [],slices: []};
	  // addSlice     = $.Event('onAddSlice'),
		// updateSlice  = $.Event('onUpdateSlice');
let webSocket,
		test;

let map, _marker, mrkSearch, spbCntr, resizeTimer;
// let zoom, bounds;

let	mrkOn  = new L.LayerGroup(),
		mrkOff = new L.LayerGroup();
		// markerTrakers = new L.layerGroup(),
		// markerhide 		= new L.layerGroup();

let options = {};
let data 		 = new vis.DataSet(options),
		dataInfo = new vis.DataSet(options),
		tAr			 = new vis.DataSet(options);

$(document).ready( () => {

	/*window.onerror = function(message, url, lineNumber) {
		console.log("Поймана ошибка, выпавшая в глобальную область!\n" +
			"Сообщение: " + message + "\n(" + url + ":" + lineNumber + ")");
	};*/

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

	car_Fun[1] = "Погрузчики";
	car_Fun[2] = "Самосвалы и МСК";
	car_Fun[3] = "Мусоровозы";
	car_Fun[4] = "Распределители твердых реагентов";
	car_Fun[5] = "Распределители твердых реагентов с увлажнением";
	car_Fun[6] = "Поливомоечное оборудование";
	car_Fun[7] = "Подметально-уборочное оборудование (механическое)";
	car_Fun[8] = "Вакуумное оборудование";
	car_Fun[9] = "Щеточное оборудование (на автомобильном шасси)";
	car_Fun[10] = "Плужное оборудование (на автомобильном шасси)";
	car_Fun[11] = "Бульдозеры";
	car_Fun[12] = "Распределители жидких реагентов";
	car_Fun[13] = "Тягач (для уборочной техники)";
	car_Fun[15] = "Контроль";
	car_Fun[16] = "Ручная уборка";

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
	$('#search').append("<a href='#' class='closed'><i class='fa fa-times'></i></a>");

	function setAttr(el, attrs) {
		for(let key in attrs) {
			el.setAttribute(key, attrs[key]);
		}
	}
	setAttr(input, {"type": "text", "id": "search_query", "class": "address clearable", "placeholder": "Поиск по адресу"});

	$.ajax({
		url: "/js/info.json",
		dataType: 'json'
	})
		.done((data) => {
			dataInfo.add(data.result);
			for (let k in dataInfo._data) {
				if (typeof dataInfo._data[k] === 'object') {
					global.data[dataInfo._data[k]['did']] = dataInfo._data[k];
					carsArray.push(dataInfo._data[k]);
				}
			}
			WaitForPool();
		})
		.fail((jqXHR, textStatus, errorThrown) => {
			// modEr(jqXHR, textStatus, errorThrown);
		});
	function WaitForPool() {

		let	t1 = 'wss://mrut-test2.adc.spb.ru/wstele1/',
				t2 = 'wss://mrut-test2.adc.spb.ru/wstele2/'/*,
				t3 = 'ws://190.0.0.201:8080'*/;

	/*	webSocket = new WebSocket(t2);

		webSocket.onopen = function() {
			console.log("Соединение установлено.");
		};
		webSocket.onclose = function(event) {
			if (event.wasClean) {
				console.log('Соединение закрыто чисто');
			} else {
				console.log('Обрыв соединения'); // например, "убит" процесс сервера
			}
			console.log('Код: ' + event.code + ' причина: ' + event.reason);
		};
		webSocket.onmessage = function(messg) {
			let msg = JSON.parse(messg.data);
			let obj 	= global.data[msg.BlockNumber],
				item1 = data.get(msg.BlockNumber),
				coords = new L.latLng(msg.latitude, msg.longitude);

			if (obj == undefined) return;
			if (msg.header.type == "33") return;
			if (msg.header.type == "34") return;
			if (msg.latitude == undefined || msg.longitude == undefined) return;
			if (msg.latitude == 0 || msg.longitude == 0) return;
			if ((msg.route & 32) == 32) return;
			if (msg.Version == 7179) return;

			if(item1 != null){

				let dur = getDurat(item1.sls.unit_time, msg.unit_time),
					сIcon  = getIcon(obj, msg);
				_marker = item1.mO;
				if(_marker._latlngs.length > 5){
					_marker._latlngs.shift();
				}
				// _marker.addLatLng( coords, dur);
				data.update({id: msg.BlockNumber, mO: _marker, sls: msg, obj: obj, latlon: coords});
				if(dur >= 100000 && ((item1.sls.sensors & 8) / 8) == 1 && (Math.round(item1.sls.speed)) >= 10) {
					console.log( msg.BlockNumber, '|',
						item1.mO.options.title, '|',
						item1.sls.sensors, '|',
						(Math.round(item1.sls.speed * 1) / 1) + 'км/ч', '|',
						dur / 1000 + 'c');
					let rem = _marker.remove();
					// tAr.add(_marker);
					// let it = tAr.get({
					// 	fields: ['options']
					// });
					// console.log('it', it);
					if (rem){
						_marker.addLatLng(coords, dur);
						console.log('remove');
					} else {
						console.log('not remove');
					}
				}
				if(map.getBounds().contains(coords)) {
					if(map.getZoom() >= 14 ) {
						_marker.moveTo(coords, dur);
						_marker.start();
					} else {
						_marker.setLatLng(coords, dur);
					}
				}
				_marker._popup.setContent("<div><b>Тип: </b>" + obj['job'] + "</br>" +
					"<b>Предприятие: </b>" + obj['vgn'] + "</br>" +
					"<b>Автоколонна: </b>" + obj['acn'] +"</br>" +
					"<b>Гаражный номер: </b>" + obj.nc + "</br>" +
					"<b>Марка: </b>" + obj['bn'] + "</br>" +
					"<b class='name'>Функция:</b>" + "<div class='func'>" +  getFuncCar(obj, msg.sensors) + "</div>" + "</br>" +
					"<b>Скорость: </b>" + Math.round(item1.sls.speed) + " км/ч</div>");
			} else {
				let func 	 = getFuncCar(obj, msg.sensors),
					сIcon  = getIcon(obj, msg),
					marker = L.Marker.movingMarker([coords, coords], [], {title: obj.nc, icon: сIcon});

				let popUp =
					"<div><b>Тип: </b>" + obj['job'] + "</br>" +
					"<b>Предприятие: </b>" + obj['vgn'] + "</br>" +
					"<b>Автоколонна: </b>" + obj['acn'] +"</br>" +
					"<b>Гаражный номер: </b>" + obj.nc + "</br>" +
					"<b>Марка: </b>" + obj['bn'] + "</br>" +
					"<b class='name'>Функция:</b>" + "<div class='func'>" +  func + "</div>" + "</br>" +
					"<b>Скорость: </b>" + Math.round(msg.speed) + " км/ч</div>";
				if (((msg.sensors & obj.GB_MASK) / obj.GB_MASK) === obj.GB_AL &&
					((msg.sensors & 8) / 8) == 1) {
					mrkOn.addLayer(marker);
				} else {
					mrkOff.addLayer(marker);
				}
				data.add([{
					id: msg.BlockNumber,
					mO: marker.bindPopup(popUp),
					sls: msg,
					obj: obj,
					latlon: coords
				}]);
			}
		};
		webSocket.onerror = function(error) {
			console.log("Ошибка " + error.message);
		};*/

		webSocket = $.simpleWebSocket({
			url: t2,
			attempts: 2
		});
		webSocket.listen((msg) => {
			let obj 	= global.data[msg.BlockNumber],
					item1 = data.get(msg.BlockNumber),
					coords = new L.latLng(msg.latitude, msg.longitude);

			if (obj == undefined) return;
			if (msg.header.type == "33") return;
			if (msg.header.type == "34") return;
			if (msg.latitude == undefined || msg.longitude == undefined) return;
			if (msg.latitude == 0 || msg.longitude == 0) return;
			if ((msg.route & 32) == 32) return;
			if (msg.Version == 7179) return;

			if(item1 != null){

				let dur = getDurat(item1.sls.unit_time, msg.unit_time),
					сIcon  = getIcon(obj, msg);
				_marker = item1.mO;
				if(_marker._latlngs.length > 5){
					_marker._latlngs.shift();
				}
				// _marker.addLatLng( coords, dur);
				data.update({id: msg.BlockNumber, mO: _marker, sls: msg, obj: obj, latlon: coords});
				if(dur >= 100000 && ((item1.sls.sensors & 8) / 8) == 1 && (Math.round(item1.sls.speed)) >= 10) {
					/*console.log( msg.BlockNumber, '|',
						item1.mO.options.title, '|',
						item1.sls.sensors, '|',
						(Math.round(item1.sls.speed * 1) / 1) + 'км/ч', '|',
						dur / 1000 + 'c');*/
					let rem = _marker.remove();
					// tAr.add(_marker);
					// let it = tAr.get({
					// 	fields: ['options']
					// });
					// console.log('it', it);
					if (rem){
						_marker.addLatLng(coords, dur);
						// console.log('remove');
					} /*else {
						console.log('not remove');
					}*/
				}
				if(map.getBounds().contains(coords)) {
					if(map.getZoom() >= 14 ) {
						_marker.moveTo(coords, dur);
						_marker.start();
					} else {
						_marker.setLatLng(coords, dur);
					}
				}
				_marker._popup.setContent("<div><b>Тип: </b>" + obj['job'] + "</br>" +
					"<b>Предприятие: </b>" + obj['vgn'] + "</br>" +
					"<b>Автоколонна: </b>" + obj['acn'] +"</br>" +
					"<b>Гаражный номер: </b>" + obj.nc + "</br>" +
					"<b>Марка: </b>" + obj['bn'] + "</br>" +
					"<b class='name'>Функция:</b>" + "<div class='func'>" +  getFuncCar(obj, msg.sensors) + "</div>" + "</br>" +
					"<b>Скорость: </b>" + Math.round(item1.sls.speed) + " км/ч</div>");
			} else {
				let func 	 = getFuncCar(obj, msg.sensors),
					сIcon  = getIcon(obj, msg),
					marker = L.Marker.movingMarker([coords, coords], [], {title: obj.nc, icon: сIcon});

				let popUp =
					"<div><b>Тип: </b>" + obj['job'] + "</br>" +
					"<b>Предприятие: </b>" + obj['vgn'] + "</br>" +
					"<b>Автоколонна: </b>" + obj['acn'] +"</br>" +
					"<b>Гаражный номер: </b>" + obj.nc + "</br>" +
					"<b>Марка: </b>" + obj['bn'] + "</br>" +
					"<b class='name'>Функция:</b>" + "<div class='func'>" +  func + "</div>" + "</br>" +
					"<b>Скорость: </b>" + Math.round(msg.speed) + " км/ч</div>";
				if (((msg.sensors & obj.GB_MASK) / obj.GB_MASK) === obj.GB_AL &&
					((msg.sensors & 8) / 8) == 1) {
					mrkOn.addLayer(marker);
				} else {
					mrkOff.addLayer(marker);
				}
				data.add([{
					id: msg.BlockNumber,
					mO: marker.bindPopup(popUp),
					sls: msg,
					obj: obj,
					latlon: coords
				}]);
			}
		});

	}
	function rsM() {				//resizeMap
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
	function nsScrl() {																										//scroll
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
		rsM();
		function mapDraw () {
			let cloudUrl = 'https://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/{styleId}/256/{z}/{x}/{y}.png';
			let day 		 = new L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				detectRetina: true,
				minZoom: 9
			});
			let night  	 = new L.TileLayer(cloudUrl, {styleId: 999});
			spbCntr 	   = new L.LatLng(59.930967, 30.302636);
			map 			   = new L.Map('map_canvas', { center: spbCntr, zoom: 10, layers: [day, mrkOn]});
			map.setMaxBounds([[59.430967, 29.302636], [60.430967, 31.302636]]);
			let fs     = L.control.fullscreen({ position: 'topleft'}).addTo(map);			//fullscreen button
			let lc 		 = L.control.locate().addTo(map);															//geolocation
			let lgnd 	 = L.control({position: 'bottomright'});											//the location of the legend
			lgnd.onAdd = () => {
				let div = L.DomUtil.create('div', 'info legend legendHide');
				div.innerHTML =
					"<div class='row mrg'>" +
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
								"<p>&nbsp-&nbspТрекер&nbsp(для ручной уборки)</p>" +
							"</div>" +
						"</div>" +
					"</div>";
					return div;
			};
			lgnd.addTo(map);
			let baseMaps = {
				"Карта СПб": day,
				"Карта СПб(ночь)": night
			};
			let overlayMaps 			= {
				"На линии": mrkOn,
				"На дежурстве": mrkOff,
				// "Трекера": markerTrakers
			};
			let layersControl 		= new L.Control.Layers(baseMaps, overlayMaps);
			map.addControl(layersControl);
			map.on('zoomend', () => {
				let zoom = map.getZoom();
				console.log('zoom', zoom);
				mrkOn.clearLayers();
				mrkOff.clearLayers();
				data.forEach((row) => {
					let sls = row.sls,
							obj = row.obj,
							latlon = new L.LatLng(sls.latitude, sls.longitude);
					if(map.getBounds().contains(latlon)){
						if (((sls.sensors & obj.GB_MASK) / obj.GB_MASK) === obj.GB_AL &&
							((sls.sensors & 8) / 8) == 1) {
							mrkOn.addLayer(row.mO);
						} else {
							mrkOff.addLayer(row.mO);
						}
					}
				});
			});
			map.on('moveend', () => {
				data.forEach((row) => {
					let sls = row.sls,
							obj = row.obj,
							latlon = row.latlon;
					if(map.getBounds().contains(latlon)){
						if (((sls.sensors & obj.GB_MASK) / obj.GB_MASK) === obj.GB_AL &&
							((sls.sensors & 8) / 8) == 1) {
							mrkOn.addLayer(row.mO);
						} else {
							mrkOff.addLayer(row.mO);
						}
					}
				});
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
			// return WaitForConnect();
		}
		return mapDraw();
	}
	function getFuncCar(obj, sensors) {
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
				s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[0] + "</b></span> " + "<br />";
			} else { s_fun += "<span style='color:grey;'><b>" + arr_FName[0] + "</b></span> " + " "; }
			if (((sensors & obj.F2_MASK) / obj.F2_MASK) == obj.F2_AL) {
				color = car_Color[obj.F2_ID];
				s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[1] + "</b></span> " + "<br />";
			}	else { s_fun += "<span style='color:grey;'><b>" + arr_FName[1] + "</b></span> " + " "; }
			if (((sensors & obj.F3_MASK) / obj.F3_MASK) == obj.F3_AL) {
				color = car_Color[obj.F3_ID];
				s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[2] + "</b></span> " + "<br />";
			} else { s_fun += "<span style='color:grey;'><b>" + arr_FName[2] + "</b></span> " + " "; }
			if (((sensors & obj.F4_MASK) / obj.F4_MASK) == obj.F4_AL) {
				color = car_Color[obj.F4_ID];
				s_fun += "<span style='color:" + color + ";'><b>" + arr_FName[3] + "</b></span> " + "<br />";
			} else { s_fun += "<span style='color:grey;'><b>" + arr_FName[3] + "</b></span>"; }
		} else {
			s_fun = arr_FName[0] + " " + arr_FName[1] + " " + arr_FName[2] + " " + arr_FName[3];
		}
		return s_fun;
	}
	function getIcon(vehicleInfo, obj) {
		let imgType = vehicleInfo['imgType'],
				color = getFunColor(obj, vehicleInfo),
				imgPath;

		imgPath = 'images/car/' + imgType + color + '_32.png';
		return L.icon({iconUrl: imgPath, iconSize: [32, 32], iconAnchor: [16, 16]});
	}
	function getDurat(t1, t2) {
		let newDate1 = t1.replace((new RegExp('-','g'),'/'), (new RegExp('T'),' '));
		let newDate2 = t2.replace((new RegExp('-','g'),'/'), (new RegExp('T'),' '));
		return parseInt(new Date(newDate2).getTime() - new Date(newDate1).getTime()) * 1.8;
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
	function schAddr() { 									//searchAddress
		$('#search_query').autocomplete({
			appendTo: '.col-middle',
			source: (request, response) => {
				$.ajax({
					url: "https://nominatim.openstreetmap.org",
					cache: true,
					method: "GET",
					data: {
						q: 'Санкт-Петербург, ' + request.term,
						format: 'json',
						limit: 10,
					},
				})
					.done((data) => {
						response($.map(data, (item) => {
							return {
								value: item.display_name.split(',', 6),
								latitude: item.lat,
								longitude: item.lon
							}
						}));
						$('#progressbar').hide();
					})
					.fail(() => {

					});
			},
			select: (event, point) => {
				let lat = point.item.latitude,
						lon = point.item.longitude;
				mrkSearch = {lat, lon};
				map.setView(mrkSearch, 18);
				let mIcon = L.icon({iconUrl: 'images/marker_30.png', iconSize: [30, 30], iconAnchor: [15, 15]});
				let dot = L.marker(mrkSearch, { icon: mIcon }).addTo(map);
				$('.closed').click(() => {
					if (dot != undefined) {
						map.removeLayer(dot);
						map.setZoom(10);
					}
				});
			},
			search: () => {
				$('#progressbar').show();
			}
		});
	}
	function schCar() {								//searchCar
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
				map.setView(data._data[point.item.did].mO._latlng, 18);
				data._data[point.item.did].mO.openPopup(data._data[point.item.did].mO._latlng);
			},
			search: () => {
				$('#progressbar').show();
			}
		});
	}
	$(() => {
		schAddr();
		let el = $('#search_query');
		$('.button-state').click(() => {
			if(el.hasClass('address')){
				el.removeClass('address');
				el.addClass('object');
				if($(window).width() <= 575){
					el.attr('placeholder', 'Поиск по б/н');
				} else {
					el.attr('placeholder', 'Поиск по бортовому номеру');
				}
				schCar();
			} else {
				el.removeClass('object');
				el.addClass('address');
				el.attr('placeholder', 'Поиск по адресу');
				schAddr();
			}
		});
		$('form').submit(function () {
			return false;
		});
	});
	$('#search_query').on('input',() => {
		if($('#search_query').val() !== '') {
			$('.closed').show();
			$('.button-state').hide();
		}
	});
	$('.closed').click(() => {
		$('.button-state').show();
		$('.closed').hide();
		$('#search_query').val('');
	});
	$(window).resize(() => {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(rsM(), 100);
		$('.feedEkList').css('max-height', '');
		$('#contact').css('max-height', '');
		nsScrl();

	});
	$('.col-left').click(() => {
		if ($(window).width() <= 575){
			$('#system-tab').removeClass('active');
			$('.icon_system').addClass('active');
		}
	});
	$('.col-right').click(() => {
		nsScrl();
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
	// function modEr(jqXHR, textStatus, errorThrown) {
	// 	$('body').append('')
	// 	$('body').append("\t<div class=\"modal\" id=\"modalEr\" style=\"display:block;z-index:2001\">\n" +
	// 		"\t\t<div class=\"modal-dialog\">\n" +
	// 		"\t\t\t<div class=\"modal-content\">\n" +
	// 		"\t\t\t\t<div class=\"modal-header\">\n" +
	// 		"\t\t\t\t\t<h5 class=\"modal-title\">ОШИБКА!!!</h5>\n" +
	// 		"\t\t\t\t</div>\n" +
	// 		"\t\t\t\t<div class=\"modal-body\">\n" +
	// 		"\t\t\t\t\t<h5 class=\"modal-title\">ОШИБКА!!!</h5>\n" +
	// 		"\t\t\t\t</div>\n" +
	// 		"\t\t\t</div>\n" +
	// 		"\t\t</div>\n" +
	// 		"\t</div>\n");
	// }
	return Map();
});

