var buttomDom;
var statusDom;
var fileSystem;

/*
 var bricks = {

 };
 */

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

var serviceHost = "http://www.gtech.com.tr/cosmetica";
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
		var svcurl = serviceHost + "/Announcements.ashx?cat=" + _swiper.categoryId;
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

function refreshCatalogueArea() {
	//if ios then download else use googleDocs

	try {
		var cataloguePath = app.getSetting("cataloguePath", "");
		//lert(cataloguePath);

		var openPdf = function() {
			window.open(cataloguePath, '_blank', 'location=no,enableViewPortScale=yes,closebuttoncaption=Geri');
		};

		$('#show-catalogue img').unbind("tap", openPdf);

		if (cataloguePath == "") {
			$('#download-catalogue').show();
			$('#show-catalogue').hide();
		} else {
			$('#download-catalogue').hide();
			$('#show-catalogue').show();
			$('#show-catalogue img').bind("tap", openPdf);
		}
	} catch(e) {
		alert(e);
	}
}

function initCatalogueDownload() {
	var startDl = function() {
		buttonDom.setAttribute("disabled", "disabled");

		var ft = new FileTransfer();
		var pdfUrl = serviceHost + '/Files/cosmetica-insert-eylul.pdf';
		var uri = encodeURI(pdfUrl);

		var downloadPath = fileSystem.root.fullPath + "/eylul.pdf";

		ft.onprogress = function(progressEvent) {
			if (progressEvent.lengthComputable) {
				var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
				if (platform_Android())
					perc = perc / 2;
				statusDom.innerHTML = perc + "% loaded...";
			} else {
				if (statusDom.innerHTML == "") {
					statusDom.innerHTML = "Loading";
				} else {
					statusDom.innerHTML += ".";
				}
			}
		};

		ft.download(uri, downloadPath, function(entry) {
			// download finished
			//alert(downloadPath);
			app.putSetting("cataloguePath", downloadPath);
			refreshCatalogueArea();
			/*
			 var media = new Media(entry.fullPath, null, function(e) {
			 alert(JSON.stringify(e));
			 });
			 media.play();
			 */
		}, function(error) {
			alert('Crap something went wrong...');
			refreshCatalogueArea();
		});
	};

	try {
		//step one is to request a file system
		window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function(fs) {
			fileSystem = fs;

			buttonDom = document.querySelector('#startDl');
			buttonDom.addEventListener('touchend', startDl, false);
			buttonDom.removeAttribute("disabled");

			statusDom = document.querySelector('#status');
		}, function(e) {
			alert('failed to get fs');
			alert(JSON.stringify(e));
		});
	} catch(e) {
		//alert(e);
		console.warn(e);
	}
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

var detectCurrentLocation = function(highAccuracy) {

	var onGeoSuccess = function(position) {
		var map = app.map;
		$("#location-info").html("Konum bilginiz saptandı.");
		$("#location-info").fadeOut(1000);

		app.currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		//var markers = $("#map").gmap('get', 'markers');

		if (app.currentLocationMarker != null) {
			app.currentLocationMarker.setMap(null);
		}

		app.currentLocationMarker = new google.maps.Marker({
			position : app.currentLocation,
			map : map,
			bounds : false,
			title : 'Buradasınız',
			icon : serviceHost + '/files/50px-Wikimap-blue-dot.png',
			animation : google.maps.Animation.BOUNCE
		});
		var marker = app.currentLocationMarker;

		google.maps.event.addListener(marker, 'click', function() {
			map.setZoom(8);
			map.setCenter(marker.getPosition());
		});

		/*
		 self.openInfoWindow({
		 'content' : ''
		 }, this);
		 */

		showCurrentLocation();
		app.recalculateDistances();
	};

	var onGeoFail = function(error) {
		$("#location-info").fadeIn(200);
		$("#location-info").html("Konum bilginize ulaşılamıyor.");
	};

	navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoFail, {
		timeout : 8000,
		enableHighAccuracy : highAccuracy
	});
};

var showCurrentLocation = function() {
	try {
		var map = app.map;
		map.setCenter(app.currentLocation);
		map.setZoom(13);
	} catch(e) {
		console.warn(e);
	}
};

function goMap(latitude, longitude) {
	if ($('#shop-list').is(":visible")) {
		$('#shop-list').fadeOut(200);
	}
	var map = app.map;
	var location = new google.maps.LatLng(latitude, longitude);
	map.setCenter(location);
	map.setZoom(13);
}

var getShopList = function() {
	if (app.shopList.length > 0) {
		return;
	}
	var selector = app.shopListSelector;
	app.shopListTemplate = $(selector).html();
	$(selector).html("");

	var svcurl = serviceHost + "/Shops.ashx";
	$.ajax({
		url : svcurl,
		dataType : "jsonp",
		async : true,
		success : function(result) {
			$('#shop-list .info').html('Mağaza listesi güncellendi.').fadeOut(1000);
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

function goPage(pageId) {
	$.mobile.changePage($("#" + pageId));
}

function startGuzellikSirriAnimation() {
	console.warn("startGuzellikSirriAnimation");
}

function startupSteps() {
	glog.step('startupSteps');

	//console.log("startupSteps");
	//$.mobile.loading('show');

	$("#ani-page").bind("pageshow", function(event) {
		try {
			//if (! typeof navigator === "undefined")
			navigator.splashscreen.hide();
		} catch(e) {
			//alert("hide error");
		}
		app.startAnim();
	});

	$("#home_page").bind("pageshow", function(event) {
		console.log("changed home_page");

		// bu contentSize niye şaşıyor? bulamadım..
		$('#home_page div[data-role="content"]').css({
			"height" : "auto"
		});
		app.initHomeSwiper();
		app.firstInitialize();
	});

	$("#page-yeniurun").bind("pageshow", function(event) {
		initSwiperData(swiper2);
	});

	$("#page-firsat").bind("pageshow", function(event) {
		initSwiperData(swiper1);
	});

	$("#page-guzellik").bind("pageshow", function(event) {
		startGuzellikSirriAnimation();
	});

	$("#page-katalog").bind("pageshow", function(event) {

		catalogue.load();
		if (myScroll == null)
			loaded();

		//refreshCatalogueArea();

		/*
		 var pdfUrl = serviceHost + '/Files/cosmetica-insert-eylul.pdf';
		 if (platform_iOS()) {
		 //var ref = window.open(pdfUrl, '_blank', 'location=no,enableViewPortScale=yes');
		 //$('#page-katalog div[data-role="content"]').load(pdfUrl);
		 } else {
		 pdfUrl = 'https://docs.google.com/viewer?url=' + pdfUrl;
		 /*
		 $('.theiframeid').css({
		 "width" : $(window).width + "px"
		 });
		 $('.theiframeid').attr("src", pdfUrl);
		 *-/
		 }
		 var ref = window.open(pdfUrl, '_blank', 'location=no,enableViewPortScale=yes,closebuttoncaption=Geri');
		 */
	});

	$("#page-harita").bind("pageshow", function(event) {
		var t1 = $('#page-harita div[data-role="content"] .ui-grid-a').offset().top;
		var t2 = $('#map').offset().top;
		var h = getRealContentHeight("page-harita") - (t2 - t1);
		$('#map').css({
			"height" : h + "px"
		});

		$('#shop-list').css({
			"top" : t2 + "px",
			"height" : h + "px"
		});

		//$('#map').gmap('refresh');

		if (app.mapApiReady) {
			google.maps.event.trigger(app.map, 'resize');
		}

		if (app.currentLocation == null) {
			if (app.mapApiReady) {
				detectCurrentLocation(true);
			} else {
				alert("Map API is not loaded!..");
			}
		}
		/*
		 if (app.updateCurrentMap) {
		 showCurrentLocation();
		 }*/
		getShopList();
	});

	$("#page-ayarlar").bind("pageshow", function(event) {
		//app.backPageId
	});

	$("#m1 img").bind('tap', function(event, ui) {
		$.mobile.changePage($("#page-yeniurun"));
	});

	$("#m2 img").bind('tap', function(event, ui) {
		$.mobile.changePage($("#page-firsat"));
	});

	$("#m3 img").bind('tap', function(event, ui) {
		$.mobile.changePage($("#page-guzellik"));
	});

	$("#m4 img").bind('tap', function(event, ui) {
		$.mobile.changePage($("#page-katalog"));
		/*
		 var pdfUrl = serviceHost + '/Files/cosmetica-insert-eylul.pdf';
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

	$("#m5 img").bind('tap', function(event, ui) {
		$.mobile.changePage($("#page-sosyal"));
	});

	$("#m6 img").bind('tap', function(event, ui) {
		$.mobile.changePage($("#page-uygulama"));
	});

	$("#m7 img").bind('tap', function(event, ui) {
		$.mobile.changePage($("#page-form"));
	});

	$("#m8 img").bind('tap', function(event, ui) {
		$.mobile.changePage($("#page-harita"));
	});
	$("#m9 img").bind('tap', function(event, ui) {
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
			$('#shop-list').fadeOut(200);
		} else {
			$('#shop-list').fadeIn(200);
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

	$('#page-uygulama div[data-role="content"] .app1').bind('tap', function() {
		var scanner = cordova.require("cordova/plugin/BarcodeScanner");
		scanner.scan(function(result) {
			alert("We got a barcode\n" + "Result: " + result.text + "\n" + "Format: " + result.format + "\n" + "Cancelled: " + result.cancelled);
		}, function(error) {
			alert("Scanning failed: " + error);
		});
	});

	$('#page-uygulama div[data-role="content"] .app2').bind('tap', function() {
		openFrontCamera();
	});

	/*
	 if (platform_iOS()) {
	 initCatalogueDownload();
	 }
	 */
	glog.step('startupSteps');
}

function loadMapScript(callbackFunctionName) {
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&libraries=geometry&' + 'callback=' + callbackFunctionName;
	document.body.appendChild(script);
}

function shareDebugLog() {
	console.log($('#tbDebugger').val());
	window.plugins.socialsharing.available(function(isAvailable) {
		if (isAvailable) {
			//window.plugins.socialsharing.share('My text with a link: serviceHost);
			window.plugins.socialsharing.share("Debugger :" + $('#tbDebugger').val() + ":<br/>" + glog.logString);
		}
	});
}

function testOrientation() {
	navigator.screenOrientation.set('landscape');
}
