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

	/*
	 * size properties
	 */
	contentHeight : 0,
	footerHeight : 0,
	headerHeight : 0,
	windowHeight : 0,
	windowWidth : 0,

	/*
	 * other properties
	 */
	mapApiReady : false,
	mapInitialized : false,
	pageTransitionBusy : false,
	shopMarkersAdded : false,
	showCurrentLocationFirstTime : false,
	watch_id : null,

	/*
	 * objects
	 */
	carousel1 : new carouselObject("#carousel1", 1, "m1"),
	carousel2 : new carouselObject("#carousel2", 2, "m2"),
	currentLocation : null,
	currentLocationMarker : null,
	infoWindow : null,
	gsGoz : new guzellikSirlari(31),
	gsYuz : new guzellikSirlari(32),
	gsDudak : new guzellikSirlari(33),
	gsTirnak : new guzellikSirlari(34),
	map : null,
	nearestShop : null,
	preloadImages : new preloadObject("/Preload.ashx"),
	catalogue : new catalogueObject("/Catalogue.ashx"),
	shopList : new shopListObject(),
	swHome : null,

	currentPageId : function() {
		return $.mobile.activePage.attr('id');
	},

	/*
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
	*/

	//mapApiKey : 'e888e31cc2b64f3f9af01474eb553c39',

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

			google.maps.event.addListener(app.map, 'click', function(e) {
				google.maps.event.trigger(app.map, 'tapped', {
					latLng : e.latLng
				});
				console.log(e.latLng);
			});

			google.maps.event.clearInstanceListeners(app.map);

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

			if (app.currentLocationMarker != null) {
				app.currentLocationMarker.setMap(null);
			}

			var image = {
				//url : serviceHost + '/files/bluedot.gif',
				//url : serviceHost + '/files/bluedot2.png',
				//url : serviceHost + '/files/bluedot10px.png',
				url : serviceHost + '/files/aaa.gif',
				//url : 'http://gwtportlets.googlecode.com/svn-history/r46/trunk/src/org/gwtportlets/portlet/public/img/portlet-loading-32x32.gif',
				size : new google.maps.Size(38, 38),
				//size : new google.maps.Size(10, 10),
				origin : new google.maps.Point(0, 0),
				// The anchor for this image is the base of the flagpole at 0,32.
				anchor : new google.maps.Point(19, 19)
				//anchor : new google.maps.Point(5, 5)
			};
			/*
			 *  Shapes define the clickable region of the icon.
			 *  The type defines an HTML &lt;area&gt; element 'poly' which
			 *  traces out a polygon as a series of X,Y points. The final
			 *  coordinate closes the poly by connecting to the first
			 *  coordinate.
			 */
			/*
			 var shape = {
			 coord : [1, 1, 1, 20, 18, 20, 18, 1],
			 type : 'poly'
			 };
			 */
			app.currentLocationMarker = new google.maps.Marker({
				position : app.currentLocation,
				map : map,
				bounds : false,
				title : 'Buradasınız',
				icon : image,
				//shape : shape,
				optimized : false
				//animation : google.maps.Animation.BOUNCE
			});
			var marker = app.currentLocationMarker;

			// Add circle overlay and bind to marker
			var circle = new google.maps.Circle({
				strokeColor : "#006DFC",
				strokeOpacity : 0.4,
				strokeWeight : 1,
				fillColor : "#006DFC",
				fillOpacity : 0.15,
				map : app.map,
				radius : 600, // 1 miles in metres
			});
			circle.bindTo('center', marker, 'position');

			google.maps.event.addListener(marker, 'click', function() {
				map.setZoom(14);
				map.panTo(marker.getPosition());
			});

			// Start tracking the User
			app.watch_id = navigator.geolocation.watchPosition(function(position) {
				// Success
				//console.log(position);
				app.currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				app.currentLocationMarker.setPosition(app.currentLocation);
				//element.innerHTML = 'Latitude: ' + position.coords.latitude + '<br />' + 'Longitude: ' + position.coords.longitude + '<br />' + '<hr />' + element.innerHTML;
			}, function(error) {
				// Error
				console.log(error);
			}, {
				// Settings
				frequency : 3000,
				enableHighAccuracy : true
			});

			// Tidy up the UI
			track_id = $("#track_id").val();
			$("#track_id").hide();
			$("#startTracking_status").html("Tracking workout: <strong>" + track_id + "</strong>");

			app.showCurrentLocationFirstTime = true;

			glog.step("onGeoSuccess");
			app.recalculateDistances();
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
		app.showCurrentLocationFirstTime = false;

		/* setCenter: non-animated map */
		//app.map.setCenter(app.currentLocation);

		/* panTo: animated map */
		app.map.panTo(app.currentLocation);
	},

	addMarkers : function() {

		function openInfoWindow(marker, shop) {
			console.warn("openInfoWindow");
			var funcStr = String.format("shopInfoPage('{0}', '{1}', '{2}', '{3}');", shop.caption, shop.address, shop.phone, shop.distance);
			var contentString = '<div onclick="' + funcStr + '" class="info-window"><h4>' + shop.caption + '</h4><div class="address">' + shop.address + '</div><div class="phone">' + shop.phone + '</div></div>';
			//var contentString = '<div class="info-window"><h4>' + shop.caption + '</h4><div class="address">' + shop.address + '</div><div class="phone">' + shop.phone + '</div></div>';

			if (app.infoWindow != null) {
				app.infoWindow.close();
				app.infoWindow = null;
			}
			app.infoWindow = new google.maps.InfoWindow({
				content : contentString,
				maxWidth : (app.windowWidth / 2)
			});

			app.infoWindow.open(app.map, marker);
		}

		if (app.shopMarkersAdded) {
			return;
		}
		glog.step("addMarkers");

		$.each(app.shopList.shops, function(i, shop) {

			var pos = new google.maps.LatLng(shop.latitude, shop.longitude);

			var image = {
				url : serviceHost + '/files/cosmetica_marker.png',
				//url : 'http://gwtportlets.googlecode.com/svn-history/r46/trunk/src/org/gwtportlets/portlet/public/img/portlet-loading-32x32.gif',
				size : new google.maps.Size(32, 37),
				origin : new google.maps.Point(0, 0),
				anchor : new google.maps.Point(16, 19)
			};

			var marker = new google.maps.Marker({
				position : pos,
				map : app.map,
				//bounds : true,
				clickable : true,
				title : shop.caption,
				icon : image, //serviceHost + '/files/cosmetica_marker.png',
				optimized : false,
				animation : google.maps.Animation.DROP
			});

			google.maps.event.addListener(marker, 'mousedown', function() {
				openInfoWindow(marker, shop);
			});
			google.maps.event.addListener(marker, 'click', function() {
				openInfoWindow(marker, shop);
			});

			shop.marker = marker;
		});
		app.shopMarkersAdded = true;
		glog.step("addMarkers");
	},

	calculatedShopDistances : 0,

	recalculateDistances : function() {
		if (app.mapApiReady && (app.shopList.shops.length > 0) && (app.currentLocation != null)) {
			glog.step("recalculateDistances");

			app.nearestShop = null;
			calculatedShopDistances = 0;
			//var directionsDisplay = new google.maps.DirectionsRenderer();
			var directionsService = new google.maps.DirectionsService();

			//directionsDisplay.setMap(app.map);

			$.each(app.shopList.shops, function(i, shop) {

				var shopPosition = new google.maps.LatLng(shop.latitude, shop.longitude);

				// Flying distance
				//shop.flyingDistance = google.maps.geometry.spherical.computeDistanceBetween(app.currentLocation, shopPosition);

				// Driving distance
				var request = {
					origin : app.currentLocation,
					destination : shopPosition,
					travelMode : google.maps.DirectionsTravelMode["DRIVING"]
				};

				directionsService.route(request, function(response, status) {
					//console.warn(response);
					calculatedShopDistances++;

					if (status == google.maps.DirectionsStatus.OK) {
						shop.distance = response.routes[0].legs[0].distance.value;

						//console.log(calculatedShopDistances + ' of ' + app.shopList.shops.length + ' - ' + shop.caption + ' : ' + shop.distance + ' (' + formatDistance(shop.drivingDistance) + ')');

						if (app.nearestShop == null || app.nearestShop.distance > shop.distance) {
							app.nearestShop = shop;
						}

						if (calculatedShopDistances == app.shopList.shops.length) {
							app.shopList.render();
						}

						/*
						 var myRoute = response.routes[0].legs[0];
						 for (var i = 0; i < myRoute.steps.length; i++) {
						 console.log(myRoute.steps[i].instructions);
						 }
						 */
					}
				});
			});
			glog.step("recalculateDistances");
		}
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
		styles.push('.ui-footer a.fb-back-gs { background-position-x: -' + footerBtnWidth * 3 + 'px; }\r');
		styles.push('.ui-footer a.fb-back-gs-b { background-position-x: -' + footerBtnWidth * 3 + 'px; }\r');
		styles.push('.ui-footer a.fb-back-map { background-position-x: -' + footerBtnWidth * 3 + 'px; }\r');
		styles.push('.ui-footer a.fb-settings { background-position-x: -' + footerBtnWidth * 4 + 'px; }\r');

		/* catalogue wrapper size */
		styles.push('#wrapper-katalog { top: ' + (app.headerHeight + 8) + 'px; height: ' + (app.contentHeight - 8) + 'px; }\r');

		/* map size (topButton size: 299x111) */
		var mapTopButtonHeight = app.windowWidth * 111 / (299 * 2);
		var mapHeight = app.contentHeight - mapTopButtonHeight;
		styles.push('#map, #shop-list { height: ' + mapHeight + 'px; }\r');

		styles.push("</style>");
		$("html > head").append(styles.join(""));

		glog.step("initLayoutSizes");

		/*
		 *
		 *
		 * gs = "güzellik sırları"
		 *
		 * */
		w = app.windowWidth;
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

		//var gsbConPad = 16;
		//var gsbImgH = (app.contentHeight - (gsbConPad*2))/ 3;
		var gsbImgH = 200 * w / 565;
		$("#page-guzellik-b .ui-grid-a img").css({
			"height" : gsbImgH + "px",
			"width" : "auto"
		});

		//app.bricks[".b1-1"]=$(".b1-1").css

		//app.sx = app.headerHeight + gsPadding + (gsBrickSize * 3) + (gsSpacing * 3) + gsBrickSize;
		//console.log("sx:" + app.sx);
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

	getBadgesCount : function() {
		var successFunc = function(obj, result) {
			app.badgeYeniUrun = result.YeniUrun;
			app.badgeFirsat = result.Firsat;
			app.badgeGuzellikSirlari = result.GuzellikSirlari;

			app.setbadge("m1", app.badgeYeniUrun);
			app.setbadge("m2", app.badgeFirsat);
			app.setbadge("m3", app.badgeGuzellikSirlari);
		};
		var errorFunc = function(obj, request, error) {
			console.warn(error);
			// no action
		};
		var svcurl = serviceHost + "/GetBadges.ashx?uuid=" + device.uuid;
		var jl = new jsonLoader(svcurl, successFunc, errorFunc);
		jl.load();
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
		});

		$("#home-page").bind("pageshow", function(event) {
			app.initHomeSwiper();
			//app.preloadImages.load();
			app.getBadgesCount();
			app.shopList.load(app.addMarkers);
		});

		$("#page-yeniurun").bind("pageshow", function(event) {
			app.carousel1.load();
		});

		$("#page-firsat").bind("pageshow", function(event) {
			app.carousel2.load();
		});

		$("#page-guzellik").bind("pageshow", function(event) {

		});

		$("#page-harita").bind("pageshow", function(event) {
			if (app.mapApiReady) {
				google.maps.event.trigger(app.map, 'resize');

				if (app.showCurrentLocationFirstTime) {
					app.showCurrentLocation();
				}
			}
			if (app.currentLocation == null) {
				if (app.mapApiReady) {
					app.detectCurrentLocation(true);
				} else {
					alert("Map API is not loaded!..");
				}
			}

			/*
			if (app.updateCurrentMap) {
			showCurrentLocation();
			}*/
			//getShopList();
		});

		$("#page-katalog").bind("pageshow", function(event) {
			app.catalogue.load();
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

		/* Güzellik Sırları B */
		$('.b1-1').bind("click", function() {
			app.gsGoz.load();
			$.mobile.changePage($('#page-guzellik-b'), {
				transition : "slide"
			});
		});

		$('.b2-1').bind("click", function() {
			app.gsYuz.load();
			$.mobile.changePage($('#page-guzellik-b'), {
				transition : "slide"
			});
		});
		$('.b3-1').bind("click", function() {
			app.gsDudak.load();
			$.mobile.changePage($('#page-guzellik-b'), {
				transition : "slide"
			});
		});
		$('.b4-1').bind("click", function() {
			app.gsTirnak.load();
			$.mobile.changePage($('#page-guzellik-b'), {
				transition : "slide"
			});
		});

		/* Güzellik Sırları C */
		$("#page-guzellik-b .ui-grid-a").each(function() {
			$(this).bind("click", function() {
				$.mobile.changePage($('#page-guzellik-c'), {
					transition : "slide"
				});
			});
		});

		/* Map -> listShops */
		$('#page-harita div[data-role="content"] .b1').bind('tap', function() {
			if ($('#shop-list').is(":visible")) {
				$('#shop-list').fadeOut(200);
			} else {
				$('#shop-list').fadeIn(200);
			}
		});

		/* Map -> nearestShop */
		$('#page-harita div[data-role="content"] .b2').bind('tap', function() {
			var displayError = true;
			if (app.currentLocation != null) {
				if (app.nearestShop == null)
					app.recalculateDistances();

				if (app.nearestShop != null) {
					displayError = false;
					goMap(app.nearestShop);
				}
			}

			if (displayError)
				alert("Konum bilginiz saptanamadı.");
		});

		/* Uygulamalar */
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

		$('.fb-back-gs').bind('tap', function() {
			$.mobile.changePage($("#page-guzellik"));
		});
		$('.fb-back-gs-b').bind('tap', function() {
			$.mobile.changePage($("#page-guzellik-b"));
		});
		$('.fb-back-map').bind('tap', function() {
			$.mobile.changePage($("#page-harita"));
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
	// for iOS
	pushTokenHandler : function(result) {
		console.log("Token Handler " + result);
		//alert("Token Handler : " + result);

		try {
			//result = regId
			app.registerPushWooshService(result);
		} catch(e) {
			alert("token catch : " + e.toString());
			alert(PushWoosh);
		}
	},

	// for both
	pushErrorHandler : function(error) {
		console.log("Error Handler : " + error);
		alert("Error Handler : " + error);
	},

	// result contains any message sent from the plugin call
	pushSuccessHandler : function(result) {
		alert('Success Handler : ' + result);
	},

	setPushNotifications : function() {
		try {
			var pushNotification = window.plugins.pushNotification;

			// TODO: Enter your own GCM Sender ID in the register call for Android
			if (device.platform == 'android' || device.platform == 'Android') {
				pushNotification.register(this.pushSuccessHandler, this.pushErrorHandler, {
					"senderID" : "268470725852",
					"ecb" : "app.onNotificationGCM"
				});
			} else {
				pushNotification.register(this.pushTokenHandler, this.pushErrorHandler, {
					"badge" : "true",
					"sound" : "true",
					"alert" : "true",
					"ecb" : "app.onNotificationAPN"
				});
			}
		} catch(e) {
			// probably running on browser
		}
	},

	// for both
	registerPushWooshService : function(regId) {
		PushWoosh.appCode = "83E51-9B80D";
		PushWoosh.register(regId, function(data) {
			//alert("PushWoosh register success: " + JSON.stringify(data));
		}, function(errorRegistration) {
			alert("Bildirim servislerine kayıt olunamadı.");
		});
	},
	// iOS
	onNotificationAPN : function(event) {
		var pushNotification = window.plugins.pushNotification;
		console.log("Received a notification! " + event.alert);
		console.log("event sound " + event.sound);
		console.log("event badge " + event.badge);
		console.log("event " + event);
		if (event.alert) {
			navigator.notification.alert(event.alert);
		}
		if (event.badge) {
			console.log("Set badge on  " + pushNotification);
			pushNotification.setApplicationIconBadgeNumber(this.successHandler, event.badge);
		}
		if (event.sound) {
			var snd = new Media(event.sound);
			snd.play();
		}
	},
	// Android
	onNotificationGCM : function(e) {
		switch( e.event ) {
			case 'registered':
				if (e.regid.length > 0) {
					// Your GCM push server needs to know the regID before it can push to this device
					// here is where you might want to send it the regID for later use.
					//alert('registration id = ' + e.regid);
					app.registerPushWooshService(e.regid);
				}
				break;

			case 'message':
				// this is the actual push notification. its format depends on the data model
				// of the intermediary push server which must also be reflected in GCMIntentService.java
				alert(e.message);
				break;

			case 'error':
				alert('GCM error = ' + e.msg);
				break;

			default:
				alert('An unknown GCM event has occurred');
				break;
		}
	},

	badgeYeniUrun : 9,
	badgeFirsat : 10,
	badgeGuzellikSirlari : 0,

	setbadge : function(menuId, value) {
		var el = $('#left-menu a#' + menuId + ' span');
		if (value > 0) {
			el.show();
		} else {
			el.hide();
		}
		el.text(value);
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

		// why: http://jquerymobile.com/demos/1.2.0/docs/pages/phonegap.html
		$.mobile.pushStateEnabled = true;

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

	alert("applyDoubleTapBugFixOnPageChange");
	navigator.notification.alert("applyDoubleTapBugFixOnPageChange", null, 'info', 'Done');
		app.applyDoubleTapBugFixOnPageChange();

	alert("loadMapScript");
		loadMapScript('app.onMapApiLoad');

		app.windowHeight = $(window).height();
		app.windowWidth = $(window).width();

	alert("setPushNotifications");
		this.setPushNotifications();
	alert("initLayoutAnimPage");
		app.initLayoutAnimPage();

	alert("close splashScreen and start animation");
		setTimeout(function() {
			/* close splashScreen and start animation */
			$.mobile.changePage($("#ani-page"), {
				transition : "none"
			});
		}, 500);

	alert("initLayoutSizes");
		app.initLayoutSizes();
	alert("bindPageShowEvents");
		app.bindPageShowEvents();
	alert("bindHomeMenuTapEvents");
		app.bindHomeMenuTapEvents();
	alert("bindFooterMenuTapEvents");
		app.bindFooterMenuTapEvents();
	alert("bindSubPagesTapEvents");
		app.bindSubPagesTapEvents();
	alert("preloadImages");
		app.preloadImages.load();
	alert("2");

		/*
		var orientationChange = function(e) {
		var orientation = "portrait";
		if (window.orientation == -90 || window.orientation == 90)
		orientation = "landscape";
		navigator.notification.alert(orientation);
		console.dir(window.orientation);
		console.dir(e);
		};
		window.addEventListener("orientationchange", orientationChange, true);
		*/

		//$('#home-header-pic').bind('tap', function() {
		/*
		app.setbadge('m1', app.im1++)
		app.setbadge('m2', app.im2--)
		app.setbadge('m3', app.im3++)
		/*
		var deviceID = device.uuid;
		// alert dialog dismissed
		var alertDismissed = function() {
		// do something
		};
		// Show a custom alertDismissed
		navigator.notification.vibrate();
		navigator.notification.alert(deviceID, alertDismissed, 'Device ID', 'Done');
		*/
		/*
		//ms
		var transitionSpeed = 160;
		var easing = "snap";
		var effects = [];
		effects[0] = {
		opacity : 0
		};
		effects[1] = {
		opacity : 1
		};
		/*
		effects[0] = {opacity:0};
		effects[1] = {opacity:1};

		effects[0] = { rotateY: '180deg',opacity:0};
		effects[1] = { rotateY: '0deg',opacity:1};

		effects[0] = { scale:0};
		effects[1] = { scale:1};

		effects[0] = { rotate:'+=20deg',x:window.innerWidth};
		effects[1] = { rotate:'0deg',x:0};
		*/
		/*
		$('#home-page').transition(effects[0], transitionSpeed, easing, function() {
		$('#page-harita-detail').css({
		'display' : 'inline'
		}).transition(effects[1], transitionSpeed, easing);
		});
		*/
		//});

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
			/*
			 $("#owl-example").owlCarousel({
			 //navigation : true, // Show next and prev buttons
			 slideSpeed : 300,
			 paginationSpeed : 400,
			 singleItem : true
			 });

			 app.swHome = $("#owl-example").data('owlCarousel');
			 */
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
