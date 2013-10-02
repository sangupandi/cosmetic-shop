var myApp = {
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
		myApp.receivedEvent('deviceready');
	},
	// Update DOM on a Received Event
	receivedEvent : function(id) {
		console.log("anim deviceready");
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

		try {
			navigator.splashscreen.hide();
		} catch(e) {
		}

		var cHeight = $(window).height();
		/* set #ani-page content size */
		$('#ani-page div[data-role="content"]').css({
			"height" : cHeight + "px"
		});

		$('#ani-c').css({
			"height" : cHeight + "px",
			"top" : "-" + cHeight + "px"
		});

		$('#ani-logo').css({
			"top" : (cHeight / 2) + "px"
		});

		myApp.startAnim();
	},

	startAnim : function() {
		var contentHeight = $(window).height();
		/* starting animation */
		$('#ani-c').transition({
			y : contentHeight / 2 + 'px'
		}, 800, 'ease').transition({
			y : (contentHeight / 2) - (contentHeight / 15) + 'px'
		}, 600, 'ease');
		/* end of animation */
		$('#ani-logo').fadeTo(1000, 1, function() {
			setTimeout(function() {
				window.location.href = "content.html";
				//$.mobile.changePage("content.html", {				transition : "fade"				});
				
			}, 1000);
		});
	}
};
