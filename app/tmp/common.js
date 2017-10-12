//<![CDATA[

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


let global = {data: new Array()};
let evt = $.Event('startpoint');
let evt2point = $.Event('topoint');

let marker = [];

let map, minimal, midnightCommander, motorways;
let waypoints = [];
let direction_pos = 0;
let current_position, current_accuracy;

let successCallback = function (data) {

  let size = 32;
  if (L.Browser.touch) size = 32;
  let greenIcon = L.icon({
	iconUrl: 'images/car/circle_ya_32.png',
	iconSize: [size, size], // size of the icon
  });

  L.marker([data.coords.latitude, data.coords.longitude], { icon: greenIcon }).addTo(map);
  map.panTo(L.latLng(data.coords.latitude, data.coords.longitude), 16);
  //map.setZoom(16);
  console.log('latitude: ' + data.coords.latitude + ' longitude: ' + data.coords.longitude);
};

let failureCallback = function () {
  console.log('location failure :(');
};

let logLocation = function () {

  //determine if the handset has client side geo location capabilities
  if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(successCallback, failureCallback);
  }
  else {
	alert("Functionality not available");
  }
};

//logLocation();
//setTimeout(logLocation, 5000);

let greenIcon = L.icon({
  iconUrl: 'images/car/circle_ya_32.png',
  iconSize: [32, 32], // size of the icon
});

function onLocationFound(e) {
  let radius;
  if (current_position) {
	//map.removeLayer(current_position);
	current_position.setLatLng(e.latlng).update();

	// map.removeLayer(current_accuracy);
	radius = e.accuracy / 2;
	current_accuracy = L.circle(e.latlng, radius).update();

	current_position.updatePopup("Вы находитесь в " + Math.round(radius) + " метрах от этой точки");

  } else {
	radius = e.accuracy / 2;
	current_position = L.marker(e.latlng, { icon: greenIcon }).addTo(map)
	  .bindPopup("Вы находитесь в " + Math.round(radius) + " метрах от этой точки").openPopup();
	current_accuracy = L.circle(e.latlng, radius).addTo(map);
  }
}
function onLocationError(e) {

}

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

  if ((((sensors & 1024) / 1024) == obj.GB_AL)
	&&
	(((sensors & 8) / 8) == 1)) {
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
function getFunColor(obj, car_info) {
  if (((obj.sensors & car_info.GB_MASK) / car_info.GB_MASK) == car_info.GB_AL && //Если включена масса
	((obj.sensors & 8) / 8) == 1) { //и если включено зажигание
	let c = null;
	if ((car_info.F1_MASK != "") &&
	  (((obj.sensors & car_info.F1_MASK) / car_info.F1_MASK) == car_info.F1_AL))
	{ c = car_imgColor[car_info.F1_ID]; }
	else if (
	  (car_info.F2_MASK != "") &&
	  (((obj.sensors & car_info.F2_MASK) / car_info.F2_MASK) == car_info.F2_AL))
	{ c = car_imgColor[car_info.F2_ID]; }
	else if ((car_info.F3_MASK != "") &&
	  (((obj.sensors & car_info.F3_MASK) / car_info.F3_MASK) == car_info.F3_AL))
	{ c = car_imgColor[car_info.F3_ID]; }
	else if ((car_info.F4_MASK != "") &&
	  (((obj.sensors & car_info.F4_MASK) / car_info.F4_MASK) == car_info.F4_AL))
	{ c = car_imgColor[car_info.F4_ID]; }
	else { c = "white"; }
  } else { c = "grey"; }
  return c;
}
function msieversion() {
  let ua = window.navigator.userAgent;
  let msie = ua.indexOf("MSIE ");

  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
  {
	//alert(parseInt(ua.substring(msie + 5, ua.indexOf(".", msie))));
	return true;
  }
  else  // If another browser, return 0
  {
	return false;
  }

  return false;
}
function WaitForPool(id) {
  $.ajax({
	type: 'GET',
	// dataType: "json",
	url: 'http://176.97.34.40:6064/?command=receive&connection=' + id,
	async: true,
	cache: false,

	success: function (data) {
	  try {
		let json = eval('(' + data + ')');

		let str = JSON.stringify(json);
		slice = JSON.parse(str);
		//console.log(slice);

		for (let k in slice.root) {
		  if (slice.root[k] instanceof Object) {
			//if(!slice.root[k] instanceof Function)continue;
			if (typeof slice.root[k].header == "undefined") continue;
			if (!slice.root[k].header instanceof Object) continue;
			if (slice.root[k].header.type == "33") continue;
			if (slice.root[k].header.type == "34") continue;
			if (slice.root[k].lat == undefined || slice.root[k].lon == undefined) continue;
			if (slice.root[k].lat == 0 || slice.root[k].lon == 0) continue;

			if ((slice.root[k].flag & 32) == 32) {
			  //console.log(slice.root[k]);
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
		//continue;
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
	//  dataType: "json",
	url: 'http://176.97.34.40:6064/?command=connect&principal=1',
	async: true,
	cache: false,

	success: function (data) {

	  let json = eval('(' + data + ')');
	  //console.log(json)
	  //jQuery.parseJSON(data);
	  setTimeout(' WaitForPool(' + json.root[0].connection + ')', 1000);
	},

	error: function (XMLHttpRequest, textStatus, errorThrown) {
	  setTimeout(' WaitForPool(' + json.root[0].connection + ')', 1000);
	  // alert("Error: " + textStatus + "(" + errorThrown +")");
	  //  setTimeout('WaitForMsg()', 15000);
	}
  });
}
function successFunction(data) {
  if (jQuery.browser.msie) {
	data = jQuery.parseJSON(data);
	//	console.log("IE",data);
  } else {
	//  console.log("!IE", data);
  }
  /* Yes, if you're using IE, you get text back, not a JSON object */
}
function WaitForConnectIE() {

  if (window.XDomainRequest) {
	let xdr = new XDomainRequest();
	if (xdr) {
	  xdr.onload = function () { successFunction(xdr.responseText); };
	  xdr.onerror = function () { /* error handling here */ };
	  xdr.open('GET', queryURL);
	  xdr.send();
	}
  }
}
function startMarkerTo(e) {
  //console.log('startMarkerTo');
  marker[e.did].m_move.start();
  if (marker[e.did].m_move.isStarted() == false) {
	marker[e.did].m_move.moveTo(e.latlon[0], (e.obj.speed * 2000));
	marker[e.did].m_move.bindPopup(e.obj.speed + 'км/ч');
  }
  else {
	//let latlng = L.latLng(event.root[k].lat, event.root[k].lon);
	let latlng = L.latLng(e.latlon[0], e.latlon[1]);

	if (marker[e.did].m_move._latlng.distanceTo(latlng) <= 2000) {
	  //console.log(marker[e.did].m_move._latlng.distanceTo(latlng));
	  //	console.log(global.data[e.did]);
	  marker[e.did].m_move.addLatLng(e.latlon[0], (e.obj.speed * 2000));
	  let func = get_function_car(global.data[e.did], e.obj.sensors);
	  let pupuptext = "<b>Тип: </b>" + global.data[e.did]['job'] + "</br>" +
		//"<b>Предприятие: </b>" + global.data[e.did]['vgn'] + "</br>" +
		//"<b>Автоколонна: </b>" +global.data[e.did]['acn'] +"</br>" +
		"<b>Марка: </b>" + global.data[e.did]['bn'] + "</br>" +
		"<b>Функция: </b>" + func + "</br>" +
		"<b>Скорость: </b>" + e.obj.speed + "(км/ч)";
	  marker[e.did].m_move.bindPopup(pupuptext);
	}
	//console.log(latlng);
	//marker[e.did].m_move.addLatLng(e.latlon[0], (e.obj.speed * 2000));
	//   marker[e.did].m_move.bindPopup(e.obj.speed + 'км/ч').openPopup();
  }
}
$.ajax({
  //dataType: "json",
  //url: "./srv/getData.php",
  url: "info.json",
  // data: { 'get': 'getinflist'},
  success: function (data) {
	for (let k in data.result) {
	  if (typeof data.result[k] === 'object') {
		global.data[data.result[k]['did']] = data.result[k];
	  }
	  else {
		//console.log(data.result[k]);
	  }
	}
	//if(!jQuery.browser.msie){
	let conId = WaitForConnect();
	//	}else{
	//	let conId = WaitForConnectIE();
	//}
  }
});
$("#test").live('pageinit', function () {

  $("#popupPanel").on({
	popupbeforeposition: function () {
	  let h = $(window).height();
	  $("#popupPanel").css("height", h);
	}
  });
  //		$( "#popupPanel button" ).on( "click", function() {
  //		$( "#popupPanel" ).popup('close');
  //	});
  resizeMap();

  $("#nightmode").bind("click", function (event, ui) {
	if (map.hasLayer(midnightCommander)) {
	  map.removeLayer(midnightCommander);
	}
	else {
	  map.addLayer(midnightCommander);
	}
  });

  $("#panelbutton").bind("click", function (event, ui) {
	//let x=document.getElementById("popupBasic");
	//x.popup('open');
	$('#popupBasic').popup("open", { corners: true, positionTo: "windows", shadow: true, transition: "slide" });
  });

  function editpop() {
	//$( "#popupPanel" ).popup();
	//let x=document.getElementById("popupBasic");
	//x.popup();
	$('#popupBasic').popup("open", { corners: true, positionTo: "windows", shadow: true, transition: "slide" });
  };

  let resizeTimer;
  $(window).resize(function () {
	clearTimeout(resizeTimer);
	resizeTimer = setTimeout(resizeMap, 100);
  });

  setTimeout(function () {

	let pointLayer = new L.FeatureGroup();

	/*for (let i = 0; i < samplePoints.length; i++) {
		//let placemark = new L.Marker(new L.LatLng(samplePoints[i][0], samplePoints[i][1]),{"clickable": true, "draggable": true}).bindPopup("<a href='#popupLogin' data-rol='button' data-rel='popup' data-position-to='window' data-inline='true'>Open Popup</a>");
		let placemark = new L.Marker(new L.LatLng(samplePoints[i][0], samplePoints[i][1]),{"clickable": true, "draggable": true});
		placemark.bindPopup("haha");
		placemark.on('click', function() {$('#popupPanel').popup("open",{corners: true, positionTo:"windows", shadow: true,transition:"slide"});} );
		pointLayer.addLayer(placemark)
	}*/
	//pointLayer.bindPopup('Ge');
	//pointLayer.on('click', function() {$('#popupPanel').popup("open",{corners: true, positionTo:"windows", shadow: true,transition:"slide"});} );

	let cloudmadeAttribution = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
	  cloudmadeOptions = { maxZoom: 18, attribution: cloudmadeAttribution },
	  cloudmadeUrl = 'http://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/{styleId}/256/{z}/{x}/{y}.png';

	//	minimal = new L.TileLayer(cloudmadeUrl, {styleId: 22677, attribution: cloudmadeAttribution});
	minimal = new L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	  detectRetina: true
	});//.addTo(map);

	midnightCommander = new L.TileLayer(cloudmadeUrl, { styleId: 999, attribution: cloudmadeAttribution });
	//	motorways = new L.TileLayer(cloudmadeUrl, {styleId: 46561, attribution: cloudmadeAttribution});

	let spbCenter = new L.LatLng(59.930967, 30.302636);

	map = new L.Map('map_canvas', { center: spbCenter, zoom: 11, layers: [minimal, /*motorways,*/ pointLayer] });

	let baseMaps = {
	  "Карта СПб": minimal,
	  "Карта СПб(ночь)": midnightCommander
	};

	let overlayMaps = {
	  "Уборочная техника": pointLayer
	};

	layersControl = new L.Control.Layers(baseMaps, overlayMaps);

	map.locate({ setView: true });

	map.on('locationfound', onLocationFound);
	map.on('locationerror', onLocationError);

	//  L.control.locate().addTo(map);

	map.addControl(layersControl);
  }, 400);
});
$(window).on('startpoint', function (e) {
  // map.locate({ setView: true});
  //if(global.data[e.did] instanceof Object){
  if (global.data[e.did] === undefined) return;
  if (global.data[e.did]['imgType'] === undefined) return;

  let color, func, imgType, myMovingMarker, greenIcon, imgPath;
  color = getFunColor(e.obj, global.data[e.did]);
  func = get_function_car(global.data[e.did], e.obj.sensors);
  imgType = global.data[e.did]['imgType'];

  imgPath = 'images/car/' + imgType + color + '_32.png';

  greenIcon = L.icon({ iconUrl: imgPath, iconSize: [32, 32] });

  if (marker[e.did] != undefined) {

	startMarkerTo(e);
	return;
  }

  //pointLayer.addLayer(greenIcon);
  //console.log(greenIcon);
  myMovingMarker = L.Marker.movingMarker(e.latlon,
	[], { icon: greenIcon }).addTo(map);
  //pointLayer.addLayer(myMovingMarker);

  let pupuptext = "<p><b>Тип: </b>" + global.data[e.did]['job'] + "</br>" +
	//"<b>Предприятие: </b>" + global.data[e.did]['vgn'] + "</br>" +
	//"<b>Автоколонна: </b>" +global.data[e.did]['acn'] +"</br>" +
	"<b>Марка: </b>" + global.data[e.did]['bn'] + "</br>" +
	"<b>Функция: </b>" + func + "</br>" +
	"<b>Скорость: </b>" + e.obj.speed + "(км/ч)</p>"

  JSON.stringify(global.data[e.did]);
  marker[e.did] = { 'm_move': myMovingMarker, 'time': 1 };
  marker[e.did].m_move.bindPopup(pupuptext);

});
$(window).on('topoint', function (e) {console.log('topoint', e);});
