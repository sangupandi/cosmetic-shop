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

carouselObject.prototype = {
	extractRawData : function(jsonData) {
		if (jsonData != null) {
			this.rawJsonData = jsonData;
			var arr = [];
			var template = this.template;
			$.each(this.rawJsonData, function(i, row) {
				arr.push(String.format(template, row.Html, row.Description + '<br/><br/>'));
			});
			$(this.templateSelector).html(arr.join(""));
			this.render();
		}
	},

	render : function() {
		this.swiper = new Swiper(this.domId, {
			pagination : this.paginationDomId,
			loop : true,
			grabCursor : true,
			paginationClickable : true
		});
	},

	load : function() {
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
	}
}

/*
 * shopObject
 */
function shopObject(_caption, _address, _phone, _latitude, _longitude) {
	this.caption = _caption;
	this.address = _address;
	this.phone = _phone;
	this.latitude = _latitude;
	this.longitude = _longitude;
	this.flyingDistance = null;
	this.drivingDistance = null;
}

/*
 * shopListObject
 */
function shopListObject() {
	this.jsonDataUrl = serviceHost + "/Shops.ashx";
	this.loaded = false;
	this.trying = false;
	this.selector = "#shop-list .liste";
	this.infoSelector = "#shop-list .info";
	this.shopTemplate = null;
	this.shops = [];
	this.addMarkerCallback = null;
}

shopListObject.prototype = {
	extractTemplate : function() {
		if (this.shopTemplate == null) {
			this.shopTemplate = $(this.selector).html();
		}
	},

	extractRawData : function(jsonData) {
		$(this.infoSelector).html('Mağaza listesi güncellendi.').fadeOut(1000);

		var shops = this.shops;
		$.each(jsonData, function(i, shop) {
			shops.push({
				'caption' : shop.Caption,
				'address' : shop.Address,
				'phone' : shop.Phone,
				'latitude' : shop.Latitude,
				'longitude' : shop.Longitude
			});
		});
		app.recalculateDistances();
		this.render();
	},

	render : function() {
		glog.step("shopListObject.render");

		var arr = [];
		var template = this.shopTemplate;
		$.each(this.shops, function(i, shop) {
			arr.push(String.format(template, shop.caption, shop.address, shop.phone, formatDistance(shop.drivingDistance), shop.latitude, shop.longitude));
		});
		$(this.selector).html(arr.join(""));

		if (app.mapApiReady) {
			this.addMarkerCallback();
		}

		glog.step("shopListObject.render");
	},

	load : function(_addMarkerCallback) {
		if (!this.loaded && !this.trying) {
			var obj = this;
			obj.trying = true;
			glog.step("shopListObject.load");

			this.addMarkerCallback = _addMarkerCallback;
			this.extractTemplate();
			$(this.selector).html("");

			$.ajax({
				url : this.jsonDataUrl,
				dataType : "jsonp",
				async : true,
				success : function(result) {
					glog.step("shopListObject.load");
					obj.extractRawData(result);
					obj.trying = false;
					obj.loaded = true;
				},
				error : function(request, error) {
					glog.step("shopListObject.load");
					console.warn(request);
					console.warn(error);

					obj.trying = false;
					ajax.errorOccured(request, error);
				}
			});

			var ajax = {
				errorOccured : function(request, error) {
					$('#shop-list .info').html('Bağlantı hatası oluştu tekrar deneyiniz!').fadeIn(200);
				}
			};
		}
	}
}

/*
 * catalogueObject
 */
function catalogueObject(_jsonDataUrl) {
	this.jsonDataUrl = serviceHost + _jsonDataUrl;
	this.selector = '#wrapper #scroller';
	this.template = '<img src="{0}" width="100%" alt=".">';
	this.trying = false;
	this.loaded = false;
	this.images = [];
}

catalogueObject.prototype = {
	extractRawData : function(jsonData) {
		var self = this;
		$.each(jsonData, function(i, row) {
			var img = new Image();
			img.src = row.Url;
			self.images.push(img);
		});
		this.render();
	},

	render : function() {
		glog.step("catalogueObject.render");
		var self = this;

		var arr = [];
		$.each(self.images, function(i, img) {
			arr.push(String.format(self.template, img.src));
		});
		$(self.selector).html(arr.join(""));

		glog.step("catalogueObject.render");
	},

	load : function(_addMarkerCallback) {
		if (!this.loaded && !this.trying) {
			var obj = this;
			obj.trying = true;
			glog.step("catalogueObject.load");

			$.ajax({
				url : this.jsonDataUrl,
				dataType : "jsonp",
				async : true,
				success : function(result) {
					glog.step("catalogueObject.load");
					obj.extractRawData(result);

					obj.trying = false;
					obj.loaded = true;
				},
				error : function(request, error) {
					glog.step("catalogueObject.load");
					console.warn(request);
					console.warn(error);

					obj.trying = false;
					ajax.errorOccured(request, error);
				}
			});

			var ajax = {
				errorOccured : function(request, error) {
					$('#shop-list .info').html('Bağlantı hatası oluştu tekrar deneyiniz!').fadeIn(200);
				}
			};
		}
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

function formatDistance(value) {
	//if ( typeof value === undefined) {
	if (value == null) {
		return "?? km";
	} else {
		return (value < 1000.0) ? value.toFixed(0) + " m" : (value > 1000000) ? ">1000 km" : (value / 1000).toFixed(1) + " km";
	}
}

function goMap(latitude, longitude) {
	if ($('#shop-list').is(":visible")) {
		$('#shop-list').fadeOut(200);
	}
	var map = app.map;
	var location = new google.maps.LatLng(latitude, longitude);
	//map.setCenter(location);
	map.panTo(location);
	map.setZoom(15);
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

	glog.step('startupSteps');
}

function loadMapScript(callbackFunctionName) {
	// Asynchronous Loading
	// https://developers.google.com/maps/documentation/javascript/examples/map-simple-async
	var keyForBrowser = 'AIzaSyCA2xVgSRWf11kzDaO-KIA7QUQvGU1odFc';
	var keyForiOS = '';

	glog.step('loadMapScript');
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true';
	//&language=tr';
	//&libraries=geometry';
	script.src += '&key=' + keyForBrowser;
	script.src += '&callback=' + callbackFunctionName;
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
