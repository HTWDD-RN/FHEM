




$().ready(function() {


	$("#Left_arrow_img").click(function() {
		var Top_menu_wrap = $( "#Left_menu_1" );
	
		if( parseInt(Top_menu_wrap.css( "left" ).replace(/px/g, "")) < -199) {			
			Top_menu_wrap.animate({ "left": "+=200px" }, "slow", function() {
				$( "#Left_arrow_img" ).attr("src", "img/arrow_4_up.png");
			});
		} else {	
			Top_menu_wrap.animate({ "left": "-=200px" }, "slow", function() {
				$( "#Left_arrow_img" ).attr("src", "img/arrow_4_down.png");
			});		
		}
	});
	
	$( "#Left_arrow_img" ).mouseover(function() {
		var Top_menu_wrap = $( "#Left_menu_1" );
		if( parseInt(Top_menu_wrap.css( "left" ).replace(/px/g, "")) === -200) {			
			$( "#Left_arrow_img" ).attr("src", "img/arrow_4_down_hover.png");
		} else {					
			$( "#Left_arrow_img" ).attr("src", "img/arrow_4_up_hover.png");			
		}
	}).mouseout(function() {
		var Top_menu_wrap = $( "#Left_menu_1" );
		if( parseInt(Top_menu_wrap.css( "left" ).replace(/px/g, "")) === -200) {			
			$( "#Left_arrow_img" ).attr("src", "img/arrow_4_down.png");
		} else if(parseInt(Top_menu_wrap.css( "left" ).replace(/px/g, "")) === 0){					
			$( "#Left_arrow_img" ).attr("src", "img/arrow_4_up.png");			
		}
	});	
	
	$("input").keypress(function(event) {
		if (event.which == 13) {
			event.preventDefault();
			$("#Left_Login_Form").submit();
		}
	});
	
	$( "#Left_arrow_img" ).trigger( "click" );
	
});