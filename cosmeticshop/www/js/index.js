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

	headerHeight : 0,
	footerHeight : 0,
	contentHeight : 0,

	shopList : [],
	shopListTemplate : "",
	shopListSelector : "#shop-list .liste",
	nearestShop : null,
	currentLocation : null,
	currentLocationMap : null,
	updateCurrentMap : true,
	backPageId : "",
	currentPageId : function() {
		return $.mobile.activePage.attr('id');
	},

	swHome : null,

	renderShopList : function() {
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
		}
	},

	recalculateDistances : function() {
		if ((app.shopList.length > 0) && (app.currentLocation != null)) {
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
	},

	startAnim : function() {
		var debugFunc = function() {
			var c = $('#ani-page div[data-role="content"]');
			var s = '[h:' + c.height() + ' , w:' + c.width() + '] [sh:' + $(window).height() + ' , sw:' + $(window).width() + ']';
			alert(s);
		};

		var contentHeight = getRealContentHeight();

		$('#ani-logo').fadeTo(1000, 1, function() {
			//debugFunc();
			setTimeout(function() {
				$.mobile.changePage($("#home_page"), {
					transition : "fade"
				});
			}, 600);
		});

		/* starting animation */
		$('#ani-c').transition({
			y : contentHeight / 2 + 'px'
		}, 800, 'ease').transition({
			y : (contentHeight / 2) - (contentHeight / 15) + 'px'
		}, 600, 'ease');

		/* end of animation */

		/* show home page *
		 setTimeout(function() {
		 //enlargeContent("home_page");
		 $.mobile.changePage($("#home_page"), {
		 transition : "fade"
		 });
		 }, 3000);
		 */

	},

	putSetting : function(key, value) {
		console.log(key + " : " + value);
		window.localStorage.setItem(key, value);
	},

	getSetting : function(key, defaultValue) {
		var ret = window.localStorage.getItem(key);
		return (ret != null) ? ret : defaultValue;
	},

	// Update DOM on a Received Event
	receivedEvent : function(id) {
		var initMenu = function(menuSelector) {
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
		};

		$.support.cors = true;
		$.mobile.allowCrossDomainPages = true;
		$.mobile.pushStateEnabled = false;
		$.mobile.touchOverflowEnabled = false;
		$.mobile.defaultPageTransition = 'flip';
		$.mobile.defaultDialogTransition = 'none';
		$.mobile.transitionFallbacks.slide = 'none';
		$.mobile.transitionFallbacks.pop = 'none';
		$.mobile.buttonMarkup.hoverDelay = 0;
		$.mobile.phonegapNavigationEnabled = false;

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

		/* set position of header's image *
		 $('div[data-role="header"] img').each(function() {
		 $(this).css({
		 "width" : $(window).width + "px"
		 });
		 });
		 */

		/* set #ani-page content size */
		$('#ani-page div[data-role="content"]').css({
			"height" : $(window).height() + "px"
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

		/* set swiper container height */
		$("#swiper-home").css({
			//"top" : "-" + homeLogoHeight + "px",
			"height" : $(window).height() + "px"
		});

		initMenu('#left-menu img');
		initMenu('.fm');
		initMenu('.sm');

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
						//window.plugins.socialsharing.share('My text with a link: http://' + serviceHost);
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
				//$('#map-canvas').html('');
				if (app.backPageId == "page-harita") {
					app.updateCurrentMap = false;
				}
				var pageId = (app.backPageId != "") ? app.backPageId : "home_page";
				app.backPageId = "";
				$.mobile.changePage($("#" + pageId));
			});
		});

		$('.f4').each(function() {
			$(this).bind('tap', function() {
				app.backPageId = app.currentPageId();
				$.mobile.changePage($("#page-ayarlar"));
			});
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

		startupSteps();

		$('#cbxSetting1').attr('checked', app.getSetting('set1', 'true') == 'true');
		$('#cbxSetting2').attr('checked', app.getSetting('set2', 'true') == 'true');
		$('#cbxSetting3').attr('checked', app.getSetting('set3', 'true') == 'true');

		if (! typeof navigator === "undefined")
			navigator.splashscreen.hide();

		//$('#home_page div[data-role="header"] img').bind('tap', app.localNotificationTrigger);
		$('#page-ayarlar div[data-role="header"] img').bind('tap', app.localNotificationTrigger);

		app.startAnim();
		//detectCurrentLocation(true);
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
				initialSlide : 0,
			});
			$('#swiper-home').css({
				"display" : "none",
				"visibility" : "visible"
			});
			$('#swiper-home').fadeTo(500, 1);
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
	}
};
