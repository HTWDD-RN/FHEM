/*
function Befehlabsetzen (Befehl) {
//	alert("hier");
	var Ergebnis;
	$.post('FHEM_Anfrage.php', 
			{
				BF: Befehl
			}, 
			function(data){
			//	alert("hier " + data);
				Ergebnis = data;
				return 				
			}
	);
	return Ergebnis;
}
*/

var fade_delay = 1;

function myTimer()
{	
	$("#room" + fade_delay).fadeIn("slow", function() {});
	fade_delay++;
}

$().ready(function() {


//	$('#room1').hide();
	setInterval(function(){myTimer()},300);
//	setTimeout(2000,$("#room1").fadeIn("slow", function() {}));

	$("#ON").click(function() {
		
		
		$.post('FHEM_Anfrage.php', 
			{
				BF: 'set fl_Lampe1 on'
			}, 
			function(data){
			//	alert("hier " + data);
				if(data == 1){		
					document.getElementById('Device1').src="img/on.png";
				}		
			}
		);
	});
	
	$("#OFF").click(function() {
	
		$.post('FHEM_Anfrage.php', 
			{
				BF: 'set fl_Lampe1 off'
			}, 
			function(data){
			//	alert("hier " + data);
				if(data == 1){		
					document.getElementById('Device1').src="img/off.png";
				}		
			}
		);
	});
	
});