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

	shopList : [],
	shopListTemplate : "",
	nearestShop : null,
	currentLocation : null,
	currentLocationMap : null,

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
		}
	},
	renderShopList : function(selector) {
		var formatDistance = function(value) {
			//if ( typeof value === undefined) {
			if (value == null) {
				return "---";
			} else {
				return (value < 1000.0) ? value.toFixed(0) + " m" : (value > 1000000) ? ">1000 km" : (value / 1000).toFixed(0) + " km";
			}
		};
		$(selector).html();
		if (app.shopList.length > 0) {
			var tmp = '';
			$.each(app.shopList, function() {
				tmp = tmp + String.format(app.shopListTemplate, this.caption, this.address, formatDistance(this.distance), this.latitude, this.longitude);
				$(selector).html(tmp);
			});
		}
	},
	startAnim : function() {
		var contentHeight = getRealContentHeight();

		/* starting animation */
		$('#ani-c').transition({
			y : contentHeight / 2 + 'px'
		}, 1000, 'ease').transition({
			y : (contentHeight / 2) - (contentHeight / 15) + 'px'
		}, 1000, 'ease');

		$('#ani-logo').fadeIn(2000);
		/* end of animation */

		/* show home page */
		setTimeout(function() {
			enlargeContent("home_page");
			$.mobile.changePage($("#home_page"), {
				transition : "fade"
			});
		}, 3000);

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
		$.mobile.defaultPageTransition = 'none';
		$.mobile.defaultDialogTransition = 'none';
		$.mobile.transitionFallbacks.slide = 'none';
		$.mobile.transitionFallbacks.pop = 'none';
		$.mobile.buttonMarkup.hoverDelay = 0;
		$.mobile.phonegapNavigationEnabled = true;

		/* enlarge content size*/
		resizeMyContent();

		/* set home page menu size */
		var contentHeight = getRealContentHeight();
		var menuWidth = (contentHeight * 106 / 900) * 147 / 106;
		$("#left-menu").css({
			"width" : menuWidth + "px"
		});

		/* set home page logo size */
		var homeLogoWidth = $(window).width() * 457 / 601;
		$("#hp-header img").css({
			"width" : homeLogoWidth + "px"
		});

		/* set big picture container height */
		var homeLogoHeight = homeLogoWidth * 108 / 457;
		var pictureContainerHeight = contentHeight - homeLogoHeight;

		$("#hp-pic").css({
			"height" : pictureContainerHeight + "px",
			"top" : homeLogoHeight + "px"
		});

		$("#swiper4").css({
			"height" : pictureContainerHeight + "px",
			"top" : homeLogoHeight + "px"
		});

		initMenu('#left-menu img');
		initMenu('.fm');
		initMenu('.sm');

		$('.f1').each(function() {
			$(this).bind('tap', function() {
				$.mobile.changePage($("#home_page"), {
					transition : ""
				});
			});
		});

		$('.f5').each(function() {
			$(this).bind('tap', function() {
				$('#map-canvas').html('');
				$.mobile.changePage($("#page-harita"), {
					transition : ""
				});
			});
		});

		//if (!isPhoneGap()) navigator.splashscreen.hide();

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
	}
};
