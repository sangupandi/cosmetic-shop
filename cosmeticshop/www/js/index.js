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

	startAnim : function() {
		/* starting animation */
		$('#ani-c').transition({
			y : '250px'
		}, 1000, 'ease').transition({
			y : '230px'
		}, 1000, 'ease');

		$('#ani-logo').fadeIn(800);
		/* end of animation */

		/* show home page with fadein effect */
		setTimeout(function() {
			$('#ani-page').fadeOut(500);
			$('#home_page').fadeIn(500);
			/*
			 $.mobile.changePage($("#home_page"), {
			 transition : "fade"
			 });
			 */
		}, 3000);
	},

	// Update DOM on a Received Event
	receivedEvent : function(id) {
		//navigator.splashscreen.hide();

		var initMenu = function(menuId) {
			$(menuId).bind('vmousedown', function(event, ui) {
				//alert("binding");
				var src = $(menuId + " img").attr("src");
				var src2 = $(menuId + " img").attr("src2");
				$(menuId + " img").attr("src", src2);
				$(menuId + " img").attr("src2", src);
			});
		};

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

		initMenu("#m4");

		console.log("h : " + $('#m1 img').attr("height"));
		console.log("w : " + $('#m1 img').attr("width"));


		if (!isPhoneGap()) {
			navigator.splashscreen.hide();
		};
		this.startAnim();
	}
};
