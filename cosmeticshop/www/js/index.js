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

		initMenu('#left-menu img');
		initMenu('.fm');

		$('.f1').each(function() {
			$(this).bind('tap', function() {
				$.mobile.changePage($("#home_page"), {
					transition : ""
				});
			});
		});

		if (!isPhoneGap()) {
			navigator.splashscreen.hide();
		};

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

		$('#btnTest').click(function() {
			$('#btnTest').css({
				"display" : "none"
			});
			app.startAnim();
		});

	}
};
