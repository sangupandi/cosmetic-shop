var internalVersion = "Version 1.0.0 Build:785";
var serviceHost = "http://www.gtech.com.tr/cosmetica";

/*
 * b58805c0606d742d MY XperiaZ
 * 1D457E0D-1433-4E4D-A274-B4288308AC7F GTech iPhone4
 *
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

function announcementsObject() {
	this.jsonData = null;
	this.svcurl = serviceHost + "/Announcements.ashx?uuid=" + device.uuid;
	this.loader = new jsonLoader(this.svcurl, this.successHandler, this.errorHandler);
}

announcementsObject.prototype = {
	errorHandler : function(sender, request, error) {
		var s = 'Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz!';
		showMessage(s, 'Veri İletişimi');
	},

	successHandler : function(sender, result) {
		if (result != null) {
			sender.jsonData = result;
		}
	},

	load : function() {
		this.loader.load(this);
	},

	list : function(categoryID) {
		var arr = [];
		$.each(this.jsonData, function(i, row) {
			if (row.CategoryID == categoryID) {
				console.dir(row);
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
	this.template = '<div class="swiper-slide">{0}<div class="desc">{1}</div></div>';

	this.jsonData = null;
	this.menuId = _menuId;

	//this.svcurl = serviceHost + "/Announcements.ashx?cat=" + _categoryId + "&uuid=" + device.uuid;
	//this.loader = new jsonLoader(this.svcurl, this.successHandler, this.errorHandler);
}

carouselObject.prototype = {
	/*
	 errorHandler : function(sender, request, error) {
	 alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
	 },

	 successHandler : function(sender, result) {
	 if (result != null) {
	 sender.jsonData = result;
	 //console.dir(sender.jsonData);

	 var arr = [];
	 var template = sender.template;
	 $.each(result, function(i, row) {
	 arr.push(String.format(template, row.Html, row.Description + '<br/><br/>'));
	 });
	 $(sender.templateSelector).html(arr.join(""));
	 sender.render();
	 }
	 },
	 */
	onSlideChangeEnd : function(sender, slideIndex) {
		var successFunc = function(obj, result) {
			sender.jsonData[slideIndex].IsUnread = false;
			switch(sender.menuId) {
				case "m1":
					app.setbadge(sender.menuId, --app.badgeYeniUrun);
					break;
				case "m2":
					app.setbadge(sender.menuId, --app.badgeFirsat);
					break;
			}
		};
		var errorFunc = function(obj, request, error) {
			// no action
		};

		console.dir(sender.jsonData[slideIndex].IsUnread);

		if (sender.jsonData[slideIndex].IsUnread) {
			var svcurl = String.format("/AnnRead.ashx?annId={0}&uuid={1}", sender.jsonData[slideIndex].ID, device.uuid);
			var jl = new jsonLoader(serviceHost + svcurl, successFunc, errorFunc);
			jl.load();
		}
	},

	render : function() {
		//https://github.com/nolimits4web/Swiper/blob/master/demo-apps/gallery/js/gallery-app.js
		var self = this;

		/*
		 var arr = [];
		 $.each(self.jsonData, function(i, row) {
		 var imgHtml = String.format('<img src="{0}" width="100%"/>', row.ImageUrl);
		 var divHtml = String.format(self.template, imgHtml, row.Description + '<br/><br/>');

		 arr.push(divHtml);
		 });
		 $(self.templateSelector).html(arr.join(""));
		 */
		
		self.swiper = new Swiper(self.domId, {
			pagination : self.paginationDomId,
			loop : true,
			grabCursor : true,
			paginationClickable : false,
			onSlideChangeEnd : function(e) {
				self.onSlideChangeEnd(self, e.activeLoopIndex);
			}
		});

		var template = self.template;
		$.each(self.jsonData, function(i, row) {
			var imgHtml = String.format('<img src="{0}" width="100%"/>', row.ImageUrl);
			var divHtml = String.format(template, imgHtml, row.Description + '<br/><br/>');
			console.log(imgHtml);
			console.log(divHtml);

			var ns = self.swiper.createSlide(divHtml);
			self.swiper.prependSlide(ns);
		});
		self.swiper.removeLastSlide();

		//self.swiper.resizeFix();

		self.onSlideChangeEnd(self, 0);
	},

	load : function() {
		if (this.jsonData == null) {
			this.jsonData = app.announcements.list(this.categoryId);
			this.render();
		};
		//this.loader.load(this);
	}
};

/*
 * guzellikSirlari
 */
function guzellikSirlari(_categoryId, _appObjVarName) {
	this.templateSelector = '#gsTemplateB';
	this.template = '<li onclick="goGsDetail(app.{2}, {3})">{0}<p>{1}</p></li>';

	this.jsonData = null;
	this.appObjVarName = _appObjVarName;

	this.announcements = [];
	this.svcurl = serviceHost + "/Announcements.ashx?cat=" + _categoryId + "&uuid=" + device.uuid;
	this.loader = new jsonLoader(this.svcurl, this.successHandler, this.errorHandler);
}

guzellikSirlari.prototype = {
	errorHandler : function(sender, request, error) {
		alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
	},

	successHandler : function(sender, result) {
		if (result != null) {
			sender.jsonData = result;
			var template = sender.template;
			$.each(result, function(i, row) {
				sender.announcements.push(String.format(template, row.Html, row.Description, sender.appObjVarName, i));
			});
			sender.render();
		}
	},

	render : function() {
		$(this.templateSelector).html(this.announcements.join(""));
		//console.log($(this.templateSelector).html());
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
 * guzellikSirlariChild
 */
function guzellikSirlariChild(_parentId) {
	this.templateSelector = '#gsbContent2';
	this.template = '<div id="gsb2img">{0}</div><div id="gsb2text">{1}</div>';

	this.jsonData = null;
	this.announcements = [];
	this.svcurl = serviceHost + "/Announcements.ashx?pid=" + _parentId + "&uuid=" + device.uuid;
	this.loader = new jsonLoader(this.svcurl, this.successHandler, this.errorHandler);
}

guzellikSirlariChild.prototype = {
	setReadInfo : function() {
		var successFunc = function(obj, result) {
			obj.jsonData[0].IsUnread = false;
			app.setbadge("m3", --badges.GuzellikSirlari);

			switch(obj.jsonData[0].parentCategoryID) {
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
		var errorFunc = function(obj, request, error) {
			// no action
		};

		//console.dir(this);
		//console.log("IsUnread : " + this.jsonData[0].IsUnread);

		if (this.jsonData[0].IsUnread) {
			var svcurl = String.format("/AnnRead.ashx?annId={0}&uuid={1}", this.jsonData[0].ID, device.uuid);
			var jl = new jsonLoader(serviceHost + svcurl, successFunc, errorFunc);
			jl.load(this);
		}
	},

	errorHandler : function(sender, request, error) {
		alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
	},

	successHandler : function(sender, result) {
		if (result != null) {
			sender.jsonData = result;
			var template = sender.template;
			$.each(result, function(i, row) {
				sender.announcements.push(String.format(template, row.Html, row.Description, row.ID));
			});
			sender.render();
			sender.setReadInfo();
		}
	},

	render : function() {
		if (this.loader.loaded) {
			$(this.templateSelector).html(this.announcements.join(""));
			//console.log($(this.templateSelector).html());
		}
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
	this.templateDiv = '<div class="swiper-slide">{0}</div>';
	this.templateImage = '<img id="zoom-image{1}" src="{0}" width="100%">';
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
			//console.log($("#page-gesture .loading .badge").html());
			if (self.loadedImageCount == self.images.length) {
				$("#page-gesture .loading").hide();
				da("self.loadedImageCount == self.images.length");
				console.log("All images have loaded (or died trying)!");
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
			//sleep(50);
			da("self.images.push(img);");
			self.images.push(img);
		});
	},

	onCloseCatalogue : function() {
		var pageIndex = app.catalogue.swiper.activeLoopIndex;
		$('#zoom-image' + pageIndex).smoothZoom('Reset');
	},

	setSlideHtml : function(pageIndex) {
		da("setSlideHtml");
		var self = app.catalogue;
		if (pageIndex >= 0 && pageIndex < self.images.length) {

			if (self.swiper.slides[pageIndex].html() == self.templateDiv) {
				var img = self.images[pageIndex];
				var imgHtml = String.format(self.templateImage, img.src, pageIndex);
				var slideHtml = String.format(self.templateDiv, imgHtml);
				self.swiper.slides[pageIndex].html(slideHtml);

				self.createSmoothZoom('#zoom-image' + pageIndex);
			} else {
				$('#zoom-image' + pageIndex).smoothZoom('Reset');
			}
		}
	},

	setPage : function(pageIndex) {
		da("setPage");
		var self = app.catalogue;

		var pn = String.format("{0} / {1}", pageIndex + 1, self.images.length);
		$('#page-gesture div[data-role="content"] .page-numbers').html(pn);

		self.setSlideHtml(pageIndex);
		self.setSlideHtml(pageIndex - 1);
		self.setSlideHtml(pageIndex + 1);

		// empty the other slides
		da("empty the other slides");
		for (var i = 0, j = self.images.length; i < j; i++) {
			if (i < pageIndex - 1 && i > pageIndex + 1) {
				self.swiper.slides[i].html(self.templateDiv);
			}
		};
	},

	createSwiper : function() {
		var self = this;
		if (self.swiper == null) {
			da("createSwiper");
			/*
			 * ---------------------------------------------------------
			 * Create swiper and handle events
			 * ---------------------------------------------------------
			 */
			self.swiper = new Swiper('#carousel4', {
				//grabCursor : true,
				mode : 'vertical',
				//centeredSlides : true,
				//pagination : '#carousel4-pagination',
				//paginationClickable : true,
				onSlideChangeEnd : function(e) {
					app.catalogue.setPage(e.activeLoopIndex);
				}
			});
			da("init blank slides");

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
		da("createSmoothZoom");
		$(imgId).smoothZoom({
			width : '100%',
			height : '100%',
			responsive : true,
			responsive_maintain_ratio : true,
			zoom_MAX : 400,
			zoom_OUT_TO_FIT : true,
			zoom_BUTTONS_SHOW : false,
			pan_BUTTONS_SHOW : false,
			pan_LIMIT_BOUNDARY : true
		});
	},

	load : function() {
		da("load cat");
		//console.clear();
		da(this);
		da(this.loaded);
		da(this.trying);
		if (!this.loaded && !this.trying) {
			da("load cat if");
			var obj = this;
			obj.trying = true;

			da("glog.step load");
			glog.step("catalogueObject.load");

			da(".loading show");
			$("#page-gesture .loading").show();

			da("ajax");
			$.ajax({
				url : this.jsonDataUrl,
				dataType : "jsonp",
				async : true,
				success : function(result) {
					glog.step("catalogueObject.load");
					da("extractRawData");
					obj.extractRawData(result);

					obj.trying = false;
					obj.loaded = true;
				},
				error : function(request, error) {
					glog.step("catalogueObject.load");
					da("error");
					console.warn(request);
					console.warn(error);

					obj.trying = false;
				}
			});
		} else {
			da("already loaded");
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
		console.dir(result);
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
	if (epostaAl != "" && !isValidEmailAddress(epostaAl)) {
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
	var p = sender.jsonData[itemIndex];
	if (!p.gsChild) {
		p.gsChild = new guzellikSirlariChild(p.ID);
		p.gsChild.load();
	} else {
		p.gsChild.render();
	}

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
