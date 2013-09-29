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
var swiper4 = new SwiperObject("swiper4", "pagination4", "swipe-data4", "swipe-content4", 0);

function initSwiperData(_swiper) {

	var initSwiper = function() {
		_swiper.swiperObject = $('#' + _swiper.swiperObjectId).swiper({
			pagination : '#' + _swiper.paginationObjectId,
			paginationClickable : true,
			loop : true,
			initialSlide : 0,
			onSlideChangeEnd : function() {
				if (_swiper.swiperObjectId != 'swiper4') {
					$('#' + _swiper.swipeContentElementId).fadeOut(function() {
						$('#' + _swiper.swipeContentElementId).text(_swiper.swipeContentArray[_swiper.swiperObject.activeLoopIndex]).fadeIn();
					});
				}
			}
		});
		if (_swiper.swipeContentArray && _swiper.swiperObjectId != 'swiper4') {
			$('#' + _swiper.swipeContentElementId).html(_swiper.swipeContentArray[_swiper.swiperObject.activeLoopIndex]);
		}
		if (_swiper.swiperObjectId == 'swiper4' && $('#hp-pic').is(":visible")) {
			$('#hp-pic').css({
				"display" : "none"
			});
		}
	};

	if (_swiper.swiperObject == null) {
		$.mobile.loader.prototype.options.text = "loading";
		$.mobile.loader.prototype.options.textVisible = false;
		$.mobile.loader.prototype.options.theme = "a";
		$.mobile.loader.prototype.options.html = "";

		//var svcurl = "http://feeds.delicious.com/v2/json/popular?callback=hello";
		//var svcurl = "http://91.201.39.21/Announcements.ashx";
		var svcurl = "http://" + serviceHost + "/Announcements.ashx?cat=" + _swiper.categoryId;
		$.ajax({
			url : svcurl,
			dataType : "jsonp",
			async : true,
			//crossDomain: true,
			success : function(result) {
				$.mobile.loading('hide');
				ajax.parseJSONP(result);
			},
			error : function(request, error) {
				$.mobile.loading('hide');
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
	//return Math.ceil(contentHeight);
	return contentHeight;
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
var showCurrentLocation = function() {
	var initialLocation = new google.maps.LatLng(39.92661, 32.83525);
	app.currentLocationMap = new google.maps.Map(document.getElementById('map-current'), {
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		center : (app.currentLocation == null) ? initialLocation : app.currentLocation,
		zoom : 8
	});

	if (app.currentLocation != null) {
		// Add an overlay to the map of current lat/lng
		var marker = new google.maps.Marker({
			position : app.currentLocation,
			map : app.currentLocationMap,
			title : "Buradasınız :)"
		});
		marker.setMap(app.currentLocationMap);
		app.currentLocationMap.panTo(app.currentLocation);
		app.currentLocationMap.setZoom(13);
	}
};

var detectCurrentLocation = function(highAccuracy) {

	var onGeoSuccess = function(position) {
		$("#location-info").html("Konum bilginiz saptandı.");
		$("#location-info").fadeOut(2500);

		app.currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		showCurrentLocation();
		if (app.shopList.length > 0) {
			app.recalculateDistances();
		}
	};

	var onGeoFail = function(error) {
		$("#location-info").fadeIn(500);
		$("#location-info").html("Konum bilginize ulaşılamıyor.");
	};

	navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoFail, {
		timeout : 5000,
		enableHighAccuracy : highAccuracy
	});
};

var openFrontCamera = function() {
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
	var drawMap = function() {
		app.backPageId = "page-harita";

		$('#map-canvas').css({
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
	};

	$("#map-page").unbind("pageshow", drawMap);
	$("#map-page").bind("pageshow", drawMap);

	$.mobile.changePage($("#map-page"), {
		transition : "flip"
	});
}

var getShopList = function() {
	if (app.shopList.length > 0) {
		return;
	}
	var selector = app.shopListSelector;
	app.shopListTemplate = $(selector).html();
	$(selector).html("");

	var svcurl = "http://" + serviceHost + "/Shops.ashx";
	$.ajax({
		url : svcurl,
		dataType : "jsonp",
		async : true,
		success : function(result) {
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
			app.renderShopList();
		}
	};
};

function startupSteps() {
	//$.mobile.loading('show');

	$("#ani-page").bind("pageshow", function(event) {
		//app.startAnim();
	});

	$("#home_page").bind("pageshow", function(event) {
		// bu contentSize niye şaşıyor? bulamadım..
		$('#home_page div[data-role="content"]').css({
			"height" : "auto"
		});
		initSwiperData(swiper4);
	});

	$("#page-yeniurun").bind("pageshow", function(event) {
		initSwiperData(swiper2);
	});

	$("#page-firsat").bind("pageshow", function(event) {
		initSwiperData(swiper1);
	});

	$("#page-katalog").bind("pageshow", function(event) {
		var pdfUrl = 'http://' + serviceHost + '/Files/cosmetica-insert-eylul.pdf';
		if (platform_iOS()) {
			$('#page-katalog div[data-role="content"]').load(pdfUrl);
		} else {
			pdfUrl = 'https://docs.google.com/viewer?url=' + pdfUrl;
			$('.theiframeid').css({
				"width" : $(window).width + "px"
			});
			$('.theiframeid').attr("src", pdfUrl);
		}
	});

	$("#page-harita").bind("pageshow", function(event) {
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

		if (app.currentLocation == null) {
			detectCurrentLocation(true);
		}

		if (app.updateCurrentMap) {
			showCurrentLocation();
		}
		getShopList();
	});

	$("#page-ayarlar").bind("pageshow", function(event) {
		//app.backPageId
	});

	$("#m1 img").bind('tap', function(event, ui) {
		$.mobile.changePage($("#page-yeniurun"));
	});

	$("#m2 img").click(function() {
		$.mobile.changePage($("#page-firsat"));
	});

	$("#m3 img").click(function() {
		$.mobile.changePage($("#page-bildirim"));
	});

	$("#m4 img").click(function() {
		$.mobile.changePage($("#page-katalog"));
		/*
		 var pdfUrl = "http://" + serviceHost + '/Files/cosmetica-insert-eylul.pdf';
		 if (!platform_iOS()) {
		 pdfUrl = 'https://docs.google.com/viewer?url=' + pdfUrl;
		 }
		 $('#page-katalog div[data-role="content"]').load(pdfUrl);
		 //var ref = window.open(pdfUrl, '_blank', 'location=no,enableViewPortScale=yes');

		 /*
		 ref.addEventListener('loadstart', function() { alert('start: ' + event.url); });
		 ref.addEventListener('loadstop', function() { alert('stop: ' + event.url); });
		 ref.addEventListener('exit', function() { alert(event.type); });
		 */
	});

	$("#m5 img").click(function() {
		$.mobile.changePage($("#page-sosyal"));
	});

	$("#m6 img").click(function() {
		$.mobile.changePage($("#page-uygulama"));
	});

	$("#m7 img").click(function() {
		$.mobile.changePage($("#page-form"));
	});

	$("#m8 img").click(function() {
		$.mobile.changePage($("#page-harita"));
	});
	$("#m9 img").click(function() {
		$.mobile.changePage($("#page-ayarlar"));
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
		if ($('#shop-list').is(":visible")) {
			$('#shop-list').fadeOut(500);
		} else {
			$('#shop-list').fadeIn(500);
		}
	});
	$('#page-harita div[data-role="content"] .b2').bind('tap', function() {
		var displayError = true;
		if (app.currentLocation != null) {
			if (app.nearestShop == null)
				app.recalculateDistances();

			if (app.nearestShop != null) {
				displayError = false;
				goMap(app.nearestShop.latitude, app.nearestShop.longitude);
			}
		}

		if (displayError)
			alert("Konum bilginiz saptanamadı.");
	});

	$('#page-uygulama div[data-role="content"] .app1').each(function() {
		$(this).bind('tap', function() {
			var scanner = cordova.require("cordova/plugin/BarcodeScanner");
			scanner.scan(function(result) {
				alert("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
			}, function(error) {
				alert("Scanning failed: " + error);
			});
		});
	});

	$('#page-uygulama div[data-role="content"] .app2').each(function() {
		$(this).bind('tap', function() {
			openFrontCamera();
		});
	});
}
