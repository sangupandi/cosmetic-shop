function SwiperObject(_swiperObjectId, _paginationObjectId, _swipeDataElementId, _swipeContentElementId, _categoryId) {
	this.swiperObject = null;
	this.swiperObjectId = _swiperObjectId;
	this.paginationObjectId = _paginationObjectId;
	this.swipeDataElementId = _swipeDataElementId;
	this.swipeContentElementId = _swipeContentElementId;
	this.swipeContentArray = null;
	this.categoryId = _categoryId;
}

function clsShop(_caption, _address, _phone, _latitude, _longitude, _active, _distance) {
	this.caption = _caption;
	this.address = _address;
	this.phone = _phone;
	this.latitude = _latitude;
	this.longitude = _longitude;
	this.active = _active;
	this.distance = _distance;
}

var catalogue = {
	initialized : false,

	load : function() {
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
					content += String.format('<img src="{0}" alt="">', row.Url);
				});
				$("#scroller").html(content);
			}
		};
	}
};

var preloadImages = {
	//images : {},
	load : function() {
		var svcurl = serviceHost + "/Preload.ashx";
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

var glog = {
	durations : {},

	logString : "",

	getDuration : function(processName) {
		var dateStart = glog.durations[processName + "_s"];
		var dateFinish = glog.durations[processName + "_e"];
		return dateFinish - dateStart;
	},

	fmtDate : function(dateValue) {
		return String.format("{0}.{1}.{2} {3}:{4}:{5}.{6}", dateValue.getFullYear(), dateValue.getMonth() + 1, dateValue.getDate(), dateValue.getHours(), dateValue.getMinutes(), dateValue.getSeconds(), dateValue.getMilliseconds());
	},

	step : function(processName) {
		if (glog.durations[processName + "_s"] == null) {
			glog.durations[processName + "_s"] = new Date();
			glog.log(processName + "STARTED at " + glog.fmtDate(glog.durations[processName + "_s"]));
		} else {
			glog.durations[processName + "_e"] = new Date();
			glog.log(processName + "FINISHED at " + glog.fmtDate(glog.durations[processName + "_e"]));
			glog.warn(processName + "DURATIONS : " + glog.getDuration(processName) + "(ms)");
		}
	},

	log : function(msg) {
		glog.logString += msg + "<br/>";
		//console.log(msg);
	},

	warn : function(msg) {
		glog.logString += msg + "<br/>";
		//console.warn(msg);
	}
};

var app = {
	// Application Constructor
	initialize : function() {
		glog.step("initialize");
		this.bindEvents();
		glog.step("initialize");
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents : function() {
		glog.step("bindEvents");
		document.addEventListener('deviceready', this.onDeviceReady, false);
		glog.step("bindEvents");
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady : function() {
		glog.step("onDeviceReady");
		app.receivedEvent('deviceready');
		glog.step("onDeviceReady");
	},

	sx : 0,

	headerHeight : 0,
	footerHeight : 0,
	contentHeight : 0,

	shopList : [],
	shopListTemplate : "",
	shopListSelector : "#shop-list .liste",
	nearestShop : null,
	currentLocation : null,
	map : null,
	mapApiKey : 'e888e31cc2b64f3f9af01474eb553c39',
	updateCurrentMap : true,
	backPageId : "",
	currentPageId : function() {
		return $.mobile.activePage.attr('id');
	},

	firstInit : true,
	firstInitialize : function() {
		if (!app.firstInit) {
			return;
		}
		app.firstInit = true;

		preloadImages.load();

		if (app.mapApiReady && !app.mapInitialized)
			app.initMap();
	},

	currentLocationMarker : null,
	mapInitialized : false,
	mapApiReady : false,
	onMapApiLoad : function() {
		app.mapApiReady = true;
		if (!app.mapInitialized) {
			app.initMap();
		}
	},
	initMap : function() {
		// init map first time
		glog.step("--init map first time");
		if (app.mapApiReady) {

			var initialLocation = new google.maps.LatLng(39.92661, 32.83525);

			google.maps.visualRefresh = true;

			var mapOptions = {
				zoom : 13,
				center : initialLocation,
				rotateControl : false,
				streetViewControl : false,
				mapTypeControl : false,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};
			app.map = new google.maps.Map(document.getElementById('map'), mapOptions);

			app.mapInitialized = true;
		} else {
			glog.warn("******googleMap is not ready");
		}
		glog.step("--init map first time");
	},
	swHome : null,

	addMarkers : function() {
		glog.step("addMarkers");
		if (app.shopList.length > 0) {
			var map = app.map;
			$.each(app.shopList, function() {

				var shopLocation = new google.maps.LatLng(this.latitude, this.longitude);

				var marker = new google.maps.Marker({
					position : shopLocation,
					map : map,
					bounds : false,
					title : this.Caption,
					icon : serviceHost + '/files/cosmetica_marker.png',
					animation : google.maps.Animation.DROP
				});

			});
		}
		glog.step("addMarkers");
	},
	renderShopList : function() {
		glog.step("renderShopList");
		var formatDistance = function(value) {
			//if ( typeof value === undefined) {
			if (value == null) {
				return "---";
			} else {
				return (value < 1000.0) ? value.toFixed(0) + " m" : (value > 1000000) ? ">1000 km" : (value / 1000).toFixed(0) + " km";
			}
		};
		$(app.shopListSelector).html();
		if (app.shopList.length > 0) {
			var tmp = '';
			$.each(app.shopList, function() {
				tmp = tmp + String.format(app.shopListTemplate, this.caption, this.address, formatDistance(this.distance), this.latitude, this.longitude);
				$(app.shopListSelector).html(tmp);
			});

			if (app.mapApiReady) {
				app.addMarkers();
			}
		}
		glog.step("renderShopList");
	},
	recalculateDistances : function() {
		glog.step("recalculateDistances");
		if (app.mapApiReady && (app.shopList.length > 0) && (app.currentLocation != null)) {
			app.nearestShop = null;
			$.each(app.shopList, function() {
				var latLngB = new google.maps.LatLng(this.latitude, this.longitude);
				this.distance = google.maps.geometry.spherical.computeDistanceBetween(app.currentLocation, latLngB);
				if (app.nearestShop == null || app.nearestShop.distance > this.distance) {
					app.nearestShop = this;
				}
			});
			app.renderShopList();
		}
		glog.step("recalculateDistances");
	},
	startAnim : function() {
		glog.step("startAnim");
		var debugFunc = function() {
			var c = $('#ani-page div[data-role="content"]');
			var s = '[h:' + c.height() + ' , w:' + c.width() + '] [sh:' + $(window).height() + ' , sw:' + $(window).width() + ']';
			alert(s);
		};

		var contentHeight = getRealContentHeight();

		console.log("started ani-logo fade");
		/*
		 $('#ani-logo').fadeTo(1000, 1, function() {
		 console.log("finished ani-logo fade");
		 //debugFunc();
		 setTimeout(function() {
		 glog.step("--changing home_page");
		 $.mobile.changePage($("#home_page"), {
		 transition : "fade"
		 });
		 glog.step("--changing home_page");
		 }, 600);
		 });
		 */

		/* starting animation */
		var aniC = $('#ani-c');
		console.log("started ani-c transition");
		var t1 = 447 * 480 / 960;
		var t2 = 422 * 480 / 960;
		$('#ani-c').transition({
			y : t1 + 'px'
		}, 800, 'ease').transition({
			y : t2 + 'px'
		}, 800, 'ease');

		setTimeout(function() {
			glog.step("--changing home_page");
			$.mobile.changePage($("#home_page"), {
				transition : "fade"
			});
			glog.step("--changing home_page");
		}, 2000);

		console.log("finished ani-c transition");
		/* end of animation */
		glog.step("startAnim");
	},
	putSetting : function(key, value) {
		//console.log(key + " : " + value);
		window.localStorage.setItem(key, value);
	},
	getSetting : function(key, defaultValue) {
		var ret = window.localStorage.getItem(key);
		return (ret != null) ? ret : defaultValue;
	},

	// Update DOM on a Received Event
	receivedEvent : function(id) {
		var initMenu = function(menuSelector) {
			glog.step("initMenu");

			var mousefunc = function(event, ui) {
				var src = $(this).attr("src");
				var src2 = $(this).attr("src2");
				$(this).attr("src", src2);
				$(this).attr("src2", src);
			};
			$(menuSelector).each(function() {
				$(this).bind('vmousedown', mousefunc);
				$(this).bind('vmouseup', mousefunc);
			});
			glog.step("initMenu");
		};

		var initAnimPageLayout = function() {
			glog.step("initAnimPageLayout");
			/* ani-page background-image *
			 var h = $(window).height();
			 var w = $(window).width();
			 //alert("res: " + w + "x" + h);
			 var bgUrl = "";
			 var prefix = "../www/res/screen/";
			 if (platform_iOS()) {
			 if (w == 320) {// 320x480  iPhone3G/3Gs
			 bgUrl = prefix + "ios/screen-iphone-portrait.png";
			 } else if (w == 640) {// 640x960  iPhone4/4s
			 bgUrl = prefix + "ios/screen-iphone-portrait-2x.png";
			 } else if (w == 640) {// 640x1136 iPhone5/5s/5c
			 bgUrl = prefix + "ios/screen-iphone-portrait-568h-2x.png";
			 }
			 } else {
			 // android detect
			 if (w < 320) {
			 bgUrl = prefix + "android/screen-ldpi-portrait.png";
			 } else if (w < 480) {
			 bgUrl = prefix + "android/screen-mdpi-portrait.png";
			 } else if (w < 720) {
			 bgUrl = prefix + "android/screen-hdpi-portrait.png";
			 } else {// if (w >= 720)
			 bgUrl = prefix + "android/screen-xhdpi-portrait.png";
			 }
			 }
			 $('#ani-page, #first-page').css({
			 "background" : "url(" + bgUrl + ") no-repeat center center fixed"
			 });

			 /* set #ani-page content size */
			$('#ani-page div[data-role="content"]').css({
				"height" : $(window).height() + "px"
			});
			// 923x1391 c.png
			// 640x1136 iPhone5
			var cWidth = $(window).width();
			var cHeight = cWidth * 1391 / 923;

			$('#ani-c').css({
				"width" : cWidth + "px",
				"height" : cHeight + "px",
				"top" : "-" + cHeight + "px"
			});

			$('#ani-logo').css({
				"top" : "-" + (cHeight / 2) + "px"
				//"display":"block"
			});
			glog.step("initAnimPageLayout");
		};

		var initLayoutSizes = function() {
			glog.step("initLayoutSizes");

			/* header height (size: 565x107) */
			app.headerHeight = $(window).width() * 107 / 565;

			/* footer height (size: 600x80) */
			app.footerHeight = $(window).width() * 80 / 600;

			/* content height */
			app.contentHeight = $(window).height() - app.headerHeight - app.footerHeight;

			/* enlarge contents size */
			$('div[data-role="content"]').each(function() {
				$(this).css({
					"height" : app.contentHeight + "px"
				});
			});

			/* set size of headers */
			$('div[data-role="header"]').each(function() {
				$(this).css({
					"height" : app.headerHeight + "px"
				});
			});

			/* set #home_page menu size (size: 147x901) */
			//var contentHeight = getRealContentHeight();
			//var menuWidth = ($(window).height() * 106 / 901) * 147 / 106;
			var menuWidth = $(window).height() * 147 / 901;
			$("#left-menu").css({
				"width" : menuWidth + "px"
			});

			/* set #home_page logo size (size: 457x108) (design width: 601px)*/
			var homeLogoWidth = $(window).width() * 457 / 601;
			$("#hp-header img").css({
				"width" : homeLogoWidth + "px"
			});

			/* set #home_page header size */
			var homeLogoHeight = homeLogoWidth * 108 / 457;
			$('#home_page div[data-role="header"]').css({
				"height" : homeLogoHeight + "px"
			});

			/* set #home_page content size */
			var homeContentHeight = $(window).height() - homeLogoHeight;
			$('#home_page div[data-role="content"]').css({
				"height" : homeContentHeight + "px"
			});

			/* set big picture container height */
			/*
			 $("#hp-pic").css({
			 //"top" : homeLogoHeight + "px",
			 "height" : homeContentHeight + "px"
			 });
			 */

			/* set swiper image size (size: 535x332)*/
			var swHeight = $(window).width() * 332 / 535;
			$('.swiper-container').each(function() {
				$(this).css({
					"height" : swHeight + "px"
				});
			});
			/* set swiper container height */
			$("#swiper-home").css({
				//"top" : "-" + homeLogoHeight + "px",
				"height" : $(window).height() + "px"
			});

			/* gs = "güzellik sırları" */
			w = $(window).width();
			h = app.contentHeight;

			gsPadding = 10;
			gsPaddingLeft = 10;
			gsSpacing = 3;

			bw = (w - (gsPadding * 2) - (gsSpacing * 2)) / 3;
			bh = (h - (gsPadding * 3) - (gsSpacing * 3)) / 4;

			if (bw * 4 > h) {
				gsBrickSize = bh;
				gsPaddingLeft = (w - (gsBrickSize * 3) - (gsSpacing * 2)) / 2;
			} else {
				gsBrickSize = bw;
			}

			//alert(h + "px, " + bw * 4 + "px");
			//alert(w + "px, " + bh * 3 + "px");
			//gsBrickSize = (w - (gsPadding * 2) - (gsSpacing * 2)) / 3;

			$("#page-guzellik .brick").css({
				"width" : gsBrickSize + "px",
				"height" : gsBrickSize + "px"
			});
			// col 1
			$(".b1-1, .b2-1, .b3-1, .b4-1").css({
				"left" : gsPaddingLeft + "px"
			});
			// col 2
			$(".b1-2, .b2-2, .b3-2, .b4-2").css({
				"left" : gsPaddingLeft + gsBrickSize + gsSpacing + "px"
			});
			// col 3
			$(".b1-3, .b2-3, .b3-3, .b4-3").css({
				"left" : gsPaddingLeft + (gsBrickSize * 2) + (gsSpacing * 2) + "px"
			});
			// row 1
			$(".b1-1, .b1-2, .b1-3").css({
				"top" : app.headerHeight + gsPadding + "px"
			});
			// row 2
			$(".b2-1, .b2-2, .b2-3").css({
				"top" : app.headerHeight + gsPadding + gsBrickSize + gsSpacing + "px"
			});
			// row 3
			$(".b3-1, .b3-2, .b3-3").css({
				"top" : app.headerHeight + gsPadding + (gsBrickSize * 2) + (gsSpacing * 2) + "px"
			});
			// row 4
			$(".b4-1, .b4-2, .b4-3").css({
				"top" : app.headerHeight + gsPadding + (gsBrickSize * 3) + (gsSpacing * 3) + "px"
			});

			$('.b1-1, .b2-1, .b3-1, .b4-1').each(function() {
				$(this).bind("tap", function() {
					$.mobile.changePage($('#page-guzellik-b'), {
						transition : "slide"
					});
				});
			});

			//var gsbConPad = 16;
			//var gsbImgH = (app.contentHeight - (gsbConPad*2))/ 3;
			var gsbImgH = 200 * w / 565;
			$("#page-guzellik-b .ui-grid-a img").css({
				"height" : gsbImgH + "px",
				"width" : "auto"
			});

			$("#page-guzellik-b .ui-grid-a").each(function() {
				$(this).bind("tap", function() {
					$.mobile.changePage($('#page-guzellik-c'), {
						transition : "slide"
					});
				});
			});

			//app.bricks[".b1-1"]=$(".b1-1").css

			app.sx = app.headerHeight + gsPadding + (gsBrickSize * 3) + (gsSpacing * 3) + gsBrickSize;
			console.log("sx:" + app.sx);
			/*
			 $('#page-guzellik div[data-role="header"]').bind("tap", function() {
			 /*
			 $("#page-guzellik .brick").css({
			 "display" : "none"
			 });
			 *

			 $(".b4-1, .b4-2, .b4-3").each(function() {
			 var lf = $(this).css("left").replace("px","");

			 console.log("sx:" + app.sx);
			 console.log(this.className + ", lf: " + lf + ", lf-sx: " + (lf - app.sx));

			 $(this).css({
			 "left" : (lf - app.sx) + "px",
			 "display" : "block"
			 });

			 //setTimeout(function() {
			 $(this).transition({
			 x : lf + 'px'
			 }, 'slow', function() {
			 });
			 //}, 1000);

			 });

			 });
			 */

			glog.step("initLayoutSizes");
		};

		var initFooterMenuTapActions = function() {
			glog.step("initFooterMenuTapActions");
			$('.f1').each(function() {
				$(this).bind('tap', function() {
					$.mobile.changePage($("#home_page"));
				});
			});

			$('.f2').each(function() {
				$(this).bind('tap', function() {
					window.plugins.socialsharing.available(function(isAvailable) {
						if (isAvailable) {/*
							// use a local image from inside the www folder:
							window.plugins.socialsharing.share('My text with a link: http://domain.com', 'My subject', 'www/image.gif');
							// succes/error callback params may be added as 4th and 5th param
							// .. or a local image from anywhere else (if permitted):
							// local-iOS:
							window.plugins.socialsharing.share('My text with a link: http://domain.com', 'My subject', '/Users/username/Library/Application Support/iPhone/6.1/Applications/25A1E7CF-079F-438D-823B-55C6F8CD2DC0/Documents/.nl.x-services.appname/pics/img.jpg');
							// local-Android:
							window.plugins.socialsharing.share('My text with a link: http://domain.com', 'My subject', 'file:///storage/emulated/0/nl.xservices.testapp/5359/Photos/16832/Thumb.jpg');
							// .. or an image from the internet:
							window.plugins.socialsharing.share('My text with a link: http://domain.com', 'My subject', 'http://domain.com/image.jpg');
							// .. or only text:
							window.plugins.socialsharing.share('My text');
							// .. (or like this):
							window.plugins.socialsharing.share('My text', null, null);
							// use '' instead of null for pre-2.0 versions of this plugin
							*/
							//window.plugins.socialsharing.share('My text with a link: serviceHost);
							window.plugins.socialsharing.share("Kalbimdeki yer: http://www.cosmetica.com.tr");
						}
					});
				});
			});

			$('.f3').each(function() {
				$(this).bind('tap', function() {
					//$('#map-canvas').html('');
					app.updateCurrentMap = true;
					$.mobile.changePage($("#page-harita"));
				});
			});

			$('.fback').each(function() {
				$(this).bind('tap', function() {
					/*
					 //$('#map-canvas').html('');
					 if (app.backPageId == "page-harita") {
					 app.updateCurrentMap = false;
					 }
					 var pageId = (app.backPageId != "") ? app.backPageId : "home_page";
					 app.backPageId = "";
					 $.mobile.changePage($("#" + pageId));
					 */
					try {

						navigator.app.backHistory();
					} catch(e) {
						window.history.back();
					}
				});
			});

			$('.f4').each(function() {
				$(this).bind('tap', function() {
					app.backPageId = app.currentPageId();
					$.mobile.changePage($("#page-ayarlar"));
				});
			});
			glog.step("initFooterMenuTapActions");
		};

		// receivedEvent ------------------------------------------------------------------------------
		glog.step('receivedEvent :' + id);
		console.log('receivedEvent :' + id);

		$.support.cors = true;
		$.mobile.allowCrossDomainPages = true;
		$.mobile.pushStateEnabled = false;
		$.mobile.touchOverflowEnabled = false;
		$.mobile.defaultPageTransition = 'flip';
		$.mobile.defaultDialogTransition = 'none';
		$.mobile.transitionFallbacks.slide = 'none';
		$.mobile.transitionFallbacks.pop = 'none';
		$.mobile.buttonMarkup.hoverDelay = 0;
		$.mobile.phonegapNavigationEnabled = true;

		initAnimPageLayout();
		setTimeout(function() {
			/* close splashScreen and start animation */
			$.mobile.changePage($("#ani-page"), {
				transition : "none"
			});
		}, 0);

		initLayoutSizes();
		console.log("finish initLayoutSizes");

		initMenu('#left-menu img');
		initMenu('.fm');
		initMenu('.sm');
		console.log("finish initMenu");

		initFooterMenuTapActions();
		console.log("finish initFooterMenuTapActions");

		$('#cbxSetting1').attr('checked', app.getSetting('set1', 'true') == 'true');
		$('#cbxSetting2').attr('checked', app.getSetting('set2', 'true') == 'true');
		$('#cbxSetting3').attr('checked', app.getSetting('set3', 'true') == 'true');
		$('#cbxSetting4').attr('checked', app.getSetting('set4', 'true') == 'true');
		console.log("finish app.getSetting(s)");

		//$('#home_page div[data-role="header"] img').bind('tap', app.localNotificationTrigger);
		//$('#page-ayarlar div[data-role="header"] img').bind('tap', app.localNotificationTrigger);

		startupSteps();
		//detectCurrentLocation(true);
		glog.step('receivedEvent :' + id);
	},
	localNotificationTrigger : function() {
		var d = new Date();
		d = d.getTime() + (60 * 1000) / 10;
		// 6 second
		//60 seconds from now
		d = new Date(d);

		$('#debugLabel').html("adding notification");
		window.plugins.localNotification.add({
			date : d, // your set date object
			message : 'Hello world!',
			repeat : 'weekly', // will fire every week on this day
			badge : 1,
			foreground : 'foreground',
			background : 'background',
			sound : 'sub.caf'
		});
		$('#debugLabel').html("added notification");

		function foreground(id) {
			$('#debugLabel').html("I WAS RUNNING ID=" + id);
		}

		function background(id) {
			$('#debugLabel').html("I WAS IN THE BACKGROUND ID=" + id);
		}

	},
	initHomeSwiper : function() {
		glog.step('initHomeSwiper');
		if (app.swHome == null) {
			app.swHome = $('#swiper-home').swiper({
				pagination : '#pagination-home',
				paginationClickable : true,
				loop : true,
				initialSlide : 0,
				onSlideClick : function(control) {
					goPage(control.clickedSlide.getAttribute('page-id'));
				}
			});
			$('#swiper-home').css({
				"display" : "none",
				"visibility" : "visible"
			});
			$('#swiper-home').fadeTo(100, 1);
			/*
			 if ($('#hp-pic').is(":visible")) {

			 $('#hp-pic').fadeTo(200, 0, function() {
			 $('#swiper-home').css({
			 "display" : "none",
			 "visibility" : "visible"
			 });
			 $('#swiper-home').fadeTo(500, 1);
			 });
			 }*/
		}
		glog.step('initHomeSwiper');
	}
};
