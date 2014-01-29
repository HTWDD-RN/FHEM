var Room_Line_frist = 0;
var room_ID_nz = undefined;
var Treffer = 0;
var Raum_mit_Treffer = 0;
var fhem_expert_aktive = 0;
//var start = {x:0,y:0};

var fhemsave='false'; // global für Entwicklung, im Realbetrieb auf true setzen

/* KOMMANDOZEILE AUTTOSUGGEST START */

function suggest(inputString){
		if(inputString.length == 0) {
			$('#suggestions').fadeOut();
		} else {
//			$('#Kommandozeile_input').addClass('load');
			$.post("autosuggest.php", {queryString: inputString}, function(data){
				if(data.length >0) {
					$('#suggestions').fadeIn();
					$('#suggestionsList').html(data);
//					$('#Kommandozeile_input').removeClass('load');
				} else {
					$('#suggestions').fadeOut();
				}
			});
		}
}

function fill(thisValue) {
	$('#Kommandozeile_input').val(thisValue);
	setTimeout("$('#suggestions').fadeOut();", 600);
}

function enterpressalert(e, myvalue){

	var code = (e.keyCode ? e.keyCode : e.which);
	if(code == 13) { //Enter keycode
	
	var save='false';
	if ($('#savefhem').is(':checked')) {
	save='true';
	}
	
	
	
	$.post('FHEM_Anfrage.php', {BF: myvalue.value, SAVE: save}, function(data) {
		if (data.length >0) {
			//$("#wrap").append(data);										
			}
									
									
	});

  	
	//alert("Abgeschickter Befehl: "+myvalue.value+ "Save: "+save); // attr b1_lampe1 room Flur_EG
	save=false;	
	}
}

/* KOMMANDOZEILE AUTTOSUGGEST END */

// ROOM NEW START
	
	function newroomtext(e, myvalue) {
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13) { //Enter keycode
			//alert("Enter gedrückt");
	//		Rooms.push(new Room(myvalue.value, myvalue.value, 1,0));
	//		var Breite = $( window ).width();
	//		Room_renderer(Breite);	
			
			if (myvalue.value === "") { // 02.01.14 neu
				myvalue.value="unbenannt";
			}
			Rooms[Rooms.length - 1].Name = myvalue.value;
			
			roomname=document.getElementById("room"+(Rooms.length)).getElementsByClassName("titel_align");
			roomname[0].firstChild.data=myvalue.value;
			//getElementByID("titel_room"+(Rooms.length-1));
			
		}
	}
	
	function newroomtextalt(e, myvalue) {
	
	//alert("onblur");
	
	if (myvalue.value === "") { // 02.01.14 neu
				myvalue.value="unbenannt";
			}
			Rooms[Rooms.length - 1].Name = myvalue.value;
			
			roomname=document.getElementById("room"+(Rooms.length)).getElementsByClassName("titel_align");
			roomname[0].firstChild.data=myvalue.value;
	
	}
	
	function addroom(ev) {
		var Breite = $( window ).width();
		Rooms.push(new Room('room' + (Rooms.length + 1), "Test", 1,0));
		$("#Room_plus").last().before('<div id="room' + Rooms.length + '" class="room">\
		<div id="titel_room' + Rooms.length + '" class="titel_room"> \
		<div class="titel_align"><input id="room' + Rooms.length + '_input" class="roomname_input" size="30" onblur="newroomtextalt(event, this)" onKeyPress="newroomtext(event, this)"></input></div> \
		</div>\
		<div id="room' + Rooms.length + '_content" class="content_room" ondrop="room_drop(event)" ondragover="room_allowDrop(event)"> \
		</div>\
		</div>');	
		Room_renderer(Breite);
		$("#" + 'room' + Rooms.length).fadeIn("slow", function() {
			$( '#room' + Rooms.length + '_input' ).focus();
		});		// hier wird von Display: none auf Display: block geaendert
		
		
		// Raum löschen
		// Raumnamen ändern -.- 
	}
	
	function delete_room(id, ev) { // 02.01.14 neu in script_users auch noch id eingefügt
	var Breite = $( window ).width();
	var room = id.split("_"); // "xyz_roomx abtrennen bei _
	var roomnumber= room[0].split("room");
	
	var j=0; var i=0; var k=0; var roomnznumber=0;
	var HTML = '';
	
	for(k = 0; k < Rooms.length; k++) {
							if(Rooms[k].Name === "nicht zugeordnet") {
								roomnznumber=k;
							}
						}

	var devicefinder= document.getElementById(room[0]).getElementsByClassName('room_device');
		for (j=0; j< devicefinder.length; j++) {
			
			var Device_Name = devicefinder[j].id.substring(0, devicefinder[j].id.lastIndexOf("_"));
			
			//alert("Vorher:"+devicefinder[j].id);
			devicefinder[j].id = Device_Name+'_'+room_ID_nz;
			//alert("Jetzt:"+devicefinder[j].id);
			
			// :)
			//document.getElementById(Rooms[roomnznumber]).getElementsByClassName('room_device')[j].id=Device_Name+'_'+room_ID_nz;
			//alert(document.getElementById(room[0]).getElementsByClassName('room_device')[j].id);
			
			//Änderung im JS
			All_Devices[Device_Name].rooms = [];
			All_Devices[Device_Name].rooms.push("nicht zugeordnet");
			
			
			//All_Devices[Device_Name].rooms[0]='nicht zugeordnet';
			//alert(All_Devices[Device_Name].type);
			//var FS20_Devices = [];var FHT_Devices = [];var HM_Devices = [];var WSN_Devices = [];
			if (All_Devices[Device_Name].type === 'FS20') { // 'FHT' 'WSN' 'HM'  'FS20'
				
				for (i=0; i<FS20_Devices.length; i++) {
						HTML = '';
						jsevent= '';
					if (FS20_Devices[i].Name === Device_Name) {
						FS20_Devices[i].rooms = [];
						FS20_Devices[i].rooms.push("nicht zugeordnet");	
						
						HTML = HTML + "<div id=\"" + FS20_Devices[i].Name + "_" + room_ID_nz + '" class="room_device" draggable="true" ondragstart="room_drag(event)" ondragend="room_dragend(event)" style="left: 10px">'; 
						HTML = HTML + $("#" + FS20_Devices[i].Name + "_" + room_ID_nz).html();
						
						/*
						if((Devices[i].sensor_or_aktor == 'aktor') && (Devices[i].webCmd == '')) {
							Output['js'] = Output['js'] + '$( ".' + Devices[i].Name + '_img").last().click(' + Devices[i].type + '_Devices[' + i + '].Command_on_off);';
						} else if((Devices[i].sensor_or_aktor == 'aktor') && (Devices[i].webCmd == 'dim')) {
								Output['js'] = Output['js'] + slider_aufbau(i);
						}
						*/
						
						
						
						
						
						if (FS20_Devices[i].sensor_or_aktor === 'aktor'){  
						
							
						
							
						
						Rooms[roomnznumber].Anzahl_Aktoren++;
							if( $('#sensor_gap_'+room_ID_nz).length < 1) {
								$('#' + room_ID_nz + '_content').children().last().after(HTML);	
										//alert("FÜGE HTML EIN:"+HTML);
							} else {
									$('#sensor_gap_'+room_ID_nz).before(HTML);		
										//alert("FÜGE HTML EIN:"+HTML);
											
										
										
							}
						
						//alert(FS20_Devices[i].webCmd);
						if(FS20_Devices[i].webCmd == '') {
							
							jsevent= jsevent + '$( ".' + FS20_Devices[i].Name + '_img").last().click(' + FS20_Devices[i].type + '_Devices[' + i + '].Command_on_off);';
							
							} else if (FS20_Devices[i].webCmd == 'dim') {
							jsevent= jsevent + slider_aufbau(i);
							} else {
							jsevent=jsevent+'$( ".' + FS20_Devices[i].Name + '_img").last().click(' + FS20_Devices[i].type + '_Devices[' + i + '].Command_on_off);';
							
							}
							//alert("jsevent="+jsevent);
							//eval(jsevent);
						
							JSEVENTS=JSEVENTS+jsevent; // in globale Variable von scripts_user.js packen
						
						}
						else  {
						Rooms[roomnznumber].Anzahl_Sensoren++;
							
							//alert("FÜGE HTML EIN:"+HTML);
							if( $('#sensor_gap_' + room_ID_nz).length === 0 ) {
										$("#" + room_ID_nz + "_content").append('<div id="sensor_gap_' + room_ID_nz + '" style="border-top: 3px ridge silver; width:400px; height: 6px; top: 10px; position: relative; float: left;"> </div>');
									}
							$('#' + room_ID_nz + '_content').children().last().after(HTML);
						}
						
												
						Room_renderer(Breite);
						Device_mapping_generieren();
						
							
							/*
						$("#" + data)[0].id = current_drag_Device_Name + '_' + room_ID_nz;
						$("#" + current_drag_Device_Name + "_" + roomold).remove();
						
						*/
						
					}
				}
			}
			
			if (All_Devices[Device_Name].type === 'WSN') { // 'FHT' 'WSN' 'HM' 'FS20'
			
				for (i=0; i<WSN_Devices.length; i++) {
						HTML = '';
						jsevent = '';
					if (WSN_Devices[i].Name === Device_Name) {
						WSN_Devices[i].rooms = [];
						WSN_Devices[i].rooms.push("nicht zugeordnet");	
						
						HTML = HTML + "<div id=\"" + WSN_Devices[i].Name + "_" + room_ID_nz + '" class="room_device" draggable="true" ondragstart="room_drag(event)" ondragend="room_dragend(event)" style="left: 10px">'; 
						HTML = HTML + $("#" + WSN_Devices[i].Name + "_" + room_ID_nz).html();
						
						if (WSN_Devices[i].sensor_or_aktor === 'aktor'){ 
						Rooms[roomnznumber].Anzahl_Aktoren++;
						//alert(Rooms[0].Name);
						if( $('#sensor_gap_'+room_ID_nz).length < 1) {
								$('#' + room_ID_nz + '_content').children().last().after(HTML);	
										//alert("FÜGE HTML EIN:"+HTML);
							} else {
									$('#sensor_gap_'+room_ID_nz).before(HTML);		
										//alert("FÜGE HTML EIN:"+HTML);
							}
						
						if(WSN_Devices[i].webCmd == '') {
							
							jsevent= jsevent + '$( ".' + WSN_Devices[i].Name + '_img").last().click(' + WSN_Devices[i].type + '_Devices[' + i + '].Command_on_off);';
							
							} else if (WSN_Devices[i].webCmd == 'dim') {
							jsevent= jsevent + slider_aufbau(i);
							}
							//alert("jsevent="+jsevent);
							//eval(jsevent);
						
							JSEVENTS=JSEVENTS+jsevent; // in globale Variable von scripts_user.js packen
						
						
						
						}
						else  {
						Rooms[roomnznumber].Anzahl_Sensoren++;
							
							//alert("FÜGE HTML EIN:"+HTML);
							
							if( $('#sensor_gap_' + room_ID_nz).length === 0 ) {
										$("#" + room_ID_nz + "_content").append('<div id="sensor_gap_' + room_ID_nz + '" style="border-top: 3px ridge silver; width:400px; height: 6px; top: 10px; position: relative; float: left;"> </div>');
									}
							$('#' + room_ID_nz + '_content').children().last().after(HTML);
							
							
							
						}
												
						Room_renderer(Breite);
						Device_mapping_generieren();
						
						
						
						
					}
				}
			}
			
			if (All_Devices[Device_Name].type === 'FHT') { // 'FHT' 'WSN' 'HM' 'FS20'
				HTML = '';
				jsevent= '';
				for (i=0; i<FHT_Devices.length; i++) {
				
					if (FHT_Devices[i].Name === Device_Name) {
						FHT_Devices[i].rooms = [];
						FHT_Devices[i].rooms.push("nicht zugeordnet");	
						
						HTML = HTML + "<div id=\"" + FHT_Devices[i].Name + "_" + room_ID_nz + '" class="room_device" draggable="true" ondragstart="room_drag(event)" ondragend="room_dragend(event)" style="left: 10px">'; 
						HTML = HTML + $("#" + FHT_Devices[i].Name + "_" + room_ID_nz).html();
						
						if (FHT_Devices[i].sensor_or_aktor === 'aktor'){ 
						Rooms[roomnznumber].Anzahl_Aktoren++;
						//alert(Rooms[0].Name);
						if( $('#sensor_gap_'+room_ID_nz).length < 1) {
								$('#' + room_ID_nz + '_content').children().last().after(HTML);	
										//alert("FÜGE HTML EIN:"+HTML);
							} else {
									$('#sensor_gap_'+room_ID_nz).before(HTML);		
										//alert("FÜGE HTML EIN:"+HTML);
							}
						
						if(FHT_Devices[i].webCmd == '') {
							
							jsevent= jsevent + '$( ".' + FHT_Devices[i].Name + '_img").last().click(' + FHT_Devices[i].type + '_Devices[' + i + '].Command_on_off);';
							
							} else if (FHT_Devices[i].webCmd == 'dim') {
							jsevent= jsevent + slider_aufbau(i);
							}
							//alert("jsevent="+jsevent);
							//eval(jsevent);
						
							JSEVENTS=JSEVENTS+jsevent; // in globale Variable von scripts_user.js packen
						
						
						}
						else  {
						Rooms[roomnznumber].Anzahl_Sensoren++;
							
							//alert("FÜGE HTML EIN:"+HTML);
							
							if( $('#sensor_gap_' + room_ID_nz).length === 0 ) {
										$("#" + room_ID_nz + "_content").append('<div id="sensor_gap_' + room_ID_nz + '" style="border-top: 3px ridge silver; width:400px; height: 6px; top: 10px; position: relative; float: left;"> </div>');
									}
							$('#' + room_ID_nz + '_content').children().last().after(HTML);
						}
												
						Room_renderer(Breite);
						Device_mapping_generieren();
						
					}
				}
			}
			
			if (All_Devices[Device_Name].type === 'HM') { // 'FHT' 'WSN' 'HM' 'FS20'
				jsevent='';
				HTML = '';
				for (i=0; i<HM_Devices.length; i++) {
				
					if (HM_Devices[i].Name === Device_Name) {
						HM_Devices[i].rooms = [];
						HM_Devices[i].rooms.push("nicht zugeordnet");	
						
						HTML = HTML + "<div id=\"" + HM_Devices[i].Name + "_" + room_ID_nz + '" class="room_device" draggable="true" ondragstart="room_drag(event)" ondragend="room_dragend(event)" style="left: 10px">'; 
						HTML = HTML + $("#" + HM_Devices[i].Name + "_" + room_ID_nz).html();
						
						if (HM_Devices[i].sensor_or_aktor === 'aktor'){ 
						Rooms[roomnznumber].Anzahl_Aktoren++;
						//alert(Rooms[0].Name);
						if( $('#sensor_gap_'+room_ID_nz).length < 1) {
								$('#' + room_ID_nz + '_content').children().last().after(HTML);	
										//alert("FÜGE HTML EIN:"+HTML);
							} else {
									$('#sensor_gap_'+room_ID_nz).before(HTML);		
										//alert("FÜGE HTML EIN:"+HTML);
							}
						
												
						jsevent= jsevent + '$( ".' + HM_Devices[i].Name + '_img").last().click(' + HM_Devices[i].type + '_Devices[' + i + '].Command_on_off);';
							
												
							JSEVENTS=JSEVENTS+jsevent; // in globale Variable von scripts_user.js packen
						
						}
						else  {
						Rooms[roomnznumber].Anzahl_Sensoren++;
							
							//alert("FÜGE HTML EIN:"+HTML);
							
							if( $('#sensor_gap_' + room_ID_nz).length === 0 ) {
										$("#" + room_ID_nz + "_content").append('<div id="sensor_gap_' + room_ID_nz + '" style="border-top: 3px ridge silver; width:400px; height: 6px; top: 10px; position: relative; float: left;"> </div>');
									}
									
							$('#' + room_ID_nz + '_content').children().last().after(HTML);
						}
												
						Room_renderer(Breite);
						Device_mapping_generieren();
						
					}
				}
			}
			
			
			//Änderung via Controller an Model geben
			Befehl = "deleteattr " + Device_Name + " room";	
					$.post('FHEM_Anfrage.php', {BF: Befehl, SAVE: fhemsave} ); 	// False noch wegen Development, true im Realbetrieb
			
			
		}
	
	Device_mapping_generieren(); // Muss unbedingt vor dem Removen der ID passieren - saß da Stunden dran das rauszufinden -.-
	
	/*
	for(k = 0; k < Rooms.length; k++) {
//			if( typeof $('#sensor_gap_' + Rooms[k].ID) === "undefined" ) {
			if( $('#sensor_gap_' + Rooms[k].ID).length === 0 ) {
				$("#" + Rooms[k].ID + "_content").append('<div id="sensor_gap_' + Rooms[k].ID + '" style="border-top: 3px ridge silver; width:400px; height: 6px; top: 10px; position: relative; float: left;"> </div>');
			}
		}
	*/

	$('#'+room[0]).remove();
	$('#'+id).remove();

	Rooms.splice(roomnumber[1]-1,1);
	Room_renderer(Breite);
	
	//alert(JSEVENTS);
	}


// ROOM NEW END

// DRAG&DROP

function Device_mapping_generieren() {
	var Hoehe = $( window ).height(), Breite = $( window ).width();
			
	FS20_HTML = Device_HTML(FS20_Devices, room_ID_nz);
	FHT_HTML = Device_HTML(FHT_Devices, room_ID_nz);
	HM_HTML = Device_HTML(HM_Devices, room_ID_nz);
	if($('#Device_unmapped').length < 1) {
		if((FS20_HTML['html'] === ' ') && (FHT_HTML['html'] === ' ') && (HM_HTML['html'] === ' ') ) {
			$("body").append('<div id="Device_unmapped" ondrop="room_drop(event)" ondragover="room_allowDrop(event)" ><div class="Left_menu_Titel Menue_einzeln" style="margin-bottom: -5px;" >alle zugeordnet</div></div>');
		} else {
			$("body").append('<div id="Device_unmapped" class="some-content-related-div" ondrop="room_drop(event)" ondragover="room_allowDrop(event)"><div id="scroll_div"></div></div>');
		}
	} else {
		$("#scroll_div").empty();
	}
	
	// maximale Hoehe ist 800px bzw. 790px
	// minimale Hohe ist 400px 
	// 20px unterer Rand
	// Abstand nach oben ist 100px
	Hoehe = Hoehe - 100;
	if( Hoehe > 820) {
		$("#Device_unmapped").css("height", (800) +"px" );
		slim_height = '790px';
	} else if(Hoehe > 420) {
		$("#Device_unmapped").css("height", (Hoehe - 20) +"px" );
		slim_height = (Hoehe - 20 - 10) + 'px';
	} else {
		$("#Device_unmapped").css("height", "400px" );
		slim_height = '390px';
	}	

	$("#Device_unmapped").css("left", (Breite - 200 - 2) +"px" );
	
	Device_render_room_line(FS20_HTML['html'], "FS20");
	Device_render_room_line(FHT_HTML['html'], "FHT");
	Device_render_room_line(HM_HTML['html'], "HM");
	
	// JavaScript ausführen
	eval(FS20_HTML['js']);
	eval(FHT_HTML['js']);
	eval(HM_HTML['js']);
	
	$("#scroll_div").append('<div id="Room_Line_Puffer_div"></div>');
	
	$('#scroll_div').slimScroll({
		color: '#747f96',
		railVisible: true,
		railColor: '#222',
//			distance: '20px',
		railOpacity: 0.5,
		height: slim_height
	});		
}

/* ohne diese Funktion wird kein Drop ausgelost */	 
function room_allowDrop(ev)
{
	ev.preventDefault();

}

function room_dragend(ev) {
	var k = 0, Device_Name = ev.target.id.substring(0, ev.target.id.lastIndexOf("_"));
	var Breite = $( window ).width();
//	alert('Ende')
	
	// Es erfolgt kein Drop -> Rollback
	if(Treffer !== 1) {		
	
		if(All_Devices[Device_Name].sensor_or_aktor == "aktor") {
			for(k = 0; k < Rooms.length; k++) {
				Rooms[k].Anzahl_Aktoren--;
			}										
		} else {
			for(k = 0; k < Rooms.length; k++) {
				Rooms[k].Anzahl_Sensoren--;				
				if( Rooms[k].Anzahl_Sensoren === 0 ) {		
					$("#sensor_gap_" + Rooms[k].ID).remove()	
				}
			}			
		}
		$(".room_device_preview").remove(); 
	} else {	// Es erfolgte ein Drop
		if(All_Devices[Device_Name].sensor_or_aktor == "aktor") {	// In allen nicht betroffenen Räumen die Anzahl wieder verringern
			for(k = 0; k < Rooms.length; k++) {
				if(Rooms[k].ID !== Raum_mit_Treffer) {	
					Rooms[k].Anzahl_Aktoren--;
				}
			}
		} else {
			for(k = 0; k < Rooms.length; k++) {
				if(Rooms[k].ID !== Raum_mit_Treffer) {	
					Rooms[k].Anzahl_Sensoren--;				
				}
				if( Rooms[k].Anzahl_Sensoren === 0 ) {		
					$("#sensor_gap_" + Rooms[k].ID).remove()	
				}
			}			
		}
		Treffer = 0;	
		$(".room_device_preview").remove(); 		
	}
	Room_renderer(Breite);
}

function previewdelete(ev) {

ev.preventDefault();
$(".room_device_preview").remove(); 
}

function room_drag(ev) {
	var i = 0, Device_Name = ev.target.id.substring(0, ev.target.id.lastIndexOf("_")), k = 0;
	var Breite = $( window ).width(), content_children = 0;
	
	ev.dataTransfer.setData("Text",ev.target.id);
	
	if(All_Devices[Device_Name].sensor_or_aktor == "aktor") {
		// fuer alle Raeume zunaechst die Aktorenzahl erhoehen
		for(k = 0; k < Rooms.length; k++) {
			Rooms[k].Anzahl_Aktoren++;
		}		
		Room_renderer(Breite);
		
		for(k = 0; k < Rooms.length; k++) {
			if(Rooms[k].Anzahl_Sensoren > 0 ) {
				$("#" + Rooms[k].ID + "_content").children().each(function( index ) {
					if((index+1) === (Rooms[k].Anzahl_Aktoren-1)) {
						$( this ).after("<div id=\"room_device_preview\" class=\"room_device_preview\"></div>");
					}				
				});
			} else {
				$("#" + Rooms[k].ID + "_content").append("<div id=\"room_device_preview\" class=\"room_device_preview\"></div>");	
			}
		}						
	} else {
		for(k = 0; k < Rooms.length; k++) {
			Rooms[k].Anzahl_Sensoren++;
		}
		Room_renderer(Breite);
		// Trennstrich einfuegen
		
		// Wenn strich schon vorhanden nicht einfügen
		for(k = 0; k < Rooms.length; k++) {
//			if( typeof $('#sensor_gap_' + Rooms[k].ID) === "undefined" ) {
			if( $('#sensor_gap_' + Rooms[k].ID).length === 0 ) {
				$("#" + Rooms[k].ID + "_content").append('<div id="sensor_gap_' + Rooms[k].ID + '" style="border-top: 3px ridge silver; width:400px; height: 6px; top: 10px; position: relative; float: left;"> </div>');
			}
		}
		$(".content_room").append("<div id=\"room_device_preview\" class=\"room_device_preview\" ></div>");
	}
	// ermoeglichen schon Zugeordnete Geraete wieder von den Raeumen einzeln zu loesen 
	if(All_Devices[Device_Name].rooms[0] !== "nicht zugeordnet") {
		$("#scroll_div").children().first().before("<div id=\"room_device_preview\" class=\"room_device_preview\" style=\"left: 10px\"></div>");
	}
	
}

function room_drop(ev)
{
	var data = ev.dataTransfer.getData("Text");
	var Befehl = "";
	current_drag_Device_Name = data.substring(0, data.lastIndexOf("_"));
	var roomold = data.split("_").pop(); // "xyz_roomx abtrennen bei _	
	var roomnew = ev.target.id.split("_"); //alert (roomnew[0]);	
	var roomnew_content = ev.target.id;
	var newid = '';
	var currentoffset = ev.target;	
//	alert('Drop')

/*
	if(roomold === 'room') {
		alert(roomold + ' ' + data + ' ' + data.split("_").pop());
	}
	if((newid.split("_").pop() === 'room') ) {
		alert('data: ' + data + ' roomold: ' + roomold + ' newid: ' + newid);
	}
*/	
	// Wenn ein Geraet aus dem Raum zurueck in die Leiste nicht zugeordnet gezogen wird...
	
	// durchgehen der Parents bis auf Undefined und prüfen ob eines davon die Device_unmapped Leiste war 	
	while((typeof currentoffset !== 'undefined') && (currentoffset !== null) && (currentoffset.id !== null)) {
		
		if( currentoffset.id === 'Device_unmapped') {
			Treffer = 1;
			Raum_mit_Treffer = room_ID_nz;
			ev.preventDefault(); //??
//			alert('hier');
//			$('#scroll_div').children().each(function(index) {
				var i = 0, Befehl = '';
			
//				if($(this).attr("id") === All_Devices[current_drag_Device_Name].type) {
//					$(this).after($("#" + data)); // Besser am ende die Leiste neu generieren 
//					$("#" + data).css("left","10px");
					// den Room fuer das Device im JavaScript anpassen
					for(i = 0; i < Rooms.length; i++) {
						// nz Room.sensor muss um eins erhöht werden
						if(Rooms[i].ID === roomold) {
							if(All_Devices[current_drag_Device_Name].sensor_or_aktor == "aktor") {
								Rooms[i].Anzahl_Aktoren--;
								if( $('#sensor_gap_' + room_ID_nz).length < 1 ) {
									$('#' + room_ID_nz + '_content').children().last().after($("#" + data));			
								} else {
									$('#sensor_gap_' + room_ID_nz).before($("#" + data));
								}
							} else {
								Rooms[i].Anzahl_Sensoren--;
								$('#' + room_ID_nz + '_content').children().last().after($("#" + data));
							}
						}
						// Die anzahl muss im nicht zugeordneten Raum noch um 1 erhoeht werden
						
					}
					All_Devices[current_drag_Device_Name].rooms = [];
					All_Devices[current_drag_Device_Name].rooms.push("nicht zugeordnet");
					
					//var save='true';
					
					// Befehl abschicken
					Befehl = "deleteattr " + current_drag_Device_Name + " room";	
					$.post('FHEM_Anfrage.php', {BF: Befehl, SAVE: fhemsave} ); 	
					
/*					for(i = 0; i < All_Devices[current_drag_Device_Name].rooms.length; i++) {
						if( === "nicht zugeordnet" ) {
							All_Devices[current_drag_Device_Name].rooms[i] = "";
						}
					}	
*/					
				
//				}								
//			});
			
			// Nicht zugeordneten Raum präparieren 
/*			if((All_Devices[current_drag_Device_Name].sensor_or_aktor == "sensor") && ($('#sensor_gap_' + room_ID_nz).length < 1) {
				
			}
*/			
						
			$("#" + data)[0].id = current_drag_Device_Name + '_' + room_ID_nz;
			$("#" + current_drag_Device_Name + "_" + roomold).remove();
			
			Device_mapping_generieren();
			
/*			$('#' + room_ID_nz + '_content').children().each(function(index) {
			
				if($(this).attr("id").substring(0, data.lastIndexOf("_")) === 'sensor_gap') {
					$(
				}
			});*/
//			alert(room_ID_nz);
			
			return;
		}
		currentoffset = currentoffset.offsetParent;	// ein Element hoeher suchen	
	}
	
	
	// Mache nichts wenn der neue Punkt kein Raum ist 
	if(((ev.target.id.substring(0, 4) !== 'room') || ((ev.target.id.substring(ev.target.id.length - 7, ev.target.id.length)) !== 'content' )) && (ev.target.id !== 'room_device_preview')){
		return;
	}
	// hole Parent wenn es im preview landet
	if(ev.target.id === 'room_device_preview') {
		roomnew_content = ev.target.offsetParent.id;	// die neue Raumnummer muss nun vom offsetParent geholt werden...
		roomnew = roomnew_content.split("_");
	}	
	newid = data.replace(roomold , roomnew[0]); // Raumnummer aktualisieren
	
	// fängt mit "room" an und hört mit "content" auf
	
	
	// Mache nichts wenn es der gleiche Raum war
	if ( (data.split("_").pop()+"_content") == roomnew_content) {								
			return true;	// Rest wird in Dropend erledigt
	}
	
	Treffer = 1;	// Merken das der Drop erfolgte 
	Raum_mit_Treffer = roomnew_content.replace(/_content/g, "");	// Merken wo der Drop erfolgte
	ev.preventDefault();

	All_Devices[current_drag_Device_Name].rooms = [];	// Raumliste leeren
	// Ans neue DIV Anhängen
	if(All_Devices[current_drag_Device_Name].sensor_or_aktor == "aktor") {		
		for(k = 0; k < Rooms.length; k++) {
			if(Rooms[k].ID === roomnew[0]) {
				if(Rooms[k].Anzahl_Sensoren > 0 ) {
					$("#" + Rooms[k].ID + "_content").children().each(function( index ) {
						if((index+1) === (Rooms[k].Anzahl_Aktoren-1)) {
							$( this ).after( $("#" + data) );
						}				
					});
				} else {
					$("#" + Rooms[k].ID + "_content").append( $("#" + data) );	
				}
				All_Devices[current_drag_Device_Name].rooms.push(Rooms[k].Name);	// Raumname im JS aktualisieren
			}
			
			if(Rooms[k].ID === roomold) {
				Rooms[k].Anzahl_Aktoren--;
			}
		}						
	} else {
		for(k = 0; k < Rooms.length; k++) {
			if(Rooms[k].ID === roomnew[0]) {
				$("#" + Rooms[k].ID + "_content").append( $("#" + data) );	
				All_Devices[current_drag_Device_Name].rooms.push(Rooms[k].Name);	// Raumname im JS aktualisieren
			}
			
			if(Rooms[k].ID === roomold) {
				Rooms[k].Anzahl_Sensoren--;
			}
		}
	}
	// ID neu setzen, zum glueck nimmt er das neuste zuerst ^^				
	$("#" + data)[0].id = newid;
	$("#" + current_drag_Device_Name + "_" + roomold).remove();
	
	

	
	// Prüfen ob noch geräte dieser Gruppe nicht zugeordnet sind, wenn nicht Titel löschen 
	
	
	// Hier Room ersetzen noch
	
	
	// FHEM ROOMNAME rausfinden
	
/*	if (roomnew_content == "scroll_div") {
		//alert("scroll_div");
		var raumnamefinal = "nicht zugeordnet";
	
	} else {*/
		var roomid= "titel_"+roomnew[0]; //alert (roomid);
		var roomname=document.getElementById(roomid).getElementsByClassName("titel_align");
		var raumnamefinal = roomname[0].firstChild.data;
//	}
	// Es fehlt noch der Wechsel der Leiste auf alle sind zugeordnet... 
	
	 // Wenn man mit HTML-Tools Div prüft das AKTUELLE HTML ziehen
	// Sonst steht noch das alte drin -> geht in der regel mit aktuelles HTML beziehen (refresh ohne seite neuladen)
	
	
/*	
	if (raumnamefinal !== "nicht zugeordnet") {	
		Befehl= "attr "+current_drag_Device_Name+" room "+raumnamefinal;	
	} else {
		Befehl = "deleteattr "+current_drag_Device_Name+" room";
	}
*/	
	Befehl= "attr "+current_drag_Device_Name+" room "+raumnamefinal;
//	alert("FHEM-BEFEHL: "+Befehl); // attr b1_Lampe1 room Badklein
					
	$.post('FHEM_Anfrage.php', {BF: Befehl, SAVE: fhemsave} ); 			
}




// DRAG&DROP ENDE


/*
function starte_Drag_Drop() {

	$( ".draggable" ).draggable({ 
		containment:"body",
		revert: "invalid",
		revertDuration: 400,
		start: function( event, ui ) {		
			// müssen alle nicht sichtbaren Geräte auf "display: none" gesetzt werden und dann die "Overflow: hidden" eigenschaft entfernt werden...
			
			// FS20_HTML = Device_nz_Anzeige(FS20_Devices, room_ID_nz);
			// FHT_HTML = Device_nz_Anzeige(FHT_Devices, room_ID_nz);
			// HM_HTML = Device_nz_Anzeige(HM_Devices, room_ID_nz);
			var Top_anpassung = $('.slimScrollBar').css("top").replace(/px/g, "");
			
//			$('#' + ui['helper']['0'].id).css("top",(($('#' + ui['helper']['0']).css("top").replace(/px/g, "") - Top_anpassung) + 'px'));
//			$('#' + ui['helper']['0'].id).css("top",ui['helper']['0'].offsetTop - Top_anpassung + 'px');
			
			
			Device_nz_Anzeige(HM_Devices, room_ID_nz, Device_nz_Anzeige(FHT_Devices, room_ID_nz, Device_nz_Anzeige(FS20_Devices, room_ID_nz, 0, "FS20",ui),"FHT",ui),"HM",ui)
			
			$('.slimScrollDiv').css("overflow","visible");
			$('#scroll_div').css("overflow","visible");
			
			
			//$('#Device_unmapped #Lampe8_room1')[0].offsetTop
			
//			$('#' + ui['helper']['0'].id).css("top",ui['helper']['0'].offsetTop - Top_anpassung + 'px');
			
//			ui['helper']['0'].offsetTop = ui['helper']['0'].offsetTop - Top_anpassung;
		},
		stop: function( event, ui ) {	
			
		}
	});
 
	$( ".droppable" ).droppable({
		
		tolerance: 'fit',		
		over: function(event, ui) {
			
			$('.ui-draggable-dragging').addClass('hoverClass');
		},
		out: function(event, ui) {
			
			$('.ui-draggable-dragging').removeClass('hoverClass');
		},
		
		drop: function( event, ui ) {
			$( ".droppable" ).addClass('dropClass');
		},
		deactivate: function( event, ui ) {
		
			function Dragcallback() {
				$('.slimScrollDiv').css("overflow","hidden");
				$('#scroll_div').css("overflow","hidden");
				
				$('#Device_unmapped  .room_device').each(function(index) {
					$( this ).css("display","block");				
				});
								
			}
			
			window.setTimeout(Dragcallback, 400);
			
		}		
	});
	
	// var zindex = 1000;
	// $(".room_device").unbind("mousedown").bind("mousedown", function(){
		// zindex ++;
		// $(this).css('z-index', zindex);
	// });
	
	var zindex = 1000;
	$(".room_device").on("mousedown", function(){
		zindex ++;
		$(this).css('z-index', zindex);
	});
	
}
*/

function Device_nz_Anzeige(Devices, room_ID_nz, aktuelle_px_anzahl, Type, ui) {
	var slimheight = $('#scroll_div').css("height").replace(/px/g, "") - 10;
	if(aktuelle_px_anzahl > slimheight) {
		$('#Device_unmapped ' + '#' + Type).css("display","none");
		for(i = 0; i < Devices.length; i++) {
				if($.inArray("nicht zugeordnet", Devices[i].rooms) > -1) {
					if(ui['helper']['0'].id !== (Devices[i].Name + "_" + room_ID_nz)) {
						$('#Device_unmapped ' +'#' + Devices[i].Name + "_" + room_ID_nz).css("display","none");
					}
				}
		}
	} else {
		aktuelle_px_anzahl = aktuelle_px_anzahl + 6 + 19 + 2; // margin_top + height + dorder
		if(aktuelle_px_anzahl > slimheight) {
			for(i = 0; i < Devices.length; i++) {
				if($.inArray("nicht zugeordnet", Devices[i].rooms) > -1) {
					if(ui['helper']['0'].id !== (Devices[i].Name + "_" + room_ID_nz)) {
						$('#Device_unmapped ' +'#' + Devices[i].Name + "_" + room_ID_nz).css("display","none");
					}
				}
			}
		} else {
			// forschleife ueber alle Geraete
			aktuelle_px_anzahl = aktuelle_px_anzahl + 15 + 60 + 2; // margin_top + height + dorder
			for(i = 0; i < Devices.length; i++) {
				if($.inArray("nicht zugeordnet", Devices[i].rooms) > -1) {						
					if(aktuelle_px_anzahl > slimheight) {
						if(ui['helper']['0'].id !== (Devices[i].Name + "_" + room_ID_nz)) {
							$('#Device_unmapped ' +'#' + Devices[i].Name + "_" + room_ID_nz).css("display","none");
						}
					} else {
						aktuelle_px_anzahl = aktuelle_px_anzahl + 15 + 60 + 2; // margin_top + height + dorder
					}
				}
			}			
		}
	}
//	aktuelle_px_anzahl = 0;			
	return aktuelle_px_anzahl = aktuelle_px_anzahl - 15 - 60 - 2;;
}

function Device_HTML(Devices, room_ID_nz) {
	var Output = new Array (), i = 0;
	Output['html'] = "";
	Output['js']  = "";	// oder über eine JSON definition möglich

	for(i = 0; i < Devices.length; i++) {
		if($.inArray("nicht zugeordnet", Devices[i].rooms) > -1) {				
			Output['html'] = Output['html'] + "<div id=\"" + Devices[i].Name + "_" + room_ID_nz + '" class="room_device" draggable="true" ondragstart="room_drag(event)" ondragend="room_dragend(event)" style="left: 10px">'; 
			Output['html'] = Output['html'] + $("#" + Devices[i].Name + "_" + room_ID_nz).html();
			// alert (Devices[i].Name + "_" + room_ID_nz); // Stimmt überein
			//alert("HTML in Device_HTML (WTF?): "+$("#" + Devices[i].Name + "_" + room_ID_nz).html());
			Output['html'] = Output['html'] + "</div>";			
			
			// wenn aktor und Webcmd == "" ist es eine einfache Klick interaktion
			if((Devices[i].sensor_or_aktor == 'aktor') && (Devices[i].webCmd == '')) {
				Output['js'] = Output['js'] + '$( ".' + Devices[i].Name + '_img").last().click(' + Devices[i].type + '_Devices[' + i + '].Command_on_off);';
			} else if((Devices[i].sensor_or_aktor == 'aktor') && (Devices[i].webCmd == 'dim')) {
				Output['js'] = Output['js'] + slider_aufbau(i);
			}
		}
	}
	
	
	/* Hier müsste man wohl noch die Javascript Events wieder neu anhängen? */
	/* kann natürlich erst angehangen werden, wenn HTML sichtbar*/
	
	/* clone(true); withDataAndEvents == true wäre eine einfache Variante, nur nicht genau klar, wie er die DAten dann handlet */
	
	// Zusammenbauen 
	// Ausführung dann wohl mit eval() 
	return Output;
}

function Device_render_room_line(HTML , Type) {
	if(HTML !== ' ') {
		if(Room_Line_frist === 0) {
			$("#scroll_div").append('<div id="' + Type + '" class="Right_menue_room" style="margin-top: 6px;">' + Type + '</div>');
			Room_Line_frist++;
		} else {
			$("#scroll_div").append('<div id="' + Type + '" class="Right_menue_room">' + Type + '</div>');
		}
		$("#scroll_div").append(HTML);
	}
}

$().ready(function() {

	


	$("#User_control").click(function() { 
		// alle Räume ausblenden 
		var i = 0;
		
		/* CONTROLLER */
		for(i = 0; i < Rooms.length; i++) {
			Rooms[i].Room_Div.css('display','none');			
		}
		if( $("#Room_plus").length !== 0) {
			$("#Room_plus").remove();
			$(".room_minus").remove();			
			$("#Device_unmapped").remove();
			Breite_verringern = 0;
		}
		
		/* VIEW */
		if($("#User_control_panel").length < 1) {
			$("body").append('<div id="User_control_panel">\
			<div id="Registrierung" class="Reiter" style="z-index:5;"> \
			Registrierung\
			</div>	\
			<div id="pw_change" class="Reiter" style="left:110px;width: 120px; z-index:4;"> \
			Passwort ändern\
			</div>	\
			<div id="email_change" class="Reiter" style="left: 243px;width: 100px;z-index:3;"> \
			E-mail ändern\
			</div>	\
			<div id="user_overview" class="Reiter" style="left:359px;width: 116px;z-index:2;"> \
			Nutzerübersicht\
			</div>	\
			<div id="user_delete" class="Reiter" style="left:490px;width: 100px;z-index:1;"> \
			Nutzer löschen\
			</div>	\
			<div id="user_body" class="user_body">	\
			</div>\
			</div>');
		 //else {
//			$("#User_control_panel").css('display','block');
//			$("#User_control_panel").fadeIn("slow", function() {});
//		}		
			
			$('#User_control_panel .Reiter').each(function( index ) {
				$( this ).click(function() {
					var ID = $(this).attr("id");
					var Foromular_name = '', input_class = '';
	//				alert('hier');
					$('.user_body').empty();
	//				$('#User_control_panel .Reiter').css("z-index", 1);
					$('#Registrierung').css("z-index", 5);
					$('#pw_change').css("z-index", 4);
					$('#email_change').css("z-index", 3);
					$('#user_overview').css("z-index", 2);
					$('#user_delete').css("z-index",1);
					$(this).css("z-index", 21);
					if(ID === "Registrierung") {
					$(".user_body").append('\
						<form action=' + self.location + ' method="post" id="Reg_form" name="Reg_form" > \
						<table class="Tabellen" border="0" cellspacing="2" cellpadding="2">\
							<tbody>\
								<tr>\
									<td>\
										Nutzername:\
									</td>\
									<td>\
										<input type="text" id="Reg_user_name" class="Left_Login_Feld input_reg" name="user_name"  />\
									</td>\
								<td> Administrator\
								</td>\
								<td> <input type="checkbox" id="Reg_user_role" name="admincheckbox" value="Admin" class="Left_Login_Feld input_reg admin_box" />\
								</td> \
								</tr>\
								<tr>\
									<td>\
										E-mail:\
									</td>\
									<td>\
										<input type="email" id="Reg_user_email" class="Left_Login_Feld input_reg" name="user_email"  />\
									</td>\
								<tr>\
								<tr>\
									<td>\
										Passwort:\
									</td>\
									<td>\
										<input type="password" id="Reg_user_password" class="Left_Login_Feld input_reg" name="user_password"  />\
									</td>\
								<tr>\
								<tr>\
									<td>\
										bestätigen:\
									</td>\
									<td>\
										<input type="password" id="Reg_user_password2" class="Left_Login_Feld input_reg" name="user_password2"  />\
									</td>\
								<tr>      \
							</tbody>\
						</table>\
						</from>');	
						$(".user_body").append("<div class='error'> Mit Enter nach PW-Bestätigung Nutzer anlegen.</div>");
						// Event anhängen, eigentlich ja als AJAX aufruf und nicht als Formular? weil da landet man ja auf der hauptseite -.-
						$(".input_reg").each(function(index) {
							$(this).keypress(function(event) {
								if (event.which == 13) {
									event.preventDefault();
									
									$('.error').remove(); // Alte Fehlermeldung entfernen
									
									var $form = $("#Reg_form");
									var name = $form.find("input[name='user_name']").val();
									var email = $form.find("input[name='user_email']").val();
									var pw = $form.find("input[name='user_password']").val();
									var pwrepeat = $form.find("input[name='user_password2']").val();
									var role="User"; // Default
																		
									if ($('#Reg_user_role').is(':checked')) {
										//$(".user_body").append("<div class='error'>Administrator angekreuzt</div>");
										role="Administrator";
									}
									else {
										//$(".user_body").append("<div class='error'>Administrator nicht angekreuzt</div>");
										role="User";
									}
									
									
									
									var action="register";
									
									if (name === "" || email === "" || pw === "" || pwrepeat === "" ) {
										$(".user_body").append("<div class='error'>Es wurden nicht alle Felder ausgefüllt!</div>");
										//alert ("Es wurden nicht alle Felder ausgefüllt!");
									
									}
									else if (pw!=pwrepeat) {
										$(".user_body").append("<div class='error'>Eingegebene Passwörter müssen übereinstimmen!</div>");
										//alert("Eingegbene Passwörter müssen übereinstimmen!");
									}
									else {
									
									$.post("user_control.php", { uc_action: action, uc_name: name, uc_email: email, uc_pw: pw, uc_pwrepeat: pwrepeat, uc_role: role } , function(data) {
										if (data.length >0) {
											$(".user_body").append(data);										
										}
									
									
									});
									
																	
									}
									
									
									
									
									
									//$("#Reg_form").submit();
								}
							});
						});						
					} else if(ID === "pw_change") {
						$(".user_body").append('\
							<form action=' + self.location + ' method="post" id="pw_change_form" name="pw_change_form" > \
							<table class="Tabellen" border="0" cellspacing="2" cellpadding="2">\
								<tbody>\
									<tr>\
										<td>\
											Nutzername:\
										</td>\
										<td>\
											<input type="text" id="PW_user_name" class="Left_Login_Feld input_reg" name="user_name" />\
										</td>\
									</tr>\
									<tr>\
										<td>\
											altes Passwort:\
										</td>\
										<td>\
											<input type="password" id="PW_user_password_old" class="Left_Login_Feld input_reg" name="user_password_old" />\
										</td>\
									<tr>\
									<tr>\
										<td>\
											neues Passwort:\
										</td>\
										<td>\
											<input type="password" id="PW_user_password_new" class="Left_Login_Feld input_reg" name="user_password_new" />\
										</td>\
									<tr>\
									<tr>\
										<td>\
											bestätigen:\
										</td>\
										<td>\
											<input type="password" id="PW_user_password_new2" class="Left_Login_Feld input_reg" name="user_password_new2" />\
										</td>\
									<tr>      \
								</tbody>\
							</table>\
							</from>');
							$(".user_body").append("<div class='error'>Mit Enter nach PW-Bestätigung PW ändern.</div>");
							// Event anhängen, eigentlich ja als AJAX aufruf und nicht als Formular? weil da landet man ja auf der hauptseite -.-
							$(".input_reg").each(function(index) {
								$(this).keypress(function(event) {
									if (event.which == 13) {
										event.preventDefault();
										
										
										$('.error').remove(); // Alte Fehlermeldung entfernen
									
									var $form = $("#pw_change_form");
									
									var name = $form.find("input[name='user_name']").val();
									var pwold = $form.find("input[name='user_password_old']").val();
									var pw = $form.find("input[name='user_password_new']").val();
									var pwrepeat = $form.find("input[name='user_password_new2']").val();
									var action="pwchange";
									
									if (name === "" || pwold === "" || pw === "" || pwrepeat === "" ) {
										$(".user_body").append("<div class='error'>Es wurden nicht alle Felder ausgefüllt!</div>");
										//alert ("Es wurden nicht alle Felder ausgefüllt!");
									
									}
									else if (pw!=pwrepeat) {
										$(".user_body").append("<div class='error'>Eingegebene Passwörter müssen übereinstimmen!</div>");
										//alert("Eingegbene Passwörter müssen übereinstimmen!");
									}
									else {
									
									$.post("user_control.php", { uc_action: action, uc_name: name, uc_pwold: pwold, uc_pw: pw, uc_pwrepeat: pwrepeat } , function(data) {
										if (data.length >0) {
											$(".user_body").append(data);										
										}
									
									
									});
									
																	
									}
										
										
										
										
										
										//$("#pw_change_form").submit();
									}
								});
							});	
					} else if(ID === "email_change") {
						$(".user_body").append('\
							<form action=' + self.location + ' method="post" id="email_change_form" name="email_change_form" > \
							<table class="Tabellen" border="0" cellspacing="2" cellpadding="2">\
								<tbody>\
									<tr>\
										<td>\
											Nutzername:\
										</td>\
										<td>\
											<input type="text" id="email_user_name" class="Left_Login_Feld input_reg" name="user_name" />\
										</td>\
									</tr>\
									<tr>\
										<td>\
											neue Mailadresse:\
										</td>\
										<td>\
											<input type="text" id="email_user_email_new" class="Left_Login_Feld input_reg" name="user_email_new" />\
										</td>\
									<tr>\
									<tr>\
									<tr>\
								</tbody>\
							</table>\
							</from>');
						$(".user_body").append("<div class='error'> Mit Enter nach neuer Mail die Mailadresse ändern.</div>");							
							// Event anhängen, eigentlich ja als AJAX aufruf und nicht als Formular? weil da landet man ja auf der hauptseite -.-
							$(".input_reg").each(function(index) {
								$(this).keypress(function(event) {
									if (event.which == 13) {
										event.preventDefault();
										
											$('.error').remove(); // Alte Fehlermeldung entfernen
									
									var $form = $("#email_change_form");
									
									var name = $form.find("input[name='user_name']").val();
									var emailnew = $form.find("input[name='user_email_new']").val();
									var action="mailchange";
									
									if (name === "" || emailnew === "" ) {
										$(".user_body").append("<div class='error'>Es wurden nicht alle Felder ausgefüllt!</div>");
										//alert ("Es wurden nicht alle Felder ausgefüllt!");
									
									}
									else {
									
									$.post("user_control.php", { uc_action: action, uc_name: name, uc_email: emailnew } , function(data) {
										if (data.length >0) {
											$(".user_body").append(data);										
										}
									
									
									});
									
																	
									}
										
										
										
										
										
										
										
										//$("#email_change_form").submit();
									}
								});
							});			
					} else if(ID === "user_overview") {
						var action="overview";
						$.post("user_control.php", { uc_action: action} , function(data) {
							if (data.length >0) {
								$(".user_body").append(data);										
							}
						});																														
					} else if(ID === "user_delete") {
						$(".user_body").append('\
							<form action=' + self.location + ' method="post" id="user_delete_form" name="user_delete_form" > \
							<table class="Tabellen" border="0" cellspacing="2" cellpadding="2">\
								<tbody>\
									<tr>\
										<td>\
											Nutzername:\
										</td>\
										<td>\
											<input type="text" id="delete_user_name" class="Left_Login_Feld input_reg" name="user_name"  />\
										</td>\
									</tr>\
									<tr>\
									<td>\
										Passwort:\
									</td>\
									<td>\
										<input type="password" id="delete_user_password" class="Left_Login_Feld input_reg" name="user_password"  />\
									</td>\
								<tr>\
								<tr>\
									<td>\
										bestätigen:\
									</td>\
									<td>\
										<input type="password" id="delete_user_password2" class="Left_Login_Feld input_reg" name="user_password2"  />\
									</td>\
								<tr>      \
									<tr>\
									<tr>\
								</tbody>\
							</table>\
							</from>');
							$(".user_body").append("<div class='error'> Mit Enter nach neuer Mail den Nutzer löschen.</div>");							
							// Event anhängen, eigentlich ja als AJAX aufruf und nicht als Formular? weil da landet man ja auf der hauptseite -.-
							$(".input_reg").each(function(index) {
								$(this).keypress(function(event) {
									if (event.which == 13) {
										event.preventDefault();
										
											$('.error').remove(); // Alte Fehlermeldung entfernen
									
									var $form = $("#user_delete_form");
									
									var name = $form.find("input[name='user_name']").val();
									var pw = $form.find("input[name='user_password']").val();
									var pwrepeat = $form.find("input[name='user_password2']").val();
									var action="delete";
									
									if (name === "" || pw === "" || pwrepeat === "" ) {
										$(".user_body").append("<div class='error'> Es wurden nicht alle Felder ausgefüllt!</div>");
										
									
									}
									else if (pw!=pwrepeat) {
										$(".user_body").append("<div class='error'> Eingegebene Passwörter müssen übereinstimmen!</div>");
									
									}
									else {
									
										$.post("user_control.php", { uc_action: action, uc_name: name, uc_pw: pw, uc_pwrepeat: pwrepeat } , function(data) {
											if (data.length >0) {
												$(".user_body").append(data);										
											}
										});
									//$("#email_change_form").submit();
									}
								}
							});
						});
					} 
				});			
			});
		}
		$("#User_control_panel").fadeIn("slow", function() {});
		
		$("#Registrierung").trigger("click");		
	}); 

	//starte_Drag_Drop();
	
	$("#Device_mapping").click(function() { 
	
		if( $("#User_control_panel").length !== 0 ) {
			$("#User_control_panel").css('display','none');
		}
	
		if(Breite_verringern === 0) {
			var Breite = $( window ).width();
			var i = 0, slim_height = 0;
			
			// eigentlich die Parameter bei dem Randerin ändern 
			// und die Leiste einfügen, wenn die Räume noch vorhanden sind.
			// wenn nicht müssen die Räume neu geladen werden.
			Breite_verringern = 160;	// Für "nicht zugeordnet"-Raum Platz einbauen					
			
			Room_renderer(Breite); 
			
			// Breite kann sich veraendert haben
			Breite = $( window ).width()
			// Leiste einfügen und Geräte anzeigen...
	//		$("body").append('<div id="Device_unmapped"><div class="Left_menu_Titel Menue_einzeln" style="margin-bottom: -5px;" >nicht zugeordnet</div></div>');
						
			// Hier muessen die nicht zugeordneten Geraete eingesetzt werden
			var FS20_HTML = ' ', FHT_HTML = ' ', HM_HTML = ' ', k = 0, first = 0;
			for(k = 0; k < Rooms.length; k++) {
				if(Rooms[k].Name === "nicht zugeordnet") {
					room_ID_nz = Rooms[k].ID;
				}
			}
			
			
			Device_mapping_generieren();
			
			
			
			
			
			Room_Line_frist = 0;
			
//			$("#Device_unmapped").fadeIn("slow", starte_Drag_Drop);
//			$("#Device_unmapped").fadeIn("slow");
			
			$("#Device_unmapped").fadeIn("slow", function() {
				$("#slimScrollDiv").on("drop", room_drop);
				$("#scroll_div").on('drop', room_drop);
				
				$("#slimScrollDiv").on("drop", function(e) {
					alert("hier");
				});
				$("#scroll_div").on('drop', function(e) {
					alert("hier");
				});			
				//$("#scroll_div").attr()
			});
			

			
/*			Mögliche alternative Touchlösunge... Die das Problem aber nicht beheben
			var obj = document.getElementById('ku_Lampe1_room3');
			obj.addEventListener('touchstart', function(event) {
				alert('test');
			  // If there's exactly one finger inside this element
			  if (event.targetTouches.length == 1) {
				var touch = event.targetTouches[0];
				// Place element where the finger is
				obj.style.left = touch.pageX + 'px';
				obj.style.top = touch.pageY + 'px';
			  }
				room_drag(event);			  
			}, false);
			
			var obj = document.getElementById('ku_Lampe1_room3');
			obj.addEventListener('touchstart', function(event) { 
				check=0;
				var touch = event.touches[0];
				start.x = event.touches[0].pageX;
				start.y = event.touches[0].pageY;
			 }, false);   

			var check =0;
			// prevent scroll and zoom  
			obj.addEventListener('touchmove', function(event) {
//				alert('test');
				event.preventDefault(); // fix site
				var Pleft = parseInt(getElementById("ku_Lampe1_room3").style.left);
				var Ptop = parseInt(getElementById("ku_Lampe1_room3").style.top);
				var touch = event.touches[0];
				var offset = {};
				offset.x = start.x - event.touches[0].pageX;
				offset.y = start.y - event.touches[0].pageY;
				if (check==0 && touch.pageX >  Pleft && touch.pageX < Pleft+350 && touch.pageY > Ptop && touch.pageY <Ptop + 250) {
				 // set 
				 document.getElementById("ku_Lampe1_room3").style.left = Pleft - (offset.x/9) + "px";
				 document.getElementById("ku_Lampe1_room3").style.top = Ptop - (offset.y/9)  + "px";
				} else {
				check =1;
				}
			 }, false);  
*/			 
		}
		// die nicht zugeordneten Geräte müssen verschwinden
		
/*		$.post('Device_mapping.php', 
			{
				BF: Befehl
			}, 
			function(data){
				
				// Hier muss das in den Container gehängt werden...
				
				
			}
		);*/
	});	
	
	$("#fhem_expert").click(function() { 
		// Ausklappen der Erweiterungspfeile
		if($('.attr_klapp').css('display') === 'none') {
//			$('.attr_klapp').css('display','block');
			$('.attr_klapp').fadeIn("slow",function(){});
		} else {
//			$('.attr_klapp').css('display','none');
			$('.attr_klapp').fadeOut("slow",function(){});
		}
		// Alias in richtige namen ändern
		if(fhem_expert_aktive === 0) {
			$('.room_device').each(function( index ) {
				Device_name = $(this).attr("id").substring(0, $(this).attr("id").lastIndexOf("_"));
				$('#' + Device_name + '_name').empty();
				$('#' + Device_name + '_name').html(Device_name); 
			});
			fhem_expert_aktive = 1;
				
			if($( "#Kommandozeile_input" ).css("display") === "none" ) {
				$("#Kommandozeile").trigger("click");
			}
		} else {
			$('.room_device').each(function( index ) {
				Device_name = $(this).attr("id").substring(0, $(this).attr("id").lastIndexOf("_"));
				if(All_Devices[Device_name].Alias !== "") {
					$('#' + Device_name + '_name').empty();				
					$('#' + Device_name + '_name').html(All_Devices[Device_name].Alias); 
				}
			});
			fhem_expert_aktive = 0;
			
			if($( "#Kommandozeile_input" ).css("display") === "inline-block" ) {
				$("#Kommandozeile").trigger("click");
			}
		}				
	});
	
	$('.attr_klapp').click(function() { 
		// Raum rausbekommen
		var current_Room_ID = "", Room_Device_id = "", i = 0, k = 0, Device_name = "";
		Room_Device_id = $(this).offsetParent()[0].id;
		current_Room_ID = Room_Device_id.substring(Room_Device_id.lastIndexOf("_") + 1, Room_Device_id.length);
		Device_name = Room_Device_id.substring(0, Room_Device_id.lastIndexOf("_"));
		
		// Geraete position ermitteln, ueber das hangeln mit Child()?
		All_Room_devices = $(this).offsetParent().offsetParent().children();
		// Gibt es Sensoren in diesem Raum? --> besser ist das ein Sensor?
		

		
		if($('#' + Room_Device_id).css("width").replace(/px/g, "") < 180) {		

			for(i = 0; i < All_Room_devices.length; i++) {
				if(All_Room_devices[i].id == Room_Device_id)				
					break;
			}
			for(k = 0; k < Rooms.length; k++) {						
				if( Rooms[k].ID === current_Room_ID ) {		
					if(All_Devices[Device_name].sensor_or_aktor == "aktor") {
						Rooms[k].Anzahl_Aktoren = Rooms[k].Anzahl_Aktoren + 5;	
					} else {
						Rooms[k].Anzahl_Sensoren = Rooms[k].Anzahl_Sensoren + 5;	
					}
					break;				
				}
			}	
			if((i % 2) === 1) {		// 1 weil es bei 0 anfaengt zu zaehlen 
				if(All_Devices[Device_name].sensor_or_aktor == "aktor") {
					Rooms[k].Anzahl_Aktoren++; // bei gerader Anzahl anzahl um eins mehr erhoehen
				} else {
					Rooms[k].Anzahl_Sensoren++;
				}
			} 
			
			var Breite = $( window ).width();
			Room_renderer(Breite);		
			
			$('#' + Room_Device_id).animate({ "width": "+=193px" }, "slow", function() {
				$(this).animate({ "height": "+=154px" }, "slow", function() {		// 15 + 60 + 2 (rand) = 77px
				
							
				});
	//			$( "#Top_arrow_img" ).attr("src", "img/arrow_3_up.png");
			});
			
			$('#' + Device_name + '_attr_klapp').animate({ "left": "+=193px" }, "slow", function() {
				$(this).animate({ "top": "+=154px" }, "slow", function() {		
					var Room_Device_id = "", Device_name = "", append_HTML = "", i = 0;
					Room_Device_id = $(this).offsetParent()[0].id;
					Device_name = Room_Device_id.substring(0, Room_Device_id.lastIndexOf("_"));
					
					$('#' + Room_Device_id).append('<div id="' + Device_name + '_attrs" class="attrs_div"></div>');
					$('#' + Room_Device_id).append('<div id="' + Device_name + '_attrs_hilf" class="attrs_div_hilf"></div>');
					
					// Attribute einfuegen 
//					if(All_Devices[Device_name].Grundattr.length > 0) {
					$('#' + Device_name + '_attrs').append('<div id="' + Device_name + '_Grundattr" class="attr_reiter" style="">Grundattribute</div>');
					$('#' + Device_name + '_attrs').append('<div id="' + Device_name + '_Readings" class="attr_reiter" style="left: 92px;">Readings</div>');
					$('#' + Device_name + '_attrs').append('<div id="' + Device_name + '_Attr" class="attr_reiter" style="left: 152px;">Zusatzattribute</div>');
					$('#' + Device_name + '_attrs').append('<div id="' + Device_name + '_Attr_scroll_div" class="attr_div"></div>');
					$('#' + Device_name + '_Attr_scroll_div').append('<div id="' + Device_name + '_Attr_div"></div>');
					
					Wechsel_function = function () {	
						var ID = $(this).attr("id"), append_HTML = "", i = 0, count=0;
						current_reiter = ID.substring(ID.lastIndexOf("_") + 1, ID.length);
						Device_name = ID.substring(0, Room_Device_id.lastIndexOf("_"));
						
						if($('#' + Device_name + '_Attr_div').offsetParent()[0].id === "" ) {
							$('#' + Device_name + '_Attr_div').offsetParent().remove();
							$('#' + Device_name + '_Attr_scroll_div').append('<div id="' + Device_name + '_Attr_div"></div>');
						} else {
							$('#' + Device_name + '_Attr_div').empty();
						}


												
		//				$('#User_control_panel .Reiter').css("z-index", 1);
						$('#' + Device_name + '_Grundattr').css("z-index", 5);
						$('#' + Device_name + '_Readings').css("z-index", 4);
						$('#' + Device_name + '_Attr').css("z-index", 3);
						$(this).css("z-index", 21);
						if(current_reiter === "Grundattr") {	
							shown_attr = All_Devices[Device_name].Grundattr;
						} else if(current_reiter === "Readings") {
							shown_attr = All_Devices[Device_name].Readings;
						} else {
							shown_attr = All_Devices[Device_name].Attr;
						}
						append_HTML = append_HTML + '<table cellspacing="2" cellpannding="2" rules="none" style=" \
								min-width: 250px; \
							"><tbody>';
						for(var index in shown_attr) { 
							count++;
						}
						if( count > 0 ) {
							for(var index in shown_attr) { 
								if((i % 2) === 1) {
									append_HTML = append_HTML + '<tr style="background-color: #697389;">';
								} else {
									append_HTML = append_HTML + '<tr style="background-color: #0A1C42;">';
								}

								append_HTML = append_HTML + '<td style="padding-left: 5px;">' + index + '</td>';	
								if(i === 0) {
									append_HTML = append_HTML + '<td style="border-top-right-radius: 5px;-webkit-border-radius: 0px 5px 0px 0px;-moz-border-radius: 0px 5px 0px 0px;">' + shown_attr[index] + '</td>';
								} else {							
									append_HTML = append_HTML + '<td>' + shown_attr[index] + '</td>';	
								}							
								append_HTML = append_HTML + '</tr>';		
								i++;							
							}												
						} else {
							append_HTML = append_HTML + '<tr style="background-color: #0A1C42;"><td style="padding-left: 5px;border-top-right-radius: 5px;-webkit-border-radius: 0px 5px 0px 0px;-moz-border-radius: 0px 5px 0px 0px;">Keine Attribute vorhanden!</td></tr>';
						}
						$('#' + Device_name + '_Attr_div').append(append_HTML + '</tbody></table>');
						
						if( $('#' + Device_name + '_Attr_div').css('height').replace(/px/g, "") > 112) {
							// scrolling 
							$('#' + Device_name + '_Attr_div').slimScroll({
								color: '#747f96',
								railVisible: true,
								railColor: '#222',
								railOpacity: 0.5,
								height: '112px'
							});		
						}
					}
					
					$('#' + Device_name + '_Grundattr').click(Wechsel_function);
					$('#' + Device_name + '_Readings').click(Wechsel_function);
					$('#' + Device_name + '_Attr').click(Wechsel_function);
					
					$('#' + Device_name + '_Grundattr').trigger("click");
					
					// scrolling 
/*					$('#' + Device_name + '_attrs').slimScroll({
						color: '#747f96',
						railVisible: true,
						railColor: '#222',
				//			distance: '20px',
						railOpacity: 0.5,
						width: '180px',
						height: '150px'
					});		
*/					
					// Umdrehen des Pfeils 
					//$('#' + Device_name + '_attr_klapp').children().first().attr("src", "img/arrow_3_up_attr2.png");
					$('#' + Device_name + '_attr_klapp').children().first()[0].src = "img/arrow_3_up_attr2.png";
				});
			});		
			
			
		} else {
			// wieder einfahren und Anzahl aktoren zurücksetzen
			
			
			$('#' + Room_Device_id).animate({ "height": "-=154px" }, "slow", function() {
				$(this).animate({ "width": "-=193px" }, "slow", function() {		// 15 + 60 + 2 (rand) = 77px					
				});
	//			$( "#Top_arrow_img" ).attr("src", "img/arrow_3_up.png");
			});
			
			$('#' + Device_name + '_attr_klapp').animate({ "top": "-=154px" }, "slow", function() {
				$(this).animate({ "left": "-=193px" }, "slow", function() {	
					var Room_Device_id = "", Device_name = "";
					Room_Device_id = $(this).offsetParent()[0].id;
					Device_name = Room_Device_id.substring(0, Room_Device_id.lastIndexOf("_"));
				
					$('#' + Device_name + '_attrs').remove();
					$('#' + Device_name + '_attrs_hilf').remove();	
					
					for(i = 0; i < All_Room_devices.length; i++) {
						if(All_Room_devices[i].id == Room_Device_id)				
							break;
					}
					for(k = 0; k < Rooms.length; k++) {						
						if( Rooms[k].ID === current_Room_ID ) {		
							if(All_Devices[Device_name].sensor_or_aktor == "aktor") {
								Rooms[k].Anzahl_Aktoren = Rooms[k].Anzahl_Aktoren - 5;	
							} else {
								Rooms[k].Anzahl_Sensoren = Rooms[k].Anzahl_Sensoren - 5;	
							}
							break;				
						}
					}	
					if((i % 2) === 1) {		// 1 weil es bei 0 anfaengt zu zaehlen 
						if(All_Devices[Device_name].sensor_or_aktor == "aktor") {
							Rooms[k].Anzahl_Aktoren--; // bei gerader Anzahl anzahl um eins mehr erhoehen
						} else {
							Rooms[k].Anzahl_Sensoren--;
						}
					} 
					
					var Breite = $( window ).width();
					Room_renderer(Breite);	
					$('#' + Device_name + '_attr_klapp').children().first()[0].src = "img/arrow_3_down_attr2.png";
				});
			});						
		}				
	});	
	
	$( window ).scroll(function() {
//		$( "#log" ).append( "<div>Handler for .scroll() called.</div>" );
		// top: 100px;
		Scrollposi = $(window).scrollTop();
		
		if(Scrollposi > 100) {
			if ($( "#Device_unmapped" ).css("display") !== "none" ) {
				$("#Device_unmapped").css("top", Scrollposi +"px" );	
			}
		}
	});
	
	$( window ).resize(function() {
		if ($( "#Device_unmapped" ).css("display") !== "none" ) {		
			var Breite = $( window ).width(), Hoehe = $( window ).height(), slim_height = 0;
			$("#Device_unmapped").css("left", (Breite - 200 - 2) +"px" );						
			
/*			Zerreißt das Scrolling -.- ... muesste man noch mehr aufwand betreiben 
			Hoehe = Hoehe - 100;
			if( Hoehe > 820) {
				$("#Device_unmapped").css("height", (800) +"px" );
				slim_height = '790px';
			} else if(Hoehe > 420) {
				$("#Device_unmapped").css("height", (Hoehe - 20) +"px" );
				slim_height = (Hoehe - 20 - 10) + 'px';
			} else {
				$("#Device_unmapped").css("height", "400px" );
				slim_height = '390px';
			}	

			$('#scroll_div').slimScroll({
				color: '#747f96',
				railVisible: true,
				railColor: '#222',
	//			distance: '20px',
				railOpacity: 0.5,
				height: slim_height
			});
*/			
		}					
	});
	
});