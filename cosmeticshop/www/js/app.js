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
	    //$(document).bind('pagebeforeshow', function(e, data){
	    var svcurl = "http://feeds.delicious.com/v2/json/popular?callback=hello";      
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
	    //});
	    
	    var ajax = {  
	        parseJSONP:function(result){
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