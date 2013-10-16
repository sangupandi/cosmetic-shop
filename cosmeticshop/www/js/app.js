var serviceHost = "http://www.gtech.com.tr/cosmetica";

/*
 * CarouselObject
 */
function carouselObject(_domId, _categoryId) {
	this.swiper = null;
	this.domId = _domId;
	this.paginationDomId = _domId + "-pagination";

	this.templateSelector = this.domId + ' .swiper-wrapper';
	//this.template = $(this.templateSelector).html();
	this.template = '<div class="swiper-slide">{0}<div class="desc">{1}</div></div>';

	//$(this.templateSelector).html("");

	this.rawJsonData = null;
	this.categoryId = _categoryId;

	this.loaded = false;
	this.trying = false;
}

carouselObject.prototype.extractRawData = function(jsonData) {
	if (jsonData != null) {
		this.rawJsonData = jsonData;
		var arr = [];
		var template = this.template;
		$.each(this.rawJsonData, function(i, row) {
			arr.push(String.format(template, row.Html, row.Description));
		});
		$(this.templateSelector).html(arr.join(""));
		this.render();
	}
};

carouselObject.prototype.render = function() {
	this.swiper = new Swiper(this.domId, {
		pagination : this.paginationDomId,
		loop : true,
		grabCursor : true,
		paginationClickable : true
	});
};

carouselObject.prototype.load = function() {
	if (!this.loaded && !this.trying) {
		var obj = this;
		obj.trying = true;
		glog.step(obj.domId + ".load");

		var svcurl = serviceHost + "/Announcements.ashx?cat=" + this.categoryId;
		$.ajax({
			url : svcurl,
			dataType : "jsonp",
			async : true,
			success : function(result) {
				glog.step(obj.domId + ".load");
				obj.extractRawData(result);
				obj.trying = false;
				obj.loaded = true;
			},
			error : function(request, error) {
				glog.step(obj.domId + ".load");
				obj.trying = false;
				alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
			}
		});
	}
};

/*
 * ShopObject
 */
function ShopObject(_caption, _address, _phone, _latitude, _longitude, _active, _distance) {
	this.caption = _caption;
	this.address = _address;
	this.phone = _phone;
	this.latitude = _latitude;
	this.longitude = _longitude;
	this.active = _active;
	this.distance = _distance;
}

/*
 * catalogueObject
 */
var catalogue = {
	initialized : false,

	load : function(selector) {
		if (catalogue.initialized)
			return;

		var svcurl = serviceHost + "/Catalogue.ashx";
		$.ajax({
			url : svcurl,
			dataType : "jsonp",
			async : true,
			success : function(result) {
				$.mobile.loading('hide');
				ajax.parseJSONP(result);
			},
			error : function(request, error) {
				$.mobile.loading('hide');
				//alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
			}
		});

		var ajax = {
			parseJSONP : function(result) {
				catalogue.initialized = true;

				//var image = new Image();
				var content = "";
				$.each(result, function(i, row) {
					content += String.format('<img src="{0}" width="100%" alt=".">', row.Url);
				});
				$(selector).html(content);
			}
		};
	}
};

/*
 * PreloadObject
 */
function preloadObject(_jsonDataUrl) {
	this.jsonDataUrl = serviceHost + _jsonDataUrl;
	this.loaded = false;
	this.trying = false;
}

preloadObject.prototype.load = function() {
	if (!this.loaded && !this.trying) {
		var obj = this;
		obj.trying = true;
		glog.step("preloadObject.load");

		$.ajax({
			url : this.jsonDataUrl,
			dataType : "jsonp",
			async : true,
			success : function(result) {
				glog.step("preloadObject.load");
				ajax.parseJSONP(result);
				obj.trying = false;
				obj.loaded = true;
			},
			error : function(request, error) {
				glog.step("preloadObject.load");
				obj.trying = false;
				//alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
			}
		});

		var ajax = {
			parseJSONP : function(result) {
				//var image = new Image();
				$.each(result, function(i, row) {
					//var preload = ['/stackoverflow/1.jpg', '/stackoverflow/2.jpg'];
					var image = new Image();
					image.src = row.Url;
				});
			}
		};
	}
};

/*
 * Utility Functions
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

function openInAppBrowser(url) {
	try {
		ref = window.open(encodeURI(url), '_blank', 'location=no,enableViewPortScale=yes');
		//encode is for if you have any variables in your link
	} catch (err) {
		alert(err);
	}
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
	
	$("#page-guzellik").bind("pageshow", function(event) {
		startGuzellikSirriAnimation();
	});

	$("#page-katalog").bind("pageshow", function(event) {
		//if (myScroll == null) loaded();

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

	$(function() {
		var elem = $('#wrapper');
		elem.iscroll({
			zoom : true,
			bounce : false,
			zoomMax : 4,
			scrollX : true,
			scrollY : true,
			mouseWheel : true,
			wheelAction : 'zoom'
		});
		elem.bind('onScrollEnd', function(e, iscroll) {
			console.log($(this).attr('id') + ' - ' + iscroll);
		});
	});

	// pass class for body, added element's class, 0 or 1
	// 1 = for non ios7 testing
	//ios7StatusBarBump('ios7-detected','status-bar-bump',0);

	glog.step('startupSteps');
}

function loadMapScript(callbackFunctionName) {
	// Asynchronous Loading
	// https://developers.google.com/maps/documentation/javascript/examples/map-simple-async

	glog.step('loadMapScript');
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
