var startApp = function() {
	alert('started');
	/*
	var el = document.getElementById("deviceready");
	el.innerHTML = "device is ready";
	   
	$("#hlPage1").click(function(){ window.location = "page1.html"; });
	*/
};

function isPhoneGap(){
	return (!(typeof device === "undefined"));
}
function getDeviceType(){
    var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" 
        : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" 
        : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" 
        : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" 
        : "null";
    return deviceType;
}
function platform_iOS() {
	return (getDeviceType() == "iPad" || getDeviceType() == "iPhone");
}
function platform_Android() {
	return (getDeviceType() == "Android");
}

var serviceHost = "213.74.186.117";
var swiper1 = null;
var swiper2 = null;
var swiper3 = null;
var swiper4 = null;
var swipeContentArray1 = null;
var swipeContentArray2 = null;
var swipeContentArray3 = null;
var swipeContentArray4 = null;
var map = null;

function initSwiperData(swiperObject, swiperObjectId, paginationObjectId, swipeDataElementId, swipeContentElementId, swipeContentArray, categoryId){
	
	var initSwiper = function () {
		swiperObject = $('#' + swiperObjectId).swiper({
			pagination : '#' + paginationObjectId,
			paginationClickable : true,
			loop : true,
			initialSlide : 0,
			onSlideChangeEnd : function() {
				
				$('#' + swipeContentElementId).fadeOut(function() {
	  				$(this).text(swipeContentArray[swiperObject.activeLoopIndex]).fadeIn();
				});
			}
		});
		
		if (swipeContentArray) {
			$('#' + swipeContentElementId).html(swipeContentArray[swiperObject.activeLoopIndex]);	
		}
	};
	
	if (swiperObject == null) {

	    //var svcurl = "http://feeds.delicious.com/v2/json/popular?callback=hello";      
	    //var svcurl = "http://91.201.39.21/Announcements.ashx";
	    var svcurl = "http://" + serviceHost + "/Announcements.ashx?cat=" + categoryId;
	    $.ajax({
	    	url: svcurl,
	        dataType: "jsonp",
	        async: true,
	        //crossDomain: true,
	        success: function (result) {
	            ajax.parseJSONP(result);
	        },
	        error: function (request, error) {
	            alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
	        }
	    });
	    
	    var ajax = {
	        parseJSONP:function(result){
				
				$('#' + swipeDataElementId).html("");
				$('#' + swipeContentElementId).html("");
				swipeContentArray = new Array();
				
	            $.each(result, function(i, row) {
	                var tmp = $('#' + swipeDataElementId).html();
	                //tmp = tmp + '<div class="swiper-slide"><div class="title">' + row.Html + '</div></div>';
	                tmp = tmp + '<div class="swiper-slide">' + row.Html + '</div>';
	                $('#' + swipeDataElementId).html(tmp);
	                
     				swipeContentArray.push(row.Description);
	            });
	            initSwiper();
	        }
	    };
    };
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

/*
var getCurrentPosition = function() {
    var onGeoSuccess = function(position) {                
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
	    ).append();
    };
    var onGeoFail = function(error) {
    	log("err:" + error.code);
	    $('#map-canvas').html(
		    'code: '    + error.code    + '\n' +
		    'message: ' + error.message + '\n'
	    );
    };

    log("testing.....");
    $("#map-canvas").html("Getting geolocation . . .");
    
    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoFail, { maximumAge: 3000, timeout: 8000, enableHighAccuracy: true });
};
*/

/*
 * Google Maps documentation: http://code.google.com/apis/maps/documentation/javascript/basics.html
 * Geolocation documentation: http://dev.w3.org/geo/api/spec-source.html
 */
var initMap = function(highAccuracy) {
    
    var onGeoSuccess = function(position) {
    	var myLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        // Add an overlay to the map of current lat/lng
        var marker = new google.maps.Marker({
            position: myLocation,
            map: map,
            title: "Buradasınız :)"
        });

		marker.setMap(map);
		map.panTo(myLocation);
		map.setZoom(16);
    };
    
    var onGeoFail = function(error) {
        alert('Konum bilginize ulaşılamıyor.');
    };
    
    var initialLocation = new google.maps.LatLng(39.92661, 32.83525);//position.coords.latitude, position.coords.longitude);
    map = new google.maps.Map(document.getElementById('map-canvas'), 
        {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: initialLocation,
            zoom: 11
        });

    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoFail, { timeout: 5000, enableHighAccuracy: highAccuracy });
};

var cameraTest = function() {
    var onCamSuccess = function (imageData) {
        /* No action required */
    };

    var onCamFail = function (error) {
        alert('Kamera kullanılamıyor (' + error.code + ')');
    };

    //navigator.camera.cleanup(onCamSuccess, onCamFail);
    var cameraPopoverHandle = navigator.camera.getPicture(onCamSuccess, onCamFail, 
        {
            quality:25,
            allowEdit:false, 
            sourceType:Camera.PictureSourceType.CAMERA, 
            destinationType:Camera.DestinationType.DATA_URL, 
            encodingType:Camera.EncodingType.JPEG,
            cameraDirection:Camera.Direction.FRONT,
            targetWidth: 80,
            targetHeight: 80,
            saveToPhotoAlbum: false
        });
    
    $("#map-canvas").html("done cam . . .<br>");
};

function openInAppBrowser(url)
{
    try {
        ref = window.open(encodeURI(url), '_blank', 'location=no,enableViewPortScale=yes');//encode is for if you have any variables in your link
    }
    catch (err)
    {
        alert(err);
    }
}
function goMap(latidute, longitude){
	$.mobile.changePage($("#map-page"), { transition: "flip" });
    resizeMyContent();

    var shopLocation = new google.maps.LatLng(latidute, longitude);
    
    map = new google.maps.Map(document.getElementById('map-canvas'), 
        {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: shopLocation,
            zoom: 16
        });
        
        // Add an overlay to the map of current lat/lng
        var marker = new google.maps.Marker({
            position: shopLocation,
            map: map,
            title: "Cosmetica"
        });

		marker.setMap(map);
		/*
		map.panTo(myLocation);
		map.setZoom(16);
		*/
}
var getShopList = function(){
    var svcurl = "http://" + serviceHost + "/Shops.ashx";
    $.ajax({
    	url: svcurl,
        dataType: "jsonp",
        async: true,
        success: function (result) {
            ajax.parseJSONP(result);
        },
        error: function (request, error) {
            alert('Bağlantı hatası oluştu tekrar deneyiniz!' + request);
        }
    });
    
    var ajax = {
        parseJSONP:function(result){
			$('#shop-content').html("");

            $.each(result, function(i, row) {
                var tmp = $('#shop-content').html();
                tmp = tmp + "<div class='shop-container' onclick='goMap(" + row.Latitude + "," + row.Longitude + ");'>";                 
            	tmp = tmp + "<div class='shop-title'>" + row.Caption + "</div>";
            	tmp = tmp + "<div class='shop-address'>" + row.Address + "</div>";
        		tmp = tmp + "</div>";
                
                $('#shop-content').html(tmp);
            });
        }
    };
};
