var startApp = function() {
	alert('started');
	/*
	var el = document.getElementById("deviceready");
	el.innerHTML = "device is ready";
	   
	$("#hlPage1").click(function(){ window.location = "page1.html"; });
	*/
};

var mySwiper = null;

function initSwiper(){
    mySwiper = new Swiper('.swiper-container',{
        pagination: '.pagination',
        paginationClickable: true,
        loop: true,
        onSlideChangeEnd : function() {
            $("#swipe_content").html(mySwiper.activeLoopIndex);
        }
    });
}

function initSwiperData(){
	if (mySwiper == null) {

	    var svcurl = "http://feeds.delicious.com/v2/json/popular?callback=hello";      
	    //var svcurl = "http://127.0.0.1:8020/cosmeticshop/www/svc1.json";      
	    $.ajax({url: svcurl,
	        dataType: "jsonp",
	        async: true,
	        success: function (result) {
	            ajax.parseJSONP(result);
	        },
	        error: function (request,error) {
	            alert('Network error has occurred please try again!');
	        }
	    });         
	    
	    var ajax = {  
	        parseJSONP:function(result){
	        	//result = '[{"id":78,"html":"<img src=\"img/svc1a.jpg\" />","desc":"2 adet Max Factor ürünü alana mükemmel kıvırma etkisiyle %300\'e kadar daha dolgun kirpikler sağlayan, parfüm ve fiber içermeyen Max Factor 2000 Calorie maskara hediye. Not: Kampanya hediye ürün stoklarıyla sınırlıdır ve tüm Watsons mağazalarında geçerlidir."},{"id":87,"html":"<img src=\"img/svc1b.jpg\" />","desc":"Sıcaklığa, terlemeye dayanıklı ve dağılmayan mikro esnek formülüyle yeni Maybelline New York AFFINITONE 24H fondöten çeşitlerinde %30 indirim fırsatı Eylül ayı boyunca Watsons mağazalarında sizleri bekliyor."}]';
				$('#swipe-data').html("");
	            $.each(result, function(i, row) {
	                var tmp = $('#swipe-data').html();
	                tmp = tmp + '<div class="swiper-slide red-slide"><div class="title">' + row.d + '</div></div>';
	
	                $('#swipe-data').html(tmp);
	            });
	            initSwiper();
	        }
	    };
    };
}

function inAppBrowserTest(){
	var ref = window.open('http://apache.org', 'self', 'enableViewportScale=yes', 'location=no');
	ref.addEventListener('loadstart', function(event) { alert('start: ' + event.url); });
	ref.addEventListener('loadstop', function(event) { alert('stop: ' + event.url); });
	ref.addEventListener('loaderror', function(event) { alert('error: ' + event.message); });
	ref.addEventListener('exit', function(event) { alert(event.type); });
}


function resizeMyContent() {
	var hhtml = $('html').height();
	var pageid = $.mobile.activePage.attr('id');
	var hcontent = $('#' + pageid + ' div[data-role="content"]').height();
	var posycontent = $('#' + pageid + ' div[data-role="content"]').offset().top;
	var hcontentnew = hhtml - (posycontent * 2);
	if (hcontent < hcontentnew) {
		$('#' + pageid + ' div[data-role="content"]').css({
			'height' : hcontentnew + 'px'
		});
	}
}

function log(obj){
    $('#map-page div[data-role="header"] h1').html(obj);
}

// onSuccess Geolocation
//
function onSuccess(position) {
    $('#map-canvas').html(
		'Latitude: '           + position.coords.latitude              + '<br />' +
	    'Longitude: '          + position.coords.longitude             + '<br />' +
	    'Altitude: '           + position.coords.altitude              + '<br />' +
	    'Accuracy: '           + position.coords.accuracy              + '<br />' +
	    'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
	    'Heading: '            + position.coords.heading               + '<br />' +
	    'Speed: '              + position.coords.speed                 + '<br />' +
	    'Timestamp: '          + position.timestamp                    + '<br />'
    );
}

var getCurrentPosition = function() {
    var success = function(position) {                
    	log("success geo");
	    $('#map-canvas').html(
			'Latitude: '           + position.coords.latitude              + '<br />' +
		    'Longitude: '          + position.coords.longitude             + '<br />' +
		    'Altitude: '           + position.coords.altitude              + '<br />' +
		    'Accuracy: '           + position.coords.accuracy              + '<br />' +
		    'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
		    'Heading: '            + position.coords.heading               + '<br />' +
		    'Speed: '              + position.coords.speed                 + '<br />' +
		    'Timestamp: '          + position.timestamp                    + '<br />'
	    );
    };
    var fail = function(error) {
    	log("err:" + error.code);
	    $('#map-canvas').html(
		    'code: '    + error.code    + '\n' +
		    'message: ' + error.message + '\n'
	    );
    };

    log("testing.....");
    $("#map-canvas").html("Getting geolocation . . .");
    console.log("Getting geolocation . . .");
    
    navigator.geolocation.getCurrentPosition(success, fail, { maximumAge: 500000, timeout: 8000, enableHighAccuracy: true });
};

var cameraTest = function() {
	var success = function (imageData) {
    	log("success cam");
	    var image = document.getElementById('myImage');
	    image.src = "data:image/jpeg;base64," + imageData;
	};
	var fail = function (message) {
    	log("err:" + error.code);
	    alert('Failed because: ' + message);
	};

    log("testing.....");
    $("#map-canvas").html("Getting cam . . .");
	navigator.camera.getPicture(success, fail, { quality: 50, destinationType: Camera.DestinationType.DATA_URL}); 
};

/*
 * Google Maps documentation: http://code.google.com/apis/maps/documentation/javascript/basics.html
 * Geolocation documentation: http://dev.w3.org/geo/api/spec-source.html
 */
var initMap = function() {
    var defaultLatLng = new google.maps.LatLng(34.0983425, -118.3267434);  // Default to Hollywood, CA when no geolocation support

    if (navigator.geolocation) {
        function success(pos) {
	    	log("success map");
            // Location found, show map with these coordinates
            drawMap(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
        }
        function fail(error) {
	    	log("err:" + error.code);
            drawMap(defaultLatLng);  // Failed to find location, show default map
        }
        // Find the users current position.  Cache the location for 5 minutes, timeout after 6 seconds
        navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000, enableHighAccuracy:true, timeout: 6000});
    } else {
		log("No geolocation support");
        drawMap(defaultLatLng);  // No geolocation support, show default map
    }

    function drawMap(latlng) {
        var myOptions = {
            zoom: 10,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
        // Add an overlay to the map of current lat/lng
        var marker = new google.maps.Marker({
            position: latlng,
            map: map,
            title: "Greetings!"
        });
    }
};