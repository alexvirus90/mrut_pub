'use strict';

function App(args) {
	args = args || {};

	let	markerOnline  = new L.LayerGroup(),
			markerOffline = new L.FeatureGroup(),
			markerTrakers = new L.layerGroup();
}

$.extend(App.prototype, {

	waitForConnect: function () {
		$.ajax({
			type: 'GET',
			url: 'http://176.97.34.40:6064/?command=connect&principal=1',
			// url: 'http://176.97.34.41:6064/?command=connect&principal=1',
			async: true,
			cache: false,
			success: (data) => {
				let json = eval('(' + data + ')');
				this.waitForPool(json.root[0].connection);
			},
			error: (XMLHttpRequest, textStatus, errorThrown) => {
				this.waitForPool(json.root[0].connection);
			}
		});
	},
	waitForPool: function (id) {
		$.ajax({
			type: 'GET',
			url: 'http://176.97.34.40:6064/?command=receive&connection=' + id,
			// url: 'http://176.97.34.41:6064/?command=receive&connection=' + id,
			async: true,
			cache: false,
			success: (data) => {
				let evt = $.Event('startpoint');
				let json = eval('(' + data + ')');
				let str = JSON.stringify(json);
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

						evt.latlon = [[slice.root[k].lat, slice.root[k].lon]];
						evt.did = slice.root[k].header.id;
						if (this.globalMap().global.data[evt.did] !== undefined){
							this.globalMap().global.data[evt.did].latlon = evt.latlon;
						}
						evt.obj = slice.root[k];
						$(window).trigger(evt);
					}
				}
				this.waitForPool(id);
			},
			error: (XMLHttpRequest, textStatus, errorThrown) => {
				this.waitForPool(id);
			}
		});
	},
	globalMap: function () {
		let global 		= {data: []};
		let carsArray = [];
		
		this.resizeMap();
		this.drawMap();

		$.ajax({
			url: "/js/info.json",
			success: (data) => {
				for (let k in data.result) {
					if (typeof data.result[k] === 'object') {
						global.data[data.result[k]['did']] = data.result[k];
						carsArray.push(data.result[k]);
					}
				}
				let conId = this.waitForConnect();
			}
		});
	},
	resizeMap: function () {
		scroll(0, 0);
		let header = $(".header:visible");
		let footer = $(".footer:visible");
		let content = $(".content:visible");
		let viewport_height = $(window).height();
		let content_height = viewport_height - header.outerHeight() - footer.outerHeight();
		content_height -= (content.outerHeight() - content.height());
		content.height(content_height);
		$("#map_canvas").height(content_height);
	},
	drawMap: function () {
		let cloudmadeUrl = 'http://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/{styleId}/256/{z}/{x}/{y}.png';
		// let minimal = new L.tileLayer('http://190.0.0.14/osm_tiles/{z}/{x}/{y}.png', {
		// 	detectRetina: true,
		// 	minZoom: 9
		// });
		let minimal = new this.L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			detectRetina: true,
			minZoom: 9
		});
		let midnightCommander = new this.L.TileLayer(cloudmadeUrl, {styleId: 999});
		let spbCenter = new this.L.LatLng(59.930967, 30.302636);
		let map = new this.L.Map('map_canvas', {center: spbCenter, zoom: 10, layers: [minimal, markerOnline]});
		map.setMaxBounds([[59.430967, 29.302636], [60.430967, 31.302636]]);
		let lc = this.L.control.locate().addTo(map);
		let baseMaps = {
			"Карта СПб": minimal,
			"Карта СПб(ночь)": midnightCommander
		};
		let overlayMaps = {
			"На линии": markerOnline,
			"В дежурстве": markerOffline,
			"Тракира": markerTrakers
		};
		let layersControl = new this.L.Control.Layers(baseMaps, overlayMaps);
		map.addControl(layersControl);

		return this.waitForConnect();
	},
	get_function_car: function (obj, sensors) {
		let car_imgColor = [];
		let car_Fun 		 = [];
		let car_Color 	 = [];

		car_imgColor[1] = "black"; car_imgColor[2] = "lilac";
		car_imgColor[3] = "light_blue"; car_imgColor[4] = "red";
		car_imgColor[5] = "orange"; car_imgColor[6] = "blue";
		car_imgColor[7] = "green"; car_imgColor[8] = "light_green";
		car_imgColor[9] = "light_blue"; car_imgColor[10] = "yellow";
		car_imgColor[11] = "lilac"; car_imgColor[12] = "brown";
		car_imgColor[13] = "yellow"; car_imgColor[14] = "lemon";//car_imgColor[15] = "white";
		car_imgColor[15] = "violet"; car_imgColor[16] = "t";

		car_Fun[1] = "ПГ"; car_Fun[2] = "ССВ";
		car_Fun[3] = "М"; car_Fun[4] = "РТ";
		car_Fun[5] = "РУ"; car_Fun[6] = "ПМ";
		car_Fun[7] = "ПУ"; car_Fun[8] = "В";
		car_Fun[9] = "Щ"; car_Fun[10] = "П";
		car_Fun[11] = "Б"; car_Fun[12] = "РЖ";
		car_Fun[13] = "Т"; car_Fun[14] = "Р"; car_Fun[15] = "К"; car_Fun[16] = "ПР";

		car_Color[1] = "black"; car_Color[2] = "#9B30FF";
		car_Color[3] = "turquoise"; car_Color[4] = "red";
		car_Color[5] = "orange"; car_Color[6] = "blue";
		car_Color[7] = "green"; car_Color[8] = "lime";
		car_Color[9] = "#00D5D5"; car_Color[10] = "yellow";
		car_Color[11] = "#FF6A00"; car_Color[12] = "brown";
		car_Color[13] = "yellow"; car_Color[14] = "green";
		car_Color[15] = "grey"; car_Color[16] = "green"; car_Color[14] = "C3F266"; car_Color[15] = "violet";

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
	},
	getSensor: function (obj, car_info) {
		let that = this;
		if (((obj.obj.sensors & car_info.GB_MASK) / car_info.GB_MASK) === car_info.GB_AL &&
			((obj.obj.sensors & 8) / 8) == 1) {
			that.markerOnline.addLayer(obj);
		} else {
			markerOffline.addLayer(obj);
		}
	}
},

$(window).resize(() => {
	let resizeTimer;
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(this.resizeMap, 100);
}),

$(window).on('startpoint', (e) => {

	if (global.data[e.did] === undefined) return;
	if (global.data[e.did]['imgType'] === undefined) return;

	color 		= this.getFunColor(e.obj, global.data[e.did]);
	func 			= this.get_function_car(global.data[e.did], e.obj.sensors);
	imgType 	= global.data[e.did]['imgType'];
	imgPath 	= 'images/car/' + imgType + color + '_32.png';
	greenIcon = L.icon({iconUrl: imgPath, iconSize: [32, 32],	iconAnchor: [16, 16]});

	if (marker[e.did] !== undefined) {
		this.startMarkerTo(e);
		return;
	}

	movingMarker = L.Marker.movingMarker(global.data[e.did].latlon, [], {title: global.data[e.did].nc, icon: greenIcon});
	movingMarker.obj = e.obj;
	marker[e.did] = {'m_move': movingMarker, 'time': 1};
	this.getSensor(movingMarker, global.data[e.did]);

	// map.on('zoomend', function () {
	// let iszoom = 0;
	// zoom = map.getZoom();
	// 	console.log('zoom', zoom);
	// 	if (zoom == 14 && iszoom == 0 ) {
	// 		iszoom = 1;
	// 		markerOnline.clearLayers();
	// 		markerOffline.clearLayers();
	// 		if (marker[e.did] !== undefined) {
	// 			getSensor(movingMarker, global.data[e.did]);
	// 		}
	// 	} else {
	// 		iszoom = 0;
	// 		getSensor(movingMarker, global.data[e.did]);
	// 	}
	// });

	pupuptext = "<p><b>Тип: </b>" + global.data[e.did]['job'] + "</br>" +
		//"<b>Предприятие: </b>" + global.data[e.did]['vgn'] + "</br>" +
		//"<b>Автоколонна: </b>" +global.data[e.did]['acn'] +"</br>" +
		"<b>Гаражный номер: </b>" + global.data[e.did].nc + "</br>" +
		"<b>Марка: </b>" + global.data[e.did]['bn'] + "</br>" +
		"<b>Функция: </b>" + func + "</br>" +
		"<b>Скорость: </b>" + e.obj.speed + "(км/ч)</p>";
	marker[e.did].m_move.bindPopup(pupuptext);
})
);
