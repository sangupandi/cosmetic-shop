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
	    //});
	    
	    var ajax = {  
	        parseJSONP:function(result){
	        	//result = '[{"id":78,"html":"<img src=\"img/svc1a.jpg\" />","desc":"2 adet Max Factor ürünü alana mükemmel kıvırma etkisiyle %300\'e kadar daha dolgun kirpikler sağlayan, parfüm ve fiber içermeyen Max Factor 2000 Calorie maskara hediye. Not: Kampanya hediye ürün stoklarıyla sınırlıdır ve tüm Watsons mağazalarında geçerlidir."},{"id":87,"html":"<img src=\"img/svc1b.jpg\" />","desc":"Sıcaklığa, terlemeye dayanıklı ve dağılmayan mikro esnek formülüyle yeni Maybelline New York AFFINITONE 24H fondöten çeşitlerinde %30 indirim fırsatı Eylül ayı boyunca Watsons mağazalarında sizleri bekliyor."}]';
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
	var ref = window.open('http://apache.org', '_blank', 'location=yes');
	ref.addEventListener('loadstart', function(event) { alert('start: ' + event.url); });
	ref.addEventListener('loadstop', function(event) { alert('stop: ' + event.url); });
	ref.addEventListener('loaderror', function(event) { alert('error: ' + event.message); });
	ref.addEventListener('exit', function(event) { alert(event.type); });
}

    