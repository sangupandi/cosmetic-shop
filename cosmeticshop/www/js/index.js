var glog = {
	durations : {},

	logString : "",

	getDuration : function(processName) {
		var dateStart = glog.durations[processName + "_s"];
		var dateFinish = glog.durations[processName + "_e"];
		return dateFinish - dateStart;
	},

	fmtNow : function() {
		return glog.fmtDate(new Date());
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

			glog.durations[processName + "_s"] = null;
			glog.durations[processName + "_e"] = null;
		}
	},

	log : function(msg) {
		glog.logString += msg + "<br/>";
		console.log(msg);
	},

	warn : function(msg) {
		glog.logString += msg + "<br/>";
		console.log(msg);
	}
};

var app = {
	// Application Constructor
	initialize : function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents : function() {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicity call 'app.receivedEvent(...);'
	onDeviceReady : function() {
		app.receivedEvent('deviceready');
	},

	windowHeight : 0,
	windowWidth : 0,
	headerHeight : 0,
	footerHeight : 0,
	contentHeight : 0,

	carousel1 : new carouselObject("#carousel1", 5),
	carousel2 : new carouselObject("#carousel2", 10),
	preloadImages : new preloadObject("/Preload.ashx"),

	pageTransitionBusy : false,

	shopList : [],
	shopListTemplate : "",
	shopListSelector : "#shop-list .liste",
	nearestShop : null,
	currentLocation : null,
	map : null,
	//mapApiKey : 'e888e31cc2b64f3f9af01474eb553c39',
	updateCurrentMap : true,
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
	showCurrentLocationFirstTime : false,
	mapInitialized : false,
	mapApiReady : false,
	onMapApiLoad : function() {
		glog.step('loadMapScript');
		app.mapApiReady = true;
		if (!app.mapInitialized) {
			app.initMap();
			app.detectCurrentLocation(true);
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
				draggable : true,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};
			app.map = new google.maps.Map(document.getElementById('map'), mapOptions);

			app.mapInitialized = true;
		} else {
			glog.warn("******googleMap is not ready");
		}
		glog.step("--init map first time");
	},

	detectCurrentLocation : function(highAccuracy) {
		glog.step("detectCurrentLocation");
		var onGeoSuccess = function(position) {
			glog.step("detectCurrentLocation");
			glog.step("onGeoSuccess");
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
				icon : serviceHost + '/files/bluedot2.png'
				//animation : google.maps.Animation.BOUNCE
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

			app.showCurrentLocationFirstTime = true;

			glog.step("onGeoSuccess");
			//app.recalculateDistances();
		};

		var onGeoFail = function(error) {
			glog.step("detectCurrentLocation");

			$("#location-info").fadeIn(200);
			$("#location-info").html("Konum bilginize ulaşılamıyor.");
		};

		navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoFail, {
			timeout : 8000,
			enableHighAccuracy : highAccuracy
		});
	},

	showCurrentLocation : function() {
		glog.step("showCurrentLocation");

		app.showCurrentLocationFirstTime = false;
		//app.map.setCenter(app.currentLocation);
		app.map.panTo(app.currentLocation);
		//app.map.setZoom(13);

		glog.step("showCurrentLocation");
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
	startAnim : function(callback) {
		var aniC = $('#ani-c');
		var t1 = 447 * 480 / 960;
		var t2 = 422 * 480 / 960;
		$('#ani-c').transition({
			y : t1 + 'px'
		}, 800, 'ease').transition({
			y : t2 + 'px'
		}, 800, 'ease', callback);
	},
	initLayoutHomePage : function() {
		app.initHomeSwiper();
		$.mobile.changePage($("#home-page"), {
			transition : "fade"
		});
	},
	initLayoutAnimPage : function() {
		glog.step("initLayoutAnimPage");

		/* set #ani-page content size */
		$('#ani-page div[data-role="content"]').css({
			"height" : app.windowHeight + "px"
		});
		// 923x1391 c.png
		// 640x1136 iPhone5
		var cWidth = app.windowWidth;
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
		glog.step("initLayoutAnimPage");
	},
	initLayoutSizes : function() {
		glog.step("initLayoutSizes");
		var styles = [];
		styles.push("<style>");

		/* header height (size: 565x107) */
		app.headerHeight = app.windowWidth * 107 / 565;

		/* footer height (size: 600x80) */
		app.footerHeight = app.windowWidth * 80 / 600;

		/* content height */
		app.contentHeight = app.windowHeight - app.headerHeight - app.footerHeight;

		/* enlarge contents size */
		styles.push('.sized-content { height: ' + app.contentHeight + 'px; }\r');

		/* set size of headers */
		styles.push('div[data-role="header"] { height: ' + app.headerHeight + 'px; }\r');

		/* set #home-page menu size (size: 147x901) */
		var menuWidth = app.windowHeight * 147 / 901;
		var menuHeight = menuWidth * 106 / 147;
		styles.push('#left-menu { width: ' + menuWidth + 'px; }\r');
		styles.push('#left-menu a { height: ' + menuHeight + 'px; background-size: ' + menuWidth + 'px; }\r');
		styles.push('#left-menu a:active { background-position: 0px -' + menuHeight + 'px; }\r');

		/* set #home-page logo size (size: 457x108) (design width: 601px)*/
		var homeLogoWidth = app.windowWidth * 457 / 601;
		styles.push('#home-header-pic { width: ' + homeLogoWidth + 'px; }\r');

		/* set swiper container height and content height */
		styles.push('#swiper-home { height: ' + app.windowHeight + 'px; }\r');
		styles.push('#home-page div[data-role="content"] { height: ' + app.windowHeight + 'px; }\r');

		/* set swiper image size (size: 535x332)*/
		var carouselImageHeight = app.windowWidth * 332 / 535;
		//styles.push('.swiper-container { height: ' + swHeight + 'px; }\r');

		/* set carousel sizes */
		var paginationTopOffset = app.headerHeight + carouselImageHeight + 8;
		styles.push('#carousel1, #carousel2 { height: ' + (app.contentHeight - 8) + 'px; }\r');
		styles.push('.pagination.middle { top: ' + paginationTopOffset + 'px; }\r');
		styles.push('.swiper-slide .desc { height: ' + (app.contentHeight - carouselImageHeight - 10 - 8) + 'px; }\r');

		/* footer buttons (size: 150x80) */
		var buttonCount = 5;
		var footerBtnWidth = app.windowWidth / 4;
		var footerBtnHeight = (footerBtnWidth * 80 / 150).toFixed(0);
		styles.push('.ui-footer a { width: ' + footerBtnWidth + 'px; height: ' + footerBtnHeight + 'px; }\r');
		styles.push('.ui-footer a { background-size: ' + (footerBtnWidth * buttonCount) + 'px ' + footerBtnHeight * 2 + 'px; }\r');
		styles.push('.ui-footer a:hover, .ui-footer a:active { background-position-y: -' + footerBtnHeight + 'px; }\r');
		styles.push('.ui-footer a.fb-home { background-position-x: 0px; }\r');
		styles.push('.ui-footer a.fb-share { background-position-x: -' + footerBtnWidth + 'px; }\r');
		styles.push('.ui-footer a.fb-map { background-position-x: -' + footerBtnWidth * 2 + 'px; }\r');
		styles.push('.ui-footer a.fb-back { background-position-x: -' + footerBtnWidth * 3 + 'px; }\r');
		styles.push('.ui-footer a.fb-settings { background-position-x: -' + footerBtnWidth * 4 + 'px; }\r');

		/* map size (topButton size: 299x111) */
		var mapTopButtonHeight = app.windowWidth * 111 / (299 * 2);
		var mapHeight = app.contentHeight - mapTopButtonHeight;
		styles.push('#map, #shop-list { height: ' + mapHeight + 'px; }\r');

		styles.push("</style>");
		$("html > head").append(styles.join(""));

		glog.step("initLayoutSizes");
		return;

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
	},
	putSetting : function(key, value) {
		//console.log(key + " : " + value);
		window.localStorage.setItem(key, value);
	},
	getSetting : function(key, defaultValue) {
		var ret = window.localStorage.getItem(key);
		return (ret != null) ? ret : defaultValue;
	},
	bindPageShowEvents : function() {
		$("#ani-page").bind("pageshow", function(event) {
			try {
				//if (! typeof navigator === "undefined")
				navigator.splashscreen.hide();
			} catch(e) {
				//alert("hide error");
			}
			app.startAnim(app.initLayoutHomePage);
			//catalogue.load("#wrapper #scroller");
		});

		$("#home-page").bind("pageshow", function(event) {
			app.preloadImages.load();
			app.initHomeSwiper();
			//app.firstInitialize();
		});

		$("#page-yeniurun").bind("pageshow", function(event) {
			app.carousel1.load();
		});

		$("#page-firsat").bind("pageshow", function(event) {
			app.carousel2.load();
		});

		$("#page-guzellik").bind("pageshow", function(event) {
			//startGuzellikSirriAnimation();
		});

		$("#page-harita").bind("pageshow", function(event) {
			if (app.mapApiReady) {
				google.maps.event.trigger(app.map, 'resize');
				
				if (app.showCurrentLocationFirstTime) {
					app.showCurrentLocation();
				}
			}

			/*
			if (app.currentLocation == null) {
			if (app.mapApiReady) {
			detectCurrentLocation(true);
			} else {
			alert("Map API is not loaded!..");
			}
			}
			*/

			/*
			if (app.updateCurrentMap) {
			showCurrentLocation();
			}*/
			//getShopList();
		});

	},
	bindHomeMenuTapEvents : function() {
		$("#m1").bind('tap', function(event, ui) {
			$.mobile.changePage($("#page-yeniurun"));
		});

		$("#m2").bind('tap', function(event, ui) {
			$.mobile.changePage($("#page-firsat"));
		});

		$("#m3").bind('tap', function(event, ui) {
			$.mobile.changePage($("#page-guzellik"));
		});

		$("#m4").bind('tap', function(event, ui) {
			$.mobile.changePage($("#page-katalog"));
		});

		$("#m5").bind('tap', function(event, ui) {
			$.mobile.changePage($("#page-sosyal"));
		});

		$("#m6").bind('tap', function(event, ui) {
			$.mobile.changePage($("#page-uygulama"));
		});

		$("#m7").bind('tap', function(event, ui) {
			$.mobile.changePage($("#page-form"));
		});

		$("#m8").bind('tap', function(event, ui) {
			$.mobile.changePage($("#page-harita"));
		});
		$("#m9").bind('tap', function(event, ui) {
			$.mobile.changePage($("#page-ayarlar"));
		});
	},

	bindSubPagesTapEvents : function() {
		/* Sosyal medya */
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

		/* Harita */
		$('#page-harita div[data-role="content"] .b1').bind('tap', function() {
			if ($('#shop-list').is(":visible")) {
				$('#shop-list').fadeOut(200);
			} else {
				$('#shop-list').fadeIn(200);
			}
		});

	},

	bindFooterMenuTapEvents : function() {
		$('.fb-home').each(function() {
			$(this).bind('tap', function() {
				$.mobile.changePage($("#home-page"));
			});
		});

		$('.fb-share').each(function() {
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

		$('.fb-map').each(function() {
			$(this).bind('tap', function() {
				app.updateCurrentMap = true;
				$.mobile.changePage($("#page-harita"));
			});
		});

		$('.fb-back').each(function() {
			$(this).bind('tap', function() {
				try {
					navigator.app.backHistory();
				} catch(e) {
					window.history.back();
				}
			});
		});

		$('.fb-settings').each(function() {
			$(this).bind('tap', function() {
				$.mobile.changePage($("#page-ayarlar"));
			});
		});
	},
	applyDoubleTapBugFixOnPageChange : function() {
		var eventTracker = function(e, data) {
			switch (e.type) {
				case "pagebeforeshow":
					//console.log('pageEvent: ' + e.type + ', prevPage: ' + data.prevPage[0].id + ', app.pageTransitionBusy:' + app.pageTransitionBusy + ', ' + glog.fmtNow());
					app.pageTransitionBusy = true;
					break;
				case "pageshow":
					//console.log('pageEvent: ' + e.type + ', prevPage: ' + data.prevPage[0].id + ', app.pageTransitionBusy:' + app.pageTransitionBusy + ', ' + glog.fmtNow());
					app.pageTransitionBusy = false;
					break;
				case "pagebeforechange":
					//console.log('pageEvent: ' + e.type + ', toPage: ' + data.toPage[0].id + ', app.pageTransitionBusy:' + app.pageTransitionBusy + ', ' + glog.fmtNow());
					if (app.pageTransitionBusy) {
						e.preventDefault();
						//console.warn('pagechange canceled');
					}
					break;
			}
		};

		$(document).bind('pagebeforeshow', eventTracker);
		$(document).bind('pageshow', eventTracker);
		$(document).bind('pagebeforechange', eventTracker);
	},

	// Update DOM on a Received Event
	receivedEvent : function(id) {
		// receivedEvent ------------------------------------------------------------------------------
		glog.step('receivedEvent :' + id);

		$.support.cors = true;
		// Setting #container div as a jqm pageContainer
		$.mobile.pageContainer = $('#container');

		$.mobile.autoInitializePage = false;
		$.mobile.allowCrossDomainPages = true;
		$.mobile.pushStateEnabled = false;
		$.mobile.touchOverflowEnabled = false;
		$.mobile.defaultPageTransition = 'flip';
		$.mobile.defaultDialogTransition = 'none';
		$.mobile.transitionFallbacks.slide = 'none';
		$.mobile.transitionFallbacks.pop = 'none';
		$.mobile.buttonMarkup.hoverDelay = 0;
		$.mobile.phonegapNavigationEnabled = true;
		$.mobile.loadingMessage = 'Yükleniyor...';

		$.mobile.loader.prototype.options.text = "Yükleniyor";
		$.mobile.loader.prototype.options.textVisible = false;
		$.mobile.loader.prototype.options.theme = "a";
		$.mobile.loader.prototype.options.html = "";

		app.applyDoubleTapBugFixOnPageChange();

		loadMapScript('app.onMapApiLoad');

		app.windowHeight = $(window).height();
		app.windowWidth = $(window).width();

		app.initLayoutAnimPage();

		setTimeout(function() {
			/* close splashScreen and start animation */
			$.mobile.changePage($("#ani-page"), {
				transition : "none"
			});
		}, 500);

		app.initLayoutSizes();
		app.bindPageShowEvents();
		app.bindHomeMenuTapEvents();
		app.bindFooterMenuTapEvents();
		app.bindSubPagesTapEvents();

		return;

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

		//$('#home-page div[data-role="header"] img').bind('tap', app.localNotificationTrigger);
		//$('#page-ayarlar div[data-role="header"] img').bind('tap', app.localNotificationTrigger);

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
		if (app.swHome == null) {
			app.swHome = $('#swiper-home').swiper({
				pagination : '#pagination-home',
				paginationClickable : true,
				loop : true,
				/*initialSlide : 0,*/
				onSlideClick : function(control) {
					//goPage(control.clickedSlide.getAttribute('page-id'));
				}
			});
		} else {
			$('#swiper-home').css({
				"width" : app.windowWidth + "px",
				"height" : app.windowHeight + "px"
			});
			app.swHome.resizeFix();
			//app.swHome.reInit();
		}
	}
};
