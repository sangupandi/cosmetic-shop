var startApp = function() {
	alert('started');
	/*
	var el = document.getElementById("deviceready");
	el.innerHTML = "device is ready";
	   
	$("#hlPage1").click(function(){ window.location = "page1.html"; });
	*/
};

function initSwiper(){
    var mySwiper = new Swiper('.swiper-container',{
        pagination: '.pagination',
        paginationClickable: true,
        onTouchStart : function() {
            //Do something when you touch the slide
            //alert('OMG you touch the slide!');
        }
    });
}
