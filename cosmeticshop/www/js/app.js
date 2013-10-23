var serviceHost = "http://www.gtech.com.tr/cosmetica";
/*
 * jsonLoader
 */
function jsonLoader(_url, _successCallback, _errorCallback) {
	this.url = _url;
	this.successCallback = _successCallback;
	this.errorCallback = _errorCallback;
	this.loaded = false;
	this.trying = false;
}

jsonLoader.prototype = {
	load : function(sender) {
		if (!this.loaded && !this.trying) {
			var obj = this;
			obj.trying = true;

			glog.step(obj.url + "_load");

			//var svcurl = serviceHost + "/Announcements.ashx?cat=" + this.categoryId;
			$.ajax({
				url : obj.url,
				dataType : "jsonp",
				async : true,
				success : function(result) {
					glog.step(obj.url + "_load");
					obj.trying = false;
					obj.loaded = true;

					obj.successCallback(sender, result);
				},
				error : function(request, error) {
					glog.step(obj.url + "_load");
					obj.trying = false;

					obj.errorCallback(sender, request, error);
					//alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
				}
			});
		}
	}
};

/*
 * carouselObject
 */
function carouselObject(_domId, _categoryId) {
	this.swiper = null;
	this.domId = _domId;
	this.paginationDomId = _domId + "-pagination";
	this.templateSelector = _domId + ' .swiper-wrapper';
	this.template = '<div class="swiper-slide">{0}<div class="desc">{1}</div></div>';

	this.svcurl = serviceHost + "/Announcements.ashx?cat=" + _categoryId;
	this.loader = new jsonLoader(this.svcurl, this.successHandler, this.errorHandler);
}

carouselObject.prototype = {
	errorHandler : function(sender, request, error) {
		alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
	},

	successHandler : function(sender, result) {
		if (result != null) {
			var arr = [];
			var template = sender.template;
			$.each(result, function(i, row) {
				arr.push(String.format(template, row.Html, row.Description + '<br/><br/>'));
			});
			$(sender.templateSelector).html(arr.join(""));
			sender.render();
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
		this.loader.load(this);
	}
};

/*
 * guzellikSirlari
 */
function guzellikSirlari(_categoryId) {
	this.templateSelector = '#gsTemplateB';
	//this.template = '<div class="ui-block-a">{0}</div><div class="ui-block-b"><div class="desc">{1}</div></div>';
	this.template = '<li onclick="goGsDetail({2})">{0}<p>{1}</p></li>';

	this.announcements = [];
	this.svcurl = serviceHost + "/Announcements.ashx?cat=" + _categoryId;
	this.loader = new jsonLoader(this.svcurl, this.successHandler, this.errorHandler);
}

guzellikSirlari.prototype = {
	errorHandler : function(sender, request, error) {
		alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
	},

	successHandler : function(sender, result) {
		if (result != null) {
			var template = sender.template;
			$.each(result, function(i, row) {
				sender.announcements.push(String.format(template, row.Html, row.Description, row.ID));
			});
			sender.render();
		}
	},

	render : function() {
		$(this.templateSelector).html(this.announcements.join(""));
		console.log($(this.templateSelector).html());
	},

	load : function() {
		$(this.templateSelector).html("");

		if (this.loader.loaded) {
			this.render();
		} else {
			this.loader.load(this);
		}
	}
};

/*
 * guzellikSirlari
 */
function guzellikSirlariChild(_parentId) {
	this.templateSelector = '#gsbContent2';
	this.template = '<div id="gsb2img">{0}</div><div id="gsb2text">{1}</div>';

	this.announcements = [];
	this.svcurl = serviceHost + "/Announcements.ashx?pid=" + _parentId;
	this.loader = new jsonLoader(this.svcurl, this.successHandler, this.errorHandler);
}

guzellikSirlariChild.prototype = {
	errorHandler : function(sender, request, error) {
		alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
	},

	successHandler : function(sender, result) {
		if (result != null) {
			var template = sender.template;
			$.each(result, function(i, row) {
				sender.announcements.push(String.format(template, row.Html, row.Description, row.ID));
			});
			sender.render();
		}
	},

	render : function() {
		$(this.templateSelector).html(this.announcements.join(""));
		console.log($(this.templateSelector).html());
	},

	load : function() {
		$(this.templateSelector).html("");

		if (this.loader.loaded) {
			this.render();
		} else {
			this.loader.load(this);
		}
	}
};

/*
 * shopObject
 */
function shopObject(_caption, _address, _phone, _latitude, _longitude) {
	this.caption = _caption;
	this.address = _address;
	this.phone = _phone;
	this.latitude = _latitude;
	this.longitude = _longitude;
	this.distance = null;
	this.marker = null;
}

/*
 * shopListObject
 */
function shopListObject() {
	this.jsonDataUrl = serviceHost + "/Shops.ashx";
	this.selector = "#shop-list .liste";
	this.infoSelector = "#shop-list .info";
	this.shopTemplate = null;
	this.shops = [];
	this.addMarkerCallback = null;

	this.loader = new jsonLoader(this.jsonDataUrl, this.successHandler, this.errorHandler);
}

shopListObject.prototype = {
	errorHandler : function(sender, request, error) {
		$('#shop-list .info').html('Bağlantı hatası oluştu tekrar deneyiniz!').fadeIn(200);
	},

	successHandler : function(sender, result) {
		$(sender.infoSelector).html('Mağaza listesi güncellendi.').fadeOut(1000);

		$.each(result, function(i, shop) {
			sender.shops.push({
				'caption' : shop.Caption,
				'address' : shop.Address,
				'phone' : shop.Phone,
				'latitude' : shop.Latitude,
				'longitude' : shop.Longitude
			});
		});
		app.recalculateDistances();
		sender.render();
	},

	getTemplate : function() {
		if (this.shopTemplate == null) {
			this.shopTemplate = $(this.selector).html();
		}
	},

	render : function() {
		glog.step("shopListObject.render");

		var arr = [];
		var template = this.shopTemplate;
		$.each(this.shops, function(i, shop) {
			arr.push(String.format(template, shop.caption, shop.address, shop.phone, formatDistance(shop.distance), i));
		});
		$(this.selector).html(arr.join(""));

		if (app.mapApiReady) {
			this.addMarkerCallback();
		}

		glog.step("shopListObject.render");
	},

	load : function(_addMarkerCallback) {
		this.addMarkerCallback = _addMarkerCallback;
		this.getTemplate();
		this.loader.load(this);
	}
};

/*
 * catalogueObject
 */
function catalogueObject(_jsonDataUrl) {
	this.jsonDataUrl = serviceHost + _jsonDataUrl;
	this.selector = '#wrapper-katalog #scroller-katalog';
	this.template = '<img class="page p{1}" src="{0}" width="100%" />';
	this.trying = false;
	this.loaded = false;
	this.images = [];
	this.loadedImageCount = 0;
	this.scrollObj = null;
	this.activePage = 0;
	this.zoomed = false;
}

catalogueObject.prototype = {
	onZoomEnd : function() {
		console.dir(this);

		var pageCount = $('.page').length;
		console.dir(pageCount);

		if (this.scale > 1) {
			if (!app.catalogue.zoomed) {
				app.catalogue.zoomed = true;
				// zoom in
				app.catalogue.activePage = this.currentPage.pageY;
				$('.page').css({
					'display' : 'none'
				});
				$('.page.p' + app.catalogue.activePage).css({
					'display' : 'inline-block'
				});
				/*
				 this.destroy(true);
				 app.catalogue.scrollObj = null;
				 app.catalogue.createScroll(false);
				 */
				this.refresh();
			}
		} else {
			if (app.catalogue.zoomed) {
				app.catalogue.zoomed = false;

				// zoom 1
				$('.page').css({
					'display' : 'inline-block'
				});
				this.refresh();
				this.goToPage(0, app.catalogue.activePage, 0, '');
			}
		}

	},

	createScroll : function() {
		if (this.scrollObj == null) {
			this.scrollObj = new IScroll('#wrapper-katalog', {
				zoom : true,
				mouseWheel : true,
				wheelAction : 'zoom',

				scrollX : true,
				scrollY : true,
				momentum : true,

				snap : "img",
				snapSpeed : 400,
				keyBindings : true,
				snapThreshold : 1
			});
			this.scrollObj.on('zoomEnd', this.onZoomEnd);
		} else {
			this.scrollObj.refresh();
		}
		/*
		 elem.bind('onScrollEnd', function(e, iscroll) {
		 console.log($(this).attr('id') + ' - ' + iscroll);
		 });
		 */
	},
	extractRawData : function(jsonData) {
		function imageLoadPost(self) {
			self.loadedImageCount++;
			$("#page-katalog .loading .badge").html(String.format("{0} / {1}", self.loadedImageCount, self.images.length));
			if (self.loadedImageCount == self.images.length) {
				$("#page-katalog .loading").hide();

				console.log("All images have loaded (or died trying)!");
				self.createScroll();

				console.log("iScroll refreshed");
			}
		}

		var self = this;
		var elem = $(self.selector);
		elem.html('');
		$.each(jsonData, function(i, row) {
			var img = new Image();
			img.src = row.Url;

			img.onload = function() {
				imageLoadPost(self);
			};
			img.onerror = function() {
				imageLoadPost(self);
			};

			self.images.push(img);
			elem.append(String.format(self.template, img.src, i));
			//elem.append('<img class="page p0" src="http://www.gtech.com.tr/Cosmetica/files/cosmetica-insert-eylul1.jpg" width="100%">');
		});
	},

	load : function(_addMarkerCallback) {
		/*
		 myScroll = new IScroll('#wrapper-katalog', {
		 zoom : true,
		 mouseWheel : true,
		 wheelAction : 'zoom',

		 scrollX : true,
		 scrollY : true,
		 momentum : true,

		 snap : "img",
		 snapSpeed : 400,
		 keyBindings : true,
		 snapThreshold : 1
		 });
		 return;
		 */
		if (!this.loaded && !this.trying) {
			var obj = this;
			obj.trying = true;
			glog.step("catalogueObject.load");
			//obj.createScroll();

			$("#page-katalog .loading").fadeIn(300);
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

function shopInfoPage(caption, address, phone, distance) {
	$('#shop-detail .caption').text(caption);
	$('#shop-detail .address').text(address);
	//$('#shop-detail .phone').html(String.format('<a href="tel:{0}">Tel : {0}</a>', phone));
	$('#shop-detail .phone').text(phone);
	$('#shop-detail .distance').text(formatDistance(distance));

	$.mobile.changePage($('#page-harita-detail'), {
		transition : "none"
	});
	//alert(distance);
}

function goMap(shop) {
	if ($('#shop-list').is(":visible")) {
		$('#shop-list').fadeOut(200);
	}

	var map = app.map;
	var location = new google.maps.LatLng(shop.latitude, shop.longitude);

	map.panTo(location);
	map.setZoom(15);

	if (shop.marker != null) {
		google.maps.event.trigger(shop.marker, 'click');
	}
}

function goGsDetail(annId) {
	var gsc = new guzellikSirlariChild(annId);
	gsc.load();

	$.mobile.changePage($('#page-guzellik-c'), {
		transition : "slide"
	});
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
}

function loadMapScript(callbackFunctionName) {
	// Asynchronous Loading
	// https://developers.google.com/maps/documentation/javascript/examples/map-simple-async
	var keyForBrowser = 'AIzaSyCA2xVgSRWf11kzDaO-KIA7QUQvGU1odFc';

	glog.step('loadMapScript');
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true';
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
