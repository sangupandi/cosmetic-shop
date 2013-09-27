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
	var pageId = $.mobile.activePage.attr('id');
	enlargeContent(pageId);
}

function enlargeContent(pageId) {
	$('#' + pageId + ' div[data-role="content"]').css({
		'height' : getRealContentHeight(pageId) + 'px'
	});
}

function getRealContentHeight(pageId) {
	if (!pageId)
		pageId = $.mobile.activePage.attr('id');
	var contentTopOffset = $('#' + pageId + ' div[data-role="content"]').offset().top;
	var f = $('#' + pageId + ' div[data-role="footer"]').offset();
	var footerTopOffset = f ? f.top : 0;
	var contentHeight;
	if (footerTopOffset > 0) {
		contentHeight = footerTopOffset - contentTopOffset;
	} else {
		var htmlHeight = $('html').height();
		contentHeight = htmlHeight - contentTopOffset;
	}

	/*
	 console.log("pageid :" + pageId);
	 console.log("contentTopOffset :" + contentTopOffset);
	 console.log("footerTopOffset :" + footerTopOffset);
	 console.log("contentHeight :" + contentHeight);
	 */
	return Math.ceil(contentHeight);
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
		$("#location-info").html("Konum bilginiz saptandı.");
		$("#location-info").fadeOut(2500);
		
		app.currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

		// Add an overlay to the map of current lat/lng
		var marker = new google.maps.Marker({
			position : app.currentLocation,
			map : app.currentLocationMap,
			title : "Buradasınız :)"
		});

		marker.setMap(app.currentLocationMap);
		app.currentLocationMap.panTo(app.currentLocation);
		app.currentLocationMap.setZoom(13);
	};

	var onGeoFail = function(error) {
		$("#location-info").fadeIn(500);
		$("#location-info").html("Konum bilginize ulaşılamıyor.");
	};

	var initialLocation = new google.maps.LatLng(39.92661, 32.83525);
	//position.coords.latitude, position.coords.longitude);
	app.currentLocationMap = new google.maps.Map(document.getElementById('map-current'), {
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

function goMap(latitude, longitude) {
	$.mobile.changePage($("#map-page"), {
		transition : "none"
	});
	$('#map-page').css({
		"height" : getRealContentHeight() + "px"
	});
	var shopLocation = new google.maps.LatLng(latitude, longitude);

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
	 map.panTo(any location);
	 map.setZoom(16);
	 */
	resizeMyContent();
}

var getShopList = function() {
	if (app.shopList.length > 0) {
		return;
	}
	var selector = "#shop-list .liste";
	app.shopListTemplate = $(selector).html();
	$(selector).html("");

	var svcurl = "http://" + serviceHost + "/Shops.ashx";
	$.ajax({
		url : svcurl,
		dataType : "jsonp",
		async : true,
		success : function(result) {/*
			 $('#shop-list .info').css({
			 "display" : "none"
			 });
			 */
			$('#shop-list .info').html('Mağaza listesi güncellendi.').fadeOut(5000);
			ajax.parseJSONP(result);
		},
		error : function(request, error) {
			$('#shop-list .info').html('Bağlantı hatası oluştu tekrar deneyiniz!').fadeIn(200);
		}
	});

	var ajax = {
		parseJSONP : function(result) {
			$.each(result, function(i, row) {
				app.shopList.push({
					'caption' : row.Caption,
					'address' : row.Address,
					'phone' : row.Phone,
					'latitude' : row.Latitude,
					'longitude' : row.Longitude,
					'active' : row.Active,
					'distance' : null
				});
			});
			app.recalculateDistances();
			app.renderShopList(selector);
		}
	};
};
function startupSteps() {
	app.startAnim();

	$("#m1 img").bind('tap', function(event, ui) {
		enlargeContent("page-yeniurun");
		initSwiperData(swiper1);
		$.mobile.changePage($("#page-yeniurun"), {
			transition : "fade"
		});

	});

	$("#m2 img").click(function() {
		initSwiperData(swiper2);
		$.mobile.changePage($("#page-firsat"), {
			transition : "none"
		});
		resizeMyContent();
	});

	$("#m3 img").click(function() {
		//initSwiperData(swiper3);
		$.mobile.changePage($("#page-bildirim"), {
			transition : "none"
		});
		$('#page-bildirim div[data-role="header"]').css({
			"top" : "0px",
			"left" : "0px"
		});
		resizeMyContent();
	});

	$("#m4 img").click(function() {
		$.mobile.changePage($("#page-katalog"), {
			transition : "none"
		});
		resizeMyContent();

		var pdfUrl = "http://" + serviceHost + '/Files/cosmetica-insert-eylul.pdf';
		if (!platform_iOS()) {
			pdfUrl = 'https://docs.google.com/viewer?url=' + pdfUrl;
		}
		var ref = window.open(pdfUrl, '_blank', 'location=no,enableViewPortScale=yes');

		/*
		 ref.addEventListener('loadstart', function() { alert('start: ' + event.url); });
		 ref.addEventListener('loadstop', function() { alert('stop: ' + event.url); });
		 ref.addEventListener('exit', function() { alert(event.type); });
		 */
	});

	$("#m5 img").click(function() {
		$.mobile.changePage($("#page-sosyal"), {
			transition : "flip"
		});
		resizeMyContent();
	});

	$("#m6 img").click(function() {
		$.mobile.changePage($("#page-uygulama"), {
			transition : "flip"
		});
		resizeMyContent();
	});

	$("#m7 img").click(function() {
		$.mobile.changePage($("#page-form"), {
			transition : "flip"
		});
		resizeMyContent();
	});

	$("#m8 img").click(function() {
		//getShopList();
		$.mobile.changePage($("#page-harita"), {
			transition : "none"
		});
		enlargeContent("page-harita");

		var t1 = $('#page-harita div[data-role="content"] .ui-grid-a').offset().top;
		var t2 = $('#map-current').offset().top;
		var h = getRealContentHeight("page-harita") - (t2 - t1);
		$('#map-current').css({
			"height" : h + "px"
		});

		$('#shop-list').css({
			"top" : t2 + "px",
			"height" : h + "px"
		});

		detectCurrentLocation();
		getShopList();

		/*
		 $.mobile.changePage($("#map-page"), { transition: "slide" });
		 initMap(true);
		 resizeMyContent();
		 */
	});

	$('.sfb').bind('tap', function() {
		var ref = window.open("http://www.facebook.com/cosmetica.com.tr", '_blank', 'location=no,enableViewPortScale=yes');
	});
	$('.stw').bind('tap', function() {
		var ref = window.open("http://twitter.com/cosmeticaa", '_blank', 'location=no,enableViewPortScale=yes');
	});
	$('.sgp').bind('tap', function() {
		var ref = window.open("http://plus.google.com/100866141157931417846/posts", '_blank', 'location=no,enableViewPortScale=yes');
	});
	$('.sfs').bind('tap', function() {
		var ref = window.open("https://tr.foursquare.com/v/cosmetica/4e7c9c4b45dd91ac8a3734cc", '_blank', 'location=no,enableViewPortScale=yes');
	});

	$('#page-harita div[data-role="content"] .b1').bind('tap', function() {
		$('#shop-list').fadeIn(500);
	});

}
