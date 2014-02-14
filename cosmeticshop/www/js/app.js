var internalVersion = "Version 1.0.5 Build:930";

//var serviceHost = "http://www.gtech.com.tr/cosmetica";
var serviceHost = "http://www.cosmeticamobile.com";
//var serviceHost = "http://37.230.108.2";

appCodes = {
	push : {
		pushWooshAppCode : "0E936-6B053",
		//androidSenderId : "268470725852"
		//pushWooshAppCode : "8929B-D7D16",
		androidSenderId : "449671850278"
	},
	map : {
		//keyForBrowser : 'AIzaSyCA2xVgSRWf11kzDaO-KIA7QUQvGU1odFc'
		keyForBrowser : 'AIzaSyBwH3SfcJdQu0Z-D_JbyfN4FQMt67Lo3V8'
	}
};
/*
 * b58805c0606d742d MY XperiaZ
 * 3E2B3DC7-9A40-4D29-AE81-702EA3A64A8D MY iPhpne 3Gs
 * BD7F2632-FB72-48B1-B67E-4F038D5E9780 GTech iPhone4
 */
var debuggerDevices = ["b58805c0606d742d", "1D457E0D-1433-4E4D-A274-B4288308AC7F"];

var deviceID = null;
function da(msg) {
	if (deviceID == null)
		deviceID = device.uuid;
	if (jQuery.inArray(deviceID, debuggerDevices) != -1) {
		//alert(msg);
	}
}

/*
 * http://bencollier.net/2011/06/ios-shouldautorotatetointerfaceorientation-lock-orientation-in-phonegap/
 */
function shouldRotateToOrientation(rotation) {
	switch (rotation) {
		//Portrait or PortraitUpsideDown
		case 0:
		case 180:
			return true;
		//LandscapeRight or LandscapeLeft
		case 90:
		case -90:
			return false;
	}
}

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
				}
			});
		}
	}
};

/*
 * homeSwiperObject
 */
function homeSwiperObject() {
	this.jsonData = null;
	this.swiper = null;
	this.template = '<img src="{0}" height="100%"/>';
	this.svcurl = serviceHost + "/HomeSlidePictures.ashx?uuid=" + device.uuid;
	this.loader = new jsonLoader(this.svcurl, this.successHandler, this.errorHandler);
	this.rendered = false;
	this.pageShowed = false;
}

homeSwiperObject.prototype = {
	errorHandler : function(sender, request, error) {
		var s = 'Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz!';
		showMessage(s, 'Veri İletişimi');
	},

	successHandler : function(sender, result) {
		if (result != null) {
			sender.jsonData = result;
			if (sender.pageShowed) {
				sender.render();
			}

			/*
			 * Yeni cihazların kaydı sırasında
			 * okundu bilgilerinde karışıklık olmaması için
			 * cihaz bilgisi gönderilip sonuç alındıktan sonra
			 * burada (bu olaya düşer) kayıtlar istenir.
			 *
			 */
			app.announcements.load();
			if (!badges.isLoaded) {
				app.getBadgesCount();
			}

		}
	},

	onSlideChangeEnd : function(sender) {
		var pageId = sender.jsonData[sender.swiper.activeLoopIndex].CategoryID;

		if (pageId) {
			$('#home-carousel-tap-image').fadeIn(300);
		} else {
			$('#home-carousel-tap-image').fadeOut(300);
		}
	},

	create : function() {
		var self = this;
		if (self.swiper == null) {
			self.swiper = $('#swiper-home').swiper({
				pagination : '#pagination-home',
				paginationClickable : true,
				loop : true,
				onSlideChangeEnd : function(e) {
					self.onSlideChangeEnd(self);
				}
			});

			$('#home-carousel-tap-image').bind('tap', function() {
				var self = app.homeSwiper;
				var pageId = self.jsonData[self.swiper.activeLoopIndex].CategoryID;
				var annId = self.jsonData[self.swiper.activeLoopIndex].AnnID;
				switch(pageId) {
					case 1:
						app.carousel1.annIdForActivate = annId;
						$.mobile.changePage($("#page-yeniurun"));
						break;
					case 2:
						app.carousel2.annIdForActivate = annId;
						$.mobile.changePage($("#page-firsat"));
						break;
					case 31:
						//$('.b1-1').click();
						app.gsGoz.load(annId);
						break;
					case 32:
						//$('.b2-1').click();
						app.gsYuz.load(annId);
						break;
					case 33:
						//$('.b3-1').click();
						app.gsDudak.load(annId);
						break;
					case 34:
						//$('.b4-1').click();
						app.gsTirnak.load(annId);
						break;
					default:
						break;
				}
			});

			if (!self.rendered && self.jsonData != null) {
				//self.render();
			}
		}
	},

	readyForRender : function() {
		this.pageShowed = true;
		this.render();
	},

	render : function() {
		var self = this;

		if (!self.rendered && self.jsonData != null) {
			self.rendered = true;

			$.each(self.jsonData, function(i, row) {
				var ns = self.swiper.createSlide(String.format(self.template, row.Url));
				self.swiper.appendSlide(ns);
			});
			self.swiper.removeSlide(0);
			//self.swiper.removeLastSlide();

			//self.swiper.resizeFix();
			self.onSlideChangeEnd(self);
		}
	},

	load : function() {
		if (this.swiper) {
			this.swiper.resizeFix();
		}
		this.loader.load(this);
	}
};

/*
 * announcementsObject
 */
function announcementsObject() {
	this.jsonData = null;
	this.svcurl = serviceHost + "/Announcements.ashx?uuid=" + device.uuid;
	this.loader = new jsonLoader(this.svcurl, this.successHandler, this.errorHandler);
	this.reloadRequested = false;
}

announcementsObject.prototype = {
	errorHandler : function(sender, request, error) {
		this.reloadRequested = false;
		var s = 'Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz!';
		showMessage(s, 'Veri İletişimi');
	},

	successHandler : function(sender, result) {
		if (result != null) {
			sender.jsonData = result;

			if (sender.reloadRequested) {
				sender.reloadRequested = false;
				// reset data
				app.carousel1.reloadRequested = true;
				app.carousel2.reloadRequested = true;
				app.gsGoz.reloadRequested = true;
				app.gsYuz.reloadRequested = true;
				app.gsDudak.reloadRequested = true;
				app.gsTirnak.reloadRequested = true;
				app.getBadgesCount();
			}
		}
	},

	reload : function() {
		//alert("reload activated");
		this.loader.loaded = false;
		this.reloadRequested = true;
		this.load();
		//alert("reload exit");
	},

	load : function() {
		this.loader.load(this);
	},

	list : function(categoryID) {
		var arr = [];
		$.each(this.jsonData, function(i, row) {
			if (row.CategoryID == categoryID) {
				arr.push(row);
			};
		});
		return arr;
	}
};

/*
 * carouselObject
 */
function carouselObject(_domId, _categoryId, _menuId) {
	this.swiper = null;
	this.domId = _domId;
	this.categoryId = _categoryId;

	this.paginationDomId = _domId + "-pagination";
	this.templateSelector = _domId + ' .swiper-wrapper';
	this.template = '<div class="swiper-slide" onclick="openAnn({2});" >{0}<div class="desc">{1}</div></div>';
	this.reloadRequested = true;

	this.jsonData = null;
	this.menuId = _menuId;
	this.annIdForActivate = null;
}

carouselObject.prototype = {

	onSlideChangeEnd : function(sender, slideIndex) {
		var successFunc = function(obj, result) {
			//sender.jsonData[slideIndex].IsUnread = false;
			var annId = sender.swiper.slides[slideIndex].data("annId");
	 		console.log("successFunc annId: " + annId);
			for (var i = 0, j = sender.jsonData.length; i < j; i++) {
				var row = sender.jsonData[i];
				if (row.ID == annId && row.IsUnread) {
					
					row.IsUnread = false;
					console.log("sender.menuId: " + sender.menuId);
					console.log("badges.YeniUrun: " + badges.YeniUrun);
					console.log("badges.Firsat: " + badges.Firsat);
					switch(sender.menuId) {
						case "m1":
							app.setbadge("#left-menu a#m1 span.badge", --badges.YeniUrun);
							break;
						case "m2":
							app.setbadge("#left-menu a#m2 span.badge", --badges.Firsat);
							break;
					}
					
				}
			}
		};
		var errorFunc = function(obj, request, error) {
			// no action
		};

		/*
		 console.warn(sender.swiper);
		 console.log("annId: " + sender.swiper.slides[sender.swiper.activeIndex].data("annId"));
		 console.log("slideIndex: " + slideIndex);
		 console.log(sender.jsonData[slideIndex]);
		 console.log(sender.jsonData[sender.swiper.activeIndex]);
		 */
		var annId = sender.swiper.slides[slideIndex].data("annId");
	 	console.log("onSlideChangeEnd annId: " + annId);
		for (var i = 0, j = sender.jsonData.length; i < j; i++) {
			var row = sender.jsonData[i];
			if (row.ID == annId && row.IsUnread) {
	 			console.log("AnnRead.ashx annId: " + annId);
				var svcurl = String.format("/AnnRead.ashx?annId={0}&uuid={1}", annId, device.uuid);
				var jl = new jsonLoader(serviceHost + svcurl, successFunc, errorFunc);
				jl.load();
			}
		};
	},

	locateSlide : function() {
		var annId = this.annIdForActivate;
		this.annIdForActivate = null;

		var i = 0;
		var j = this.swiper.activeIndex;
		while (annId != this.swiper.slides[j].data("annId") && i < this.swiper.slides.length) {
			//console.warn("i:" + i + ", j:" + j + ", compareAnnId:" + this.swiper.slides[j].data("annId") + ", annId:" + annId);
			i++;
			j++;
			if (j == this.swiper.slides.length) {
				j = 0;
			}
		}
		if (j == 0) {
			j = this.swiper.slides.length;
		}

		this.swiper.swipeTo(--j, 0, true);
	},

	render : function() {
		//https://github.com/nolimits4web/Swiper/blob/master/demo-apps/gallery/js/gallery-app.js
		var self = this;

		if (self.swiper == null) {
			self.swiper = new Swiper(self.domId, {
				pagination : self.paginationDomId,
				loop : true,
				grabCursor : true,
				paginationClickable : false,
				onSlideChangeEnd : function(e) {
					self.onSlideChangeEnd(self, e.activeIndex);
				}
			});
		} else {
			while (self.swiper.slides.length > 1) {
				self.swiper.removeLastSlide();
			}
		}

		var template = self.template;
		$.each(self.jsonData, function(i, row) {
			var imgHtml = String.format('<img src="{0}" width="100%"/>', row.ImageUrl);
			var annUrl = "'" + row.RedirectUrl + "'";
			var divHtml = String.format(template, imgHtml, row.Description + '<br/><br/>', annUrl);
			var ns = self.swiper.createSlide(divHtml);
			ns.data('annId', row.ID);
			self.swiper.prependSlide(ns);
		});
		self.swiper.removeLastSlide();

		enableLinks(this.templateSelector);

		self.swiper.reInit();
		self.onSlideChangeEnd(self, 0);
	},

	load : function() {
		try {
			if (this.reloadRequested) {
				this.jsonData = null;
				this.reloadRequested = false;
			}
			if (this.jsonData == null) {
				this.jsonData = app.announcements.list(this.categoryId);
				this.render();
			};
			if (this.annIdForActivate != null) {
				this.locateSlide();
			}
		} catch(e) {
		}
	}
};

/*
 * guzellikSirlari
 */
function guzellikSirlari(_categoryId, _appObjVarName) {
	this.templateSelector = '#gsTemplateB';
	this.template = '<li onclick="goGsDetail(app.{2}, {3})"><img src="{0}"/><p>{1}</p></li>';
	this.categoryId = _categoryId;
	this.jsonData = null;
	this.appObjVarName = _appObjVarName;
	this.annIdForActivate = null;
}

guzellikSirlari.prototype = {
	render : function() {
		var self = this;
		var arr = [];
		$.each(self.jsonData, function(i, row) {
			arr.push(String.format(self.template, row.ImageUrl, row.Description, self.appObjVarName, i));
		});
		$(this.templateSelector).html(arr.join(''));

		if (self.annIdForActivate != null) {
			var n = 0;
			$.each(self.jsonData, function(i, row) {
				if (self.annIdForActivate == row.ID) {
					n = i;
				}
			});

			self.annIdForActivate = null;

			var strFunc = String.format('goGsDetail(app.{0}, {1})', self.appObjVarName, n);
			setTimeout(strFunc, 0);
		}
	},

	load : function(annIdForActivate) {
		this.annIdForActivate = annIdForActivate;

		$(this.templateSelector).html("");

		if (this.reloadRequested) {
			this.jsonData = null;
			this.reloadRequested = false;
		}

		if (this.jsonData == null) {
			this.jsonData = app.announcements.list(this.categoryId);
		};
		this.render();
	}
};

/*
 * guzellikSirlariChild
 */
function guzellikSirlariChild(_row) {
	this.templateSelector = '#gsbContent2';
	this.template = '<div class="gsb2img" onclick="openAnn({2})"><img src="{0}"/></div><div class="gsb2text">{1}</div>';
	this.row = _row;
}

guzellikSirlariChild.prototype = {
	setReadInfo : function() {
		var successFunc = function(sender, result) {
			sender.row.IsUnread = false;
			app.setbadge('#left-menu a#m3 span.badge', --badges.GuzellikSirlari);

			switch(sender.row.CategoryID) {
				case 31:
					app.setbadge('.brick.b1-1 span.badge', --badges.GuzellikSirlariGoz);
					break;
				case 32:
					app.setbadge('.brick.b2-1 span.badge', --badges.GuzellikSirlariYuz);
					break;
				case 33:
					app.setbadge('.brick.b3-1 span.badge', --badges.GuzellikSirlariDudak);
					break;
				case 34:
					app.setbadge('.brick.b4-1 span.badge', --badges.GuzellikSirlariTirnak);
					break;
			}
			//console.warn("okundu...");
		};
		var errorFunc = function(sender, request, error) {
			// no action
		};

		var self = this;
		if (self.row.IsUnread) {
			var svcurl = String.format("/AnnRead.ashx?annId={0}&uuid={1}", self.row.ID, device.uuid);
			var jl = new jsonLoader(serviceHost + svcurl, successFunc, errorFunc);
			jl.load(self);
		}
	},

	render : function() {
		var self = this;
		var annUrl = "'" + self.row.RedirectUrl + "'";
		var content = String.format(self.template, self.row.ChildImageUrl, self.row.ChildDescription, annUrl);
		$(self.templateSelector).html(content);
		enableLinks(self.templateSelector);
		self.setReadInfo();
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
			$(this.selector).html("");
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
	this.templateDiv = '<div class="cat-slide">{0}</div>';
	this.templateImage = '<img id="zoom-image{1}" class="ci" src="{0}" width="100%">';
	this.trying = false;
	this.loaded = false;
	this.images = [];
	this.loadedImageCount = 0;
	this.swiper = null;
}

catalogueObject.prototype = {

	extractRawData : function(jsonData) {
		function imageLoadPost(self) {
			self.loadedImageCount++;
			$("#page-gesture .loading .badge").html(String.format("{0} / {1}", self.loadedImageCount, self.images.length));
			if (self.loadedImageCount == self.images.length) {
				$("#page-gesture .loading").hide();
				self.createSwiper();
			}
		}

		var self = this;

		self.images = [];
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
		});
	},

	onCloseCatalogue : function() {
		/*
		 * Katalog yüklenmeden çıkılacaksa exception oluşuyor ve bu
		 * sebeple homePage'e dönemiyor diye try..catch diye eklendi.
		 */
		try {
			var pageIndex = app.catalogue.swiper.activeLoopIndex;
			$('#zoom-image' + pageIndex).smoothZoom('Reset');
		} catch(e) {
		}
	},

	setSlideHtml : function(pageIndex) {
		var self = app.catalogue;
		if (pageIndex >= 0 && pageIndex < self.images.length) {

			if (self.swiper.slides[pageIndex].html() == self.templateDiv) {
				var img = self.images[pageIndex];
				var imgHtml = String.format(self.templateImage, img.src, pageIndex);
				var slideHtml = String.format(self.templateDiv, imgHtml);
				self.swiper.slides[pageIndex].html(slideHtml);

				self.createSmoothZoom('#zoom-image' + pageIndex);
				/*
				$('#zoom-image' + pageIndex).parent().css({
				"height" : app.catalogueHeight + "px",
				"width" : app.windowWidth + "px"
				});
				*/
				//console.log("h:" + $('#zoom-image' + pageIndex).css("height"));
			} else {
				$('#zoom-image' + pageIndex).smoothZoom('Reset');
			}
		}
	},

	setPage : function(pageIndex) {
		var self = app.catalogue;

		var pn = String.format("{0} / {1}", pageIndex + 1, self.images.length);
		$('#page-gesture div[data-role="content"] .page-numbers').html(pn);

		self.setSlideHtml(pageIndex);
		self.setSlideHtml(pageIndex - 1);
		self.setSlideHtml(pageIndex + 1);

		// empty the other slides
		for (var i = 0, j = self.images.length; i < j; i++) {
			if (i < pageIndex - 1 && i > pageIndex + 1) {
				self.swiper.slides[i].html(self.templateDiv);
			}
		};
	},

	createSwiper : function() {
		var self = this;
		if (self.swiper == null) {
			/*
			 * ---------------------------------------------------------
			 * Create swiper and handle events
			 * ---------------------------------------------------------
			 */
			self.swiper = new Swiper('#carousel4', {
				mode : 'vertical',
				onSlideChangeEnd : function(e) {
					app.catalogue.setPage(e.activeLoopIndex);
				}
			});

			// init blank slides
			for ( i = 0; i < self.images.length; i++) {
				var ns = self.swiper.createSlide(self.templateDiv);
				self.swiper.appendSlide(ns);
			}
			self.setPage(0);
			$('#page-gesture div[data-role="content"] .page-numbers').show();
		}
	},
	createSmoothZoom : function(imgId) {
		$(imgId).smoothZoom({
			width : app.windowWidth,
			height : app.catalogueHeight,
			responsive : false,
			responsive_maintain_ratio : false,
			zoom_MAX : 400,
			zoom_OUT_TO_FIT : true,
			zoom_BUTTONS_SHOW : false,
			pan_BUTTONS_SHOW : false,
			pan_LIMIT_BOUNDARY : true
		});
	},

	load : function() {
		if (!this.loaded && !this.trying) {
			var obj = this;
			obj.trying = true;

			glog.step("catalogueObject.load");

			$("#page-gesture .loading").show();

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
				}
			});
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

function openAnn(url) {
	try {
		if (url != null && url != "null" && url != "") {
			ref = window.open(encodeURI("http://" + url), '_new', 'location=no,enableViewPortScale=yes');
		}
		//encode is for if you have any variables in your link
	} catch (err) {
		alert(err);
	}
}

function openInAppBrowser(url) {
	try {
		ref = window.open(encodeURI(url), '_blank', 'location=no,enableViewPortScale=yes');
		//encode is for if you have any variables in your link
	} catch (err) {
		alert(err);
	}
}

function isDate(txtDate) {
	var currVal = txtDate;
	if (currVal == '')
		return false;

	//Declare Regex
	var rxDatePattern = /^(\d{1,2})(\/|-)(\d{1,2})(\/|-)(\d{4})$/;
	var dtArray = currVal.match(rxDatePattern);
	// is format OK?

	if (dtArray == null)
		return false;

	/*
	//Checks for mm/dd/yyyy format.
	dtMonth = dtArray[1];
	dtDay = dtArray[3];
	dtYear = dtArray[5];

	//Checks for dd/mm/yyyy format.
	dtDay = dtArray[1];
	dtMonth= dtArray[3];
	dtYear = dtArray[5];
	*/

	//Checks for yyyy/mm/dd format.
	dtYear = dtArray[1];
	dtMonth = dtArray[3];
	dtDay = dtArray[5];

	if (dtMonth < 1 || dtMonth > 12)
		return false;
	else if (dtDay < 1 || dtDay > 31)
		return false;
	else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31)
		return false;
	else if (dtMonth == 2) {
		var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
		if (dtDay > 29 || (dtDay == 29 && !isleap))
			return false;
	}
	return true;
}

function isValidEmailAddress(emailAddress) {
	var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
	return pattern.test(emailAddress);
};

function showMessage(msg, title, buttonCaption) {
	var btnCaption = buttonCaption ? buttonCaption : "Tamam";
	navigator.notification.alert(msg, null, title, btnCaption);
}

function postCustomerInfoForm() {

	var successFunc = function(obj, result) {
		showMessage("Formunuz kayda alındı.\r Teşekkür ederiz.", "Bilgi");
		$('#btnSubmitForm').attr("disabled", false);
	};
	var errorFunc = function(obj, request, error) {
		showMessage("Bir problem oluştu.\r Lütfen tekrar deneyin.", "Uyarı");
		$('#btnSubmitForm').attr("disabled", false);
		//console.warn(error);
	};

	var adSoyad = $('#tbAdSoyad').val();
	var dogumTarihi = $('#tbDogumTar').val();
	var tel = $('#tbTel').val();
	var smsAl = $('#cbxSms').val() == "on";
	var eposta = $('#tbEmail').val();
	var epostaAl = $('#cbxEmail').val() == "on";

	var data = String.format("ad={0}&dt={1}&tel={2}&sms={3}&ep={4}&epal={5}&uuid={6}", adSoyad, dogumTarihi, tel, smsAl ? "1" : "0", eposta, epostaAl ? "1" : "0", device.uuid);
	console.log(data);

	console.log(adSoyad);
	console.log(dogumTarihi);
	console.log(tel);
	console.log(smsAl);
	console.log(eposta);
	console.log(epostaAl);

	if (adSoyad.length == 0) {
		showMessage("Formu göndermek için ad soyad bilgilerinizi giriniz.", "Uyarı");
		return;
	}
	/*
	 if (dogumTarihi != "" && !isDate(dogumTarihi)) {
	 showMessage("Doğum tarihiniz için geçerli bir değer giriniz.", "Uyarı");
	 return;
	 }
	 */
	if (smsAl && tel.length == 0) {
		showMessage("Sms almak için telefon numaranızı giriniz.", "Uyarı");
		return;
	}
	if (epostaAl && eposta.length == 0) {
		showMessage("Eposta almak için eposta adresinizi giriniz.", "Uyarı");
		return;
	}
	if (epostaAl != "" && !isValidEmailAddress(eposta)) {
		showMessage("Geçerli bir eposta adresi giriniz.", "Uyarı");
		return;
	}
	if (tel.length == 0 && eposta.length == 0) {
		showMessage("Formu göndermek için telefon numarası ya da eposta adresi bilgilerinden en az birini giriniz.", "Uyarı");
		return;
	}

	$('#btnSubmitForm').attr("disabled", true);
	var svcurl = serviceHost + "/CustomerForm.ashx?" + data;
	var jl = new jsonLoader(svcurl, successFunc, errorFunc);
	jl.load();

	/*
	 $.ajax({
	 url : "ajax.php",
	 type : "POST",
	 data : "op=" + act + "&radioButton=" + $('.radioB:checked').val()
	 });
	 */
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

function goGsDetail(sender, itemIndex) {
	var row = sender.jsonData[itemIndex];
	app.lastGsChildRow = row;
	var child = new guzellikSirlariChild(row);
	child.render();

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

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds) {
			break;
		}
	}
}

function goPage(pageId) {
	$.mobile.changePage($("#" + pageId));
}

function enableLinks(selector) {
	$(selector + " a").each(function() {
		$(this).click(function() {
			try {
				//showMessage($(this)[0].href, "Bağlantı");
				openInAppBrowser($(this)[0].href);
			} catch(e) {
				showMessage(e, "Hata");
			}
		});
	});
}

function startGuzellikSirriAnimation() {
}

function loadMapScript(callbackFunctionName) {
	// Asynchronous Loading
	// https://developers.google.com/maps/documentation/javascript/examples/map-simple-async
	var keyForBrowser = appCodes.map.keyForBrowser;

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
