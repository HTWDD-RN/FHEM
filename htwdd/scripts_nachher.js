var fade_delay = 0;
var timerId = 0;

function myTimer()
{	
	if(fade_delay < Rooms_to_render.length) {
		$("#" + Rooms_to_render[fade_delay].ID).fadeIn("slow", function() {});
	} else {
		clearInterval(timerId);
	}
	fade_delay++;
}


$().ready(function() {
	var Breite = $( window ).width();
	var Hoehe = $( window ).height(), i = 0;
	
	
	for(i = 0; i < FS20_Devices.length; i++) {
		All_Devices[FS20_Devices[i].Name] = FS20_Devices[i];
	}
	for(i = 0; i < FHT_Devices.length; i++) {
		All_Devices[FHT_Devices[i].Name] = FHT_Devices[i];
	}
	for(i = 0; i < HM_Devices.length; i++) {
		All_Devices[HM_Devices[i].Name] = HM_Devices[i];
	}	
	for(i = 0; i < WSN_Devices.length; i++) {
		All_Devices[WSN_Devices[i].Name] = WSN_Devices[i];
	}	
	
	// Die einzelnen Raeume rendern
	Room_renderer(Breite, 'start');
	
	timerId = setInterval(function(){myTimer()},300);

	
});