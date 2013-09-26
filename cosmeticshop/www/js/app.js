function isPhoneGap() {
	return (!( typeof device === "undefined"));
}

function getDeviceType() {
	var deviceType = (navigator.userAgent.match(/iPad/i)) == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i)) == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
	return deviceType;
}

function platform_iOS() {
	return (getDeviceType() == "iPad" || getDeviceType() == "iPhone");
}

function platform_Android() {
	return (getDeviceType() == "Android");
}

var serviceHost = "213.74.186.117";
var map = null;
var mapCurrent = null;
var myLocation = null;

function SwiperObject(_swiperObjectId, _paginationObjectId, _swipeDataElementId, _swipeContentElementId, _categoryId) {
	this.swiperObject = null;
	this.swiperObjectId = _swiperObjectId;
	this.paginationObjectId = _paginationObjectId;
	this.swipeDataElementId = _swipeDataElementId;
	this.swipeContentElementId = _swipeContentElementId;
	this.swipeContentArray = null;
	this.categoryId = _categoryId;
}

var swiper1 = new SwiperObject("swiper1", "pagination1", "swipe-data1", "swipe-content1", 5);
var swiper2 = new SwiperObject("swiper2", "pagination2", "swipe-data2", "swipe-content2", 10);
var swiper3 = new SwiperObject("swiper3", "pagination3", "swipe-data3", "swipe-content3", 11);

function initSwiperData(_swiper) {

	var initSwiper = function() {
		_swiper.swiperObject = $('#' + _swiper.swiperObjectId).swiper({
			pagination : '#' + _swiper.paginationObjectId,
			paginationClickable : true,
			loop : true,
			initialSlide : 0,
			onSlideChangeEnd : function() {
				$('#' + _swiper.swipeContentElementId).fadeOut(function() {
					$(this).text(_swiper.swipeContentArray[_swiper.swiperObject.activeLoopIndex]).fadeIn();
				});
			}
		});
		if (_swiper.swipeContentArray) {
			$('#' + _swiper.swipeContentElementId).html(_swiper.swipeContentArray[_swiper.swiperObject.activeLoopIndex]);
		}
	};

	if (_swiper.swiperObject == null) {
		//var svcurl = "http://feeds.delicious.com/v2/json/popular?callback=hello";
		//var svcurl = "http://91.201.39.21/Announcements.ashx";
		var svcurl = "http://" + serviceHost + "/Announcements.ashx?cat=" + _swiper.categoryId;
		$.ajax({
			url : svcurl,
			dataType : "jsonp",
			async : true,
			//crossDomain: true,
			success : function(result) {
				ajax.parseJSONP(result);
			},
			error : function(request, error) {
				alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
			}
		});

		var ajax = {
			parseJSONP : function(result) {

				$('#' + _swiper.swipeDataElementId).html("");
				$('#' + _swiper.swipeContentElementId).html("");
				_swiper.swipeContentArray = new Array();

				$.each(result, function(i, row) {
					var tmp = $('#' + _swiper.swipeDataElementId).html();
					//tmp = tmp + '<div class="swiper-slide"><div class="title">' + row.Html + '</div></div>';
					tmp = tmp + '<div class="swiper-slide">' + row.Html + '</div>';
					$('#' + _swiper.swipeDataElementId).html(tmp);

					_swiper.swipeContentArray.push(row.Description);
				});
				initSwiper();
			}
		};
	};
}

function resizeMyContent() {
	var hhtml = $('html').height();
	var pageid = $.mobile.activePage.attr('id');
	var hcontent = $('#' + pageid + ' div[data-role="content"]').height();
	var posycontent = $('#' + pageid + ' div[data-role="content"]').offset().top;
	var hcontentnew = hhtml - (posycontent * 2);
	if (hcontent < hcontentnew) {
		$('#' + pageid + ' div[data-role="content"]').css({
			'height' : hcontentnew + 'px'
		});
	}
}

function getRealContentHeight() {
	var hhtml = $('html').height(); console.log("hhtml :" + hhtml);
	var pageid = $.mobile.activePage.attr('id'); console.log("pageid :" + pageid);
	var hcontent = $('#' + pageid + ' div[data-role="content"]').height(); console.log("hcontent :" + hcontent);
	var posycontent = $('#' + pageid + ' div[data-role="content"]').offset().top; console.log("posycontent :" + posycontent);
	var hcontentnew = hhtml - (posycontent * 2); console.log("hcontentnew :" + hcontentnew);
	return hcontentnew;
	/*
	var header = $.mobile.activePage.find("div[data-role='header']:visible");
	var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
	var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
	var viewport_height = $(window).height();

	var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
	if ((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
		content_height -= (content.outerHeight() - content.height());
	}
	return content_height;
	*/
}

function log(obj) {
	$('#map-page div[data-role="header"] h1').html(obj);
}

/*
 var getCurrentPosition = function() {
 var onGeoSuccess = function(position) {
 log("success geo");
 $('#map-canvas').html(
 'Latitude: '           + position.coords.latitude              + '<br />' +
 'Longitude: '          + position.coords.longitude             + '<br />' +
 'Altitude: '           + position.coords.altitude              + '<br />' +
 'Accuracy: '           + position.coords.accuracy              + '<br />' +
 'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
 'Heading: '            + position.coords.heading               + '<br />' +
 'Speed: '              + position.coords.speed                 + '<br />' +
 'Timestamp: '          + position.timestamp                    + '<br />'
 ).append();
 };
 var onGeoFail = function(error) {
 log("err:" + error.code);
 $('#map-canvas').html(
 'code: '    + error.code    + '\n' +
 'message: ' + error.message + '\n'
 );
 };

 log("testing.....");
 $("#map-canvas").html("Getting geolocation . . .");

 navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoFail, { maximumAge: 3000, timeout: 8000, enableHighAccuracy: true });
 };
 */

/*
 * Google Maps documentation: http://code.google.com/apis/maps/documentation/javascript/basics.html
 * Geolocation documentation: http://dev.w3.org/geo/api/spec-source.html
 */
var detectCurrentLocation = function(highAccuracy) {

	var onGeoSuccess = function(position) {
		$("#current-location-msg").html("");
		myLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

		// Add an overlay to the map of current lat/lng
		var marker = new google.maps.Marker({
			position : myLocation,
			map : mapCurrent,
			title : "Buradasınız :)"
		});

		marker.setMap(mapCurrent);
		mapCurrent.panTo(myLocation);
		mapCurrent.setZoom(8);
	};

	var onGeoFail = function(error) {
		$("#current-location-msg").html("Konum bilginize ulaşılamıyor.");
	};

	var initialLocation = new google.maps.LatLng(39.92661, 32.83525);
	//position.coords.latitude, position.coords.longitude);
	mapCurrent = new google.maps.Map(document.getElementById('map-current'), {
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		center : initialLocation,
		zoom : 8
	});

	navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoFail, {
		timeout : 5000,
		enableHighAccuracy : highAccuracy
	});
};

var cameraTest = function() {
	var onCamSuccess = function(imageData) {
		/* No action required */
	};

	var onCamFail = function(error) {
		/* No action required */
		//alert('Kamera kullanılamıyor (' + error.code + ')');
	};

	//navigator.camera.cleanup(onCamSuccess, onCamFail);
	var cameraPopoverHandle = navigator.camera.getPicture(onCamSuccess, onCamFail, {
		quality : 25,
		allowEdit : false,
		sourceType : Camera.PictureSourceType.CAMERA,
		destinationType : Camera.DestinationType.DATA_URL,
		encodingType : Camera.EncodingType.JPEG,
		cameraDirection : Camera.Direction.FRONT,
		targetWidth : 80,
		targetHeight : 80,
		saveToPhotoAlbum : false
	});

	$("#map-canvas").html("done cam . . .<br>");
};

function openInAppBrowser(url) {
	try {
		ref = window.open(encodeURI(url), '_blank', 'location=no,enableViewPortScale=yes');
		//encode is for if you have any variables in your link
	} catch (err) {
		alert(err);
	}
}

function goMap(latidute, longitude) {
	$.mobile.changePage($("#map-page"), {
		transition : "slide"
	});

	var shopLocation = new google.maps.LatLng(latidute, longitude);

	map = new google.maps.Map(document.getElementById('map-canvas'), {
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		center : shopLocation,
		zoom : 16
	});

	// Add an overlay to the map of current lat/lng
	var marker = new google.maps.Marker({
		position : shopLocation,
		map : map,
		title : "Cosmetica"
	});

	marker.setMap(map);
	/*
	 map.panTo(myLocation);
	 map.setZoom(16);
	 */
	resizeMyContent();
}

var getShopList = function() {
	var svcurl = "http://" + serviceHost + "/Shops.ashx";
	$.ajax({
		url : svcurl,
		dataType : "jsonp",
		async : true,
		success : function(result) {
			ajax.parseJSONP(result);
		},
		error : function(request, error) {
			alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
		}
	});

	var ajax = {
		parseJSONP : function(result) {
			var formatDistance = function(value) {

				if ( typeof value === undefined) {
					return "---";
				} else {
					return (value < 1000.0) ? value.toFixed(0) + " m" : (value > 1000000) ? ">1000 km" : (value / 1000).toFixed(0) + " km";
				}
			};

			$('#shop-list').html("");

			$.each(result, function(i, row) {
				var tmp = $('#shop-list').html();

				if (myLocation != null) {
					var latLngB = new google.maps.LatLng(row.Latitude, row.Longitude);
					var distance = google.maps.geometry.spherical.computeDistanceBetween(myLocation, latLngB);
				}

				tmp = tmp + "<li data-icon='false'>";
				tmp = tmp + "<a href='#' onclick='goMap(" + row.Latitude + "," + row.Longitude + ");'><h3>" + row.Caption + "</h3>";
				tmp = tmp + "<p><strong>" + row.Address + "</strong></p>";
				tmp = tmp + "<p style='margin-top: 4px;'>" + row.Phone;
				tmp = tmp + "</p><span class='ui-li-count'>" + formatDistance(distance) + "</span></a></li>";

				$('#shop-list').html(tmp);
			});
			$('#shop-list').listview('refresh');
		}
	};
};
