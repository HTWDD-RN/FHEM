// aus Bildpfad wird ermittelt ob on oder off gesendet werden muss
/* Objekt Elemente */

var fhemsave='false'; // global für Entwicklung, im Realbetrieb auf true setzen

var JSEVENTS=''; // Events die nachträglich drangehangen werden müssen
var All_Devices = {};
var FS20_Devices = [];
var FHT_Devices = [];
var HM_Devices = [];
var WSN_Devices = [];
var Devices_dim = [];
var FS20_Rollo_models = ["fs20ms2", "fs20rst", "fs20rsu"];
var Rooms = [];
var Rooms_to_render = [];
var Rooms_pro_Zeile_alt = -1;
var Zeilen_anzahl_alt = -1;
var Breite_verringern = 0;
var Dim_Zustaende = ["off","dim06%","dim12%","dim18%","dim25%","dim31%","dim37%","dim43%","dim50%","dim56%","dim62%","dim68%","dim75%","dim81%","dim87%","dim93%","on","dim100%"];
var Dim_Cache = {Name: '', NR: ''};

/*
// ROOM NEW START
	function addroom(ev) {
	var Breite = $( window ).width();
	alert("Geklickt!");
	//Rooms.push(new Room(("room6", "neuerraum", 3,2)));
	//$("#Wrap_inhalt").append("<div id=\"room6\" class=\"room\"><div class=\"titel_room\" id=\"titel_room6\"><div class=\"titel_align\">alias</div></div><div class=\"content_room\" id=\"room6_content\"><div class=\"room_device\" id=\"ku_Lampe1_room5\" draggable=\"true\" ondragstart=\"room_drag(event)\" ondragend=\"room_dragend(event)\"></div></div>");	
	//Room_renderer(Breite);	

	}


// ROOM NEW END
*/

function Room(pID, pName, pAnzahl_Aktoren, Anzahl_Sensoren) {
	this.ID = pID;
	this.Name  = pName;
	this.Anzahl_Aktoren = pAnzahl_Aktoren;
	this.Anzahl_Sensoren = Anzahl_Sensoren;	
	this.Room_Div = 0;
	this.Room_content_Div = 0;
}

function Room_renderer(Breite, Start) {

	var Rooms_pro_Zeile = 0, i = 0, Content_Div_height = 0, Raum_nr = 0;
	var Content_heights = [];
	Rooms_to_render = [];	// welche der Vorhanden Raeume sollen gerendert werden
	
	if(typeof Start === 'undefined') {
		for(i = 0; i < Rooms.length; i++) {	
			$("#" + Rooms[i].ID).css("display", "block" );
		}
	}
	
	for(i = 0; i < Rooms.length; i++) {		
		Rooms[i].Room_Div = $("#" + Rooms[i].ID);
		Rooms[i].Room_content_Div = $("#" + Rooms[i].ID + "_content");
	}
	
	for(i = 0; i < Rooms.length; i++) {
		if( (Rooms[i].Name == 'nicht zugeordnet') && (Breite_verringern > 0)) {
			Breite = Breite - Breite_verringern;
			$("#" + Rooms[i].ID).css("display", "none" );
			continue;
		}
		Rooms_to_render.push(Rooms[i]);
	}
		
	Rooms_pro_Zeile = Math.floor((Breite - 60) / (400 + 6 + 38));			//	Anzahl der Spalten bestimmen
	Zeilen_anzahl = Math.ceil(Rooms_to_render.length / Rooms_pro_Zeile);	//	Anzahl der Zeilen bestimmen
	
	if($( "#Kommandozeile_input" ).css("display") === "none" ) {
		Abstand_zum_Bild_Rand = 38;
	} else {
		Abstand_zum_Bild_Rand = 58;
	}
	Abstand_zwischen_Kacheln_Top = 43;
	Abstand_zwischen_Kacheln_left = 38 + 0; 
	Device_Hoehe_Abstand_Rand = 60 + 15 + 2; 
	Kachel_Breite = 400;
	Sensor_Trinstrich_Abstand = 3 + 6;
	Raumnamen_Hoehe_Rand = 40 + 6;
	Unterer_Kachel_Rand = 3;
	Farbverlaufs_Faktor = 1.1;
	left_minus_position = 370;
	top_minus_position = 20;
	
	if((Rooms_pro_Zeile_alt != Rooms_pro_Zeile) || (Zeilen_anzahl_alt != Zeilen_anzahl)) {
	// zur Entlastung koennte man pruefen ob ein neu-rendern ueberhaupt von noeten ist
		for( k = 0; k < Zeilen_anzahl; k++) {
		
			for( i = 0; (i < Rooms_pro_Zeile) && (Raum_nr < (Rooms_to_render.length-1)); i++) {			
				Raum_nr = i + (k * Rooms_pro_Zeile);
				
				Rooms_to_render[Raum_nr].Room_Div.css("left", ((Kachel_Breite + Abstand_zwischen_Kacheln_left) * i) + "px");
				if( Breite_verringern > 0) {
					if( $("#" + Rooms_to_render[Raum_nr].ID + "_minus").length === 0) {
						$("#Wrap_inhalt").append('<div id="' + Rooms_to_render[Raum_nr].ID + '_minus" class="room_minus" onClick="delete_room(this.id, event)"><div class="room_text_minus">-</div></div>');
					}
					$("#" + Rooms_to_render[Raum_nr].ID + "_minus").css("left", ((Kachel_Breite + Abstand_zwischen_Kacheln_left) * i) + left_minus_position + "px");
				}
				
				if( k == 0) {
					Rooms_to_render[Raum_nr].Room_Div.css("top", Abstand_zum_Bild_Rand + "px");
					if( Breite_verringern > 0) {
						$("#" + Rooms_to_render[Raum_nr].ID + "_minus").css("top", Abstand_zum_Bild_Rand + top_minus_position + "px");
					}
				} else {	
					Rooms_to_render[Raum_nr].Room_Div.css("top", Content_heights[i] + Abstand_zwischen_Kacheln_Top + "px");
					if( Breite_verringern > 0) {
						$("#" + Rooms_to_render[Raum_nr].ID + "_minus").css("top", Content_heights[i] + Abstand_zwischen_Kacheln_Top + top_minus_position + "px");
					}
				}
				
				Content_Div_height = Unterer_Kachel_Rand + Device_Hoehe_Abstand_Rand * Math.ceil(Rooms_to_render[Raum_nr].Anzahl_Aktoren / 2);
				if(Rooms_to_render[Raum_nr].Anzahl_Sensoren > 0) {
					Content_Div_height = Content_Div_height + Sensor_Trinstrich_Abstand + Device_Hoehe_Abstand_Rand * Math.ceil(Rooms_to_render[Raum_nr].Anzahl_Sensoren / 2);
				}					
				Rooms_to_render[Raum_nr].Room_content_Div.css("height", Content_Div_height * Farbverlaufs_Faktor + "px");
				Rooms_to_render[Raum_nr].Room_Div.css("height", (Raumnamen_Hoehe_Rand + Content_Div_height * Farbverlaufs_Faktor) + "px");
					
				if( k == 0) {	
					Content_heights[i] = Raumnamen_Hoehe_Rand + Content_Div_height * Farbverlaufs_Faktor + Abstand_zum_Bild_Rand;	
					// Farbverlaufhoehe, die ist ja immer unterschiedlich wtf -.- brauchen wir einen Footer div ^^
				} else {																													
					Content_heights[i] = Raumnamen_Hoehe_Rand + Content_heights[i] + Abstand_zwischen_Kacheln_Top + Content_Div_height * Farbverlaufs_Faktor;
				}
			}
		}
		
		if( Breite_verringern > 0) {
			if( $("#Room_plus").length === 0) {
				$("#Wrap_inhalt").append('<div id="Room_plus" onClick="addroom(event)">+</div>');
			}
			if(i === Rooms_pro_Zeile) {
				i = 0;
			}
			
			if((Rooms_to_render.length / Rooms_pro_Zeile) < 1) { // soll das + noch auf die erste Zeile?
				$("#Room_plus").css("top", Abstand_zum_Bild_Rand + "px");		
			} else {
	//			if(i < Rooms_pro_Zeile) {
					$("#Room_plus").css("top", Content_heights[i] + Abstand_zwischen_Kacheln_Top + "px");
	//			}
			}
			$("#Room_plus").css("left", ((Kachel_Breite + Abstand_zwischen_Kacheln_left) * i) + "px");
		}
		
			
		/*if( i < Rooms_pro_Zeile) {
			Rooms_to_render[Raum_nr].Room_Div.css("left", ((Kachel_Breite + Abstand_zwischen_Kacheln_left) * i) + "px");
			
			
		}
		if( Breite_verringern > 0) {
			if(((Raum_nr + 1) % Rooms_pro_Zeile) === 0) {
				
			} else {
				
			}
		}*/
	}
}


function FS20_Device(pName, pAlias, picon, pmodel, /*room,*/ pwebCmd, pState, pState_types, psensor_or_aktor, pGrundattr, pReadings, pAttr) {

	// Referenz auf das Instanz-Objekt anlegen
    var thisObject = this;

	this.Name  = pName;
	this.Alias = pAlias;
	this.icon = picon;
	this.model = pmodel;
	//this.room= room; // Frank
	this.webCmd = pwebCmd;   
	this.State = pState;
	this.State_types = pState_types;
	this.sensor_or_aktor = psensor_or_aktor;
	this.img_this = undefined;
	this.type = "FS20";
	this.rooms = [];
	this.Grundattr = pGrundattr;
	this.Readings = pReadings;
	this.Attr = pAttr;
	
   
	/* on off Funktionalität mit EventMap Moeglichkeit */
	this.test = function () {
		alert(this.Name);
	};	
	this.down_test = function (new_state, nummer) { //(Device_name,Device_icon,new_state, nummer)
		if(nummer < 3) {
			this.img_this.attr("src", "img/" + this.icon + "_" + new_state + '_' + nummer + ".png");
		} else {
			this.img_this.attr("src", "img/" + this.icon + "_" + new_state + ".png");
		}
    };
	this.Anzeige_on_off_aktualisieren = function ( new_state, new_state_name) {
		var Befehl = "set " + this.Name + " " + new_state;
		this.img_this = $('.' + this.Name + '_img' /*_' + this.room*/);
		//alert(this.img_this);
		
		if($.inArray(this.model, FS20_Rollo_models) > -1) {
			if(new_state_name == "down") {
				setTimeout(function(){thisObject.down_test("down",1)},300);
				setTimeout(function(){thisObject.down_test("down",2)},600);
				setTimeout(function(){thisObject.down_test("down",3)},900);
			} else {
				setTimeout(function(){thisObject.down_test("up",1)},300);
				setTimeout(function(){thisObject.down_test("up",2)},600);
				setTimeout(function(){thisObject.down_test("up",3)},900);
			}
		} else {
			this.img_this.attr("src", "img/" + this.icon + "_" + new_state_name.replace(/%/g, "") + ".png");
		}
		
		$("#" + this.Name + "_Device_state").html("status: " + new_state_name);
		this.State = new_state_name;
		return Befehl;
	};
	this.Command_on_off = function() {
		var Befehl = "";

		if(thisObject.State === thisObject.State_types[0]) {			
			Befehl = thisObject.Anzeige_on_off_aktualisieren("off", thisObject.State_types[1]);
		} else {
			// bei dim dim100% anstatt on	
			if(thisObject.webCmd == 'dim') {
				Befehl = thisObject.Anzeige_on_off_aktualisieren("dim100%", thisObject.State_types[0]);
			} else {
				Befehl = thisObject.Anzeige_on_off_aktualisieren("on", thisObject.State_types[0]);
			}
		}
		
		$.post('FHEM_Anfrage.php', 
			{
				BF: Befehl, SAVE: fhemsave
			}, 
			function(data){
				// Ueberpruefung ob es funktioniert hat oder nicht?
				var div_img;
/*					if(data === "1") {
					// die icons aendern
					div_img = $( this ).attr("offsetParent");
					alert($( this ).attr("id"));
				}	*/
				return;
			}
		);
	};
}

function FHT_Device(pName, pAlias, picon, pmodel, psensor_or_aktor, pGrundattr, pReadings, pAttr) {
	// Referenz auf das Instanz-Objekt anlegen
    var thisObject = this;

	this.Name  = pName;
	this.Alias = pAlias;
	this.icon = picon;
	this.model = pmodel;
	this.rooms = [];
	this.sensor_or_aktor = psensor_or_aktor;
	this.type = "FHT";
	this.Grundattr = pGrundattr;
	this.Readings = pReadings;
	this.Attr = pAttr;

}

function WSN_Device(pName, pAlias, picon, pmodel, pState, pState_types, psensor_or_aktor, pGrundattr, pReadings, pAttr) {
	// Referenz auf das Instanz-Objekt anlegen
    var thisObject = this;

	this.Name  = pName;
	this.Alias = pAlias;
	this.icon = picon;
	this.model = pmodel;
	this.rooms = [];
	this.sensor_or_aktor = psensor_or_aktor;
	this.type = "WSN";
	this.Grundattr = pGrundattr;
	this.Readings = pReadings;
	this.Attr = pAttr;
	
}

// (pName, picon, pmodel, psensor_or_aktor) 
function HM_Device(pName, pAlias, picon, pmodel, /*room,*/ pState, pState_types, psensor_or_aktor, pGrundattr, pReadings, pAttr) {
	// Referenz auf das Instanz-Objekt anlegen
    var thisObject = this;

	this.Name  = pName;
	this.Alias = pAlias;
	this.icon = picon;
	this.model = pmodel;
//	this.webCmd = pwebCmd;   
	this.State = pState;
	this.State_types = pState_types;
	this.rooms = [];
	this.sensor_or_aktor = psensor_or_aktor;
	this.type = "HM";
	this.Grundattr = pGrundattr;
	this.Readings = pReadings;
	this.Attr = pAttr;

	this.Anzeige_on_off_aktualisieren = function ( new_state, new_state_name) {
		var Befehl = "set " + this.Name + " " + new_state;
		this.img_this = $('#' + this.Name + '_img' /*_' + this.room*/);
		//alert(this.img_this);
		
		this.img_this.attr("src", "img/" + this.icon + "_" + new_state_name.replace(/%/g, "") + ".png");
		
		$("#" + this.Name + "_Device_state").html("status: " + new_state_name);
		this.State = new_state_name;
		return Befehl;
	};
	this.Command_on_off = function() {
		var Befehl = "";

		if(thisObject.State === thisObject.State_types[0]) {			
			Befehl = thisObject.Anzeige_on_off_aktualisieren("off", thisObject.State_types[1]);
		} else {
			// bei dim dim100% anstatt on	
			if(thisObject.webCmd == 'dim') {
				Befehl = thisObject.Anzeige_on_off_aktualisieren("dim100%", thisObject.State_types[0]);
			} else {
				Befehl = thisObject.Anzeige_on_off_aktualisieren("on", thisObject.State_types[0]);
			}
		}
		
		$.post('FHEM_Anfrage.php', 
			{
				BF: Befehl, SAVE: fhemsave
			}, 
			function(data){
				// Ueberpruefung ob es funktioniert hat oder nicht?
				var div_img;
/*					if(data === "1") {
					// die icons aendern
					div_img = $( this ).attr("offsetParent");
					alert($( this ).attr("id"));
				}	*/
				return;
			}
		);
	};
}


function Anzeige_dim_aktualisieren(Dim_inhalt, state, Dim_Device, e) {	
	var Dim_name = Dim_Device.Name, i = 0;
	var Befehl = "set " + Dim_name.replace(/#/g, "") + " " + state;
		
	if(e.type === 'slidechange') {
		$.post('FHEM_Anfrage.php', 
			{
				BF: Befehl, SAVE: fhemsave
			}, 
			function(data){
				// Ueberpruefung ob es funktioniert hat oder nicht?
				var div_img;
/*					if(data === "1") {
					// die icons aendern
					div_img = $( this ).attr("offsetParent");
					alert($( this ).attr("id"));
				}	*/
				return;
			}
		);		
	}
	$('#Dim_Inhalt').html(Dim_inhalt);
	$('#' + Dim_name + '_img').attr("src", "img/" + Dim_Device.icon + "_" +  state.replace(/%/g, "") + ".png");	
}


function Command_dim(e, step, Dim_Device) {
	var Dim_Werte = [1,7,13,19,26,32,38,44,51,57,63,69,76,82,88,94,100];
	var i = 0;
	
	if( step < 100) {
		for(i = 1; i < Dim_Werte.length; i++){
			if(step < Dim_Werte[i]) {
				Anzeige_dim_aktualisieren(Dim_Werte[i-1]-1,Dim_Zustaende[i-1],Dim_Device,e);
				break;
			}
		}
	} else {
		Anzeige_dim_aktualisieren(100,"dim100%",Dim_Device,e);
	}
	
}

function Menue_Steuerung(id_arrow_img,id_menu,Richtung,Weiter, arrow_up, arrow_down, arrow_down_hover, arrow_up_hover) {

	$(id_arrow_img).click(function() {
		var Top_menu_wrap = $( id_menu );
	
		if( parseInt(Top_menu_wrap.css( Richtung ).replace(/px/g, "")) < Weiter+1) {			
			Top_menu_wrap.animate({ Richtung : "+=" + Math.abs(Weiter) + "px" }, "slow", function() {
				$( id_arrow_img ).attr("src", arrow_up);
			});
		} else {	
			Top_menu_wrap.animate({ Richtung : "-=" + Math.abs(Weiter) + "px" }, "slow", function() {
				$( id_arrow_img ).attr("src", arrow_down);
			});		
		}
	});
	
	$(id_arrow_img).mouseover(function() {
		var Top_menu_wrap = $( id_menu );
		if( parseInt(Top_menu_wrap.css( Richtung ).replace(/px/g, "")) === Weiter) {			
			$( id_arrow_img ).attr("src", arrow_down_hover);
		} else {					
			$( id_arrow_img ).attr("src", arrow_up_hover);			
		}
	}).mouseout(function() {
		var Top_menu_wrap = $( id_menu );
		if( parseInt(Top_menu_wrap.css( Richtung ).replace(/px/g, "")) === Weiter) {			
			$( id_arrow_img ).attr("src", arrow_down);
		} else if(parseInt(Top_menu_wrap.css( Richtung ).replace(/px/g, "")) === 0){					
			$( id_arrow_img ).attr("src", arrow_up);			
		}
	});
}

function slider_aufbau(i) {
	var Dim_Werte = [0,6,12,18,25,31,37,43,50,56,62,68,75,81,87,93,100,100], k = 0;
	var e = {type: 'nochange'};
	
	$( "." + FS20_Devices[i].Name + "_slider-range-min" ).slider({
		range: "min",
		value: 37,
		min: 0,
		max: 100,					
		change: function( event, ui ) {
			
			if(event.target.offsetParent !== null) {
				var wraper_id = event.target.offsetParent.id.replace(/slider_/g, ""), i = 0;

				if(Dim_Cache.Name !== wraper_id) {
					for(i = 0; i < FS20_Devices.length; i++){
						if(wraper_id === FS20_Devices[i].Name) {
							Dim_Cache.Name = FS20_Devices[i].Name;	
							Dim_Cache.ID = i;									
							break;
						}
					}
				}
				$('#Tool_wrap').remove();
				Command_dim(event,ui.value, FS20_Devices[Dim_Cache.ID]);
			}						
		},
		slide: function( event, ui ) {

			var wraper_id = event.target.offsetParent.id.replace(/slider_/g, "");
			var css_punkt;
			
			if(Dim_Cache.Name !== wraper_id) {
				for(i = 0; i < FS20_Devices.length; i++){
					if(wraper_id === FS20_Devices[i].Name) {
						Dim_Cache.Name = FS20_Devices[i].Name;	
						Dim_Cache.ID = i;									
						break;
					}
				}
			}
								
			if($('#Tool_wrap div').length == 0) {	
				// ToolTip einfuegen			
				$('#slider_' + wraper_id).append('<div id="Tool_wrap"><div id="Dim_Huelle"><span id="Dim_Inhalt"></span></div><div id="Balse_wrap"><div id="Blase"></div></div></div>');							
				// Position vor der Anzeige aendern
				css_punkt = $('#slider_' + wraper_id + ' .ui-slider-handle').css( "left" ).replace(/px/g, "");
				css_punkt = css_punkt - 7;
				$('#Tool_wrap').css("left", css_punkt + 'px');
				$('#Tool_wrap').css("display", "block");
			} else {				
				css_punkt = $('#slider_' + wraper_id + ' .ui-slider-handle').css( "left" ).replace(/px/g, "");			
				css_punkt = css_punkt - 7;
				$('#Tool_wrap').css("left", css_punkt + 'px');					
			}
			
			Command_dim(event,ui.value, FS20_Devices[Dim_Cache.ID]);
		}					
	});	
	
	// Eventmap Unterstuetzung fehlt ...
	for(k = 0; k < Dim_Zustaende.length; k++){
		if(Dim_Zustaende[k] === FS20_Devices[i].State) {	
			$( "#" + FS20_Devices[i].Name + "_slider-range-min" ).slider( "value", Dim_Werte[k] );		// Init. Wert des Sliders setzen				
			Anzeige_dim_aktualisieren(Dim_Werte[k],Dim_Zustaende[k],FS20_Devices[i],e);			// Init. Bild des Sliders setzen
			break;
		}
	}
}


$().ready(function() {


	// Top_Menu Leiste
	// Die Scrollleiste wird dabei nicht beachtet
	var Breite = $( window ).width();
	var Hoehe = $( window ).height();
	Breite = Breite / 2;
//	Hoehe = Hoehe /2;
	
	if( (Breite-400) > 82) {		
		$('#Top_menu_1').css("left", (Breite-400) + "px" );
		$('#Kommandozeile_div').css("left", (Breite-435) + "px" );	// wegen des wrap margin  muss mehr abgezogen werden
		$('.suggestionsBox').css("left", (Breite-435) + "px" );
	}

/*	if( (Hoehe-200) > 150 ) {
		$('#Left_menu_1').css("top", (Hoehe-200) + "px" );
	} 
*/	

	

	$( window ).resize(function() {
		var Breite = $( window ).width();
		var Hoehe = $( window ).height();
		
		if(($('#User_control_panel').length < 1) || ($('#User_control_panel').css('display') === 'none')) {	// Room_renderer bei der Benutzersteuerung nicht verwenden
			Room_renderer(Breite);
		}
		Breite = Breite / 2;
//		Hoehe = Hoehe /2;
/*		
		if( (Hoehe-200) > 150 ) {
			$('#Left_menu_1').css("top", (Hoehe-200) + "px" );
		} else {
			$('#Left_menu_1').css("top", "150px" );
		}	
*/		
		
		
		if( (Breite-400) > 82 ) {
			$('#Top_menu_1').css("left", (Breite-400) + "px" );
			$('#Kommandozeile_div').css("left", (Breite-435) + "px" );	// wegen des wrap margin  muss mehr abgezogen werden
			$('.suggestionsBox').css("left", (Breite-435) + "px" );
		} else {
			$('#Top_menu_1').css("left", "82px" );	
			$('#Kommandozeile_div').css("left", "47px" );	
			$('.suggestionsBox').css("left", "47px" );			
		}		
	});


	
	
	
//	setTimeout(2000,$("#room1").fadeIn("slow", function() {}));

//	Menue_Steuerung("#Top_arrow_img","#Top_menu_1","top",-40, "img/arrow_3_up.png", "img/arrow_3_down.png", "img/arrow_3_down_hover.png", "img/arrow_3_up_hover.png");
//	Menue_Steuerung("#Left_arrow_img","#Left_menu_1","left",-200, "img/arrow_4_up.png", "img/arrow_4_down.png", "img/arrow_4_down_hover.png", "img/arrow_4_up_hover.png");


	$("#Top_arrow_img").click(function() {
		var Top_menu_wrap = $( "#Top_menu_1" );
	
		if( parseInt(Top_menu_wrap.css( "top" ).replace(/px/g, "")) < -39) {			
			Top_menu_wrap.animate({ "top": "+=40px" }, "slow", function() {
				$( "#Top_arrow_img" ).attr("src", "img/arrow_3_up.png");
			});
		} else {	
			Top_menu_wrap.animate({ "top": "-=40px" }, "slow", function() {
				$( "#Top_arrow_img" ).attr("src", "img/arrow_3_down.png");
			});		
		}
	});
	
	$( "#Top_arrow_img" ).mouseover(function() {
		var Top_menu_wrap = $( "#Top_menu_1" );
		if( parseInt(Top_menu_wrap.css( "top" ).replace(/px/g, "")) === -40) {			
			$( "#Top_arrow_img" ).attr("src", "img/arrow_3_down_hover.png");
		} else {					
			$( "#Top_arrow_img" ).attr("src", "img/arrow_3_up_hover.png");			
		}
	}).mouseout(function() {
		var Top_menu_wrap = $( "#Top_menu_1" );
		if( parseInt(Top_menu_wrap.css( "top" ).replace(/px/g, "")) === -40) {			
			$( "#Top_arrow_img" ).attr("src", "img/arrow_3_down.png");
		} else if(parseInt(Top_menu_wrap.css( "top" ).replace(/px/g, "")) === 0){					
			$( "#Top_arrow_img" ).attr("src", "img/arrow_3_up.png");			
		}
	});

	/* In eine Funktion auslagern? */
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
	
	$("#Kommandozeile").click(function() {
		var Kommo_input = $( "#Kommandozeile_input" ), kommo_puffer = $('#Kommandozeile_puffer'), save_checkbox = $('#savefhem');
		
		// hier sollte mal etwas geschrieben werden, dass automatisch alle Div-Container in Wrap_inhalt verschiebt damit man nicht immer wieder welche hinzufügen muss -.-
		if(Kommo_input.css("display") === "none" ) {		
			$('#Top_menu_1').animate({ "top": "-=40px" }, "slow", function() {
				$( "#Top_arrow_img" ).attr("src", "img/arrow_3_down.png");
			});
			kommo_puffer.animate({ "height": "+=20px" }, "slow");
			// Kacheln verschieben		
			for(i = 0; i < Rooms_to_render.length; i++) {
				Rooms_to_render[i].Room_Div.animate({ "top": "+=20px" }, "slow");
			}
			if( $("#Room_plus").length !== 0) {
				$("#Room_plus").animate({ "top": "+=20px" }, "slow");
				$(".room_minus").animate({ "top": "+=20px" }, "slow");
			}
			Kommo_input.show( "slow" );
			save_checkbox.show( "slow");
			Kommo_input.focus();

		} else {		
			Kommo_input.hide( "slow" );
			save_checkbox.hide( "slow");
			kommo_puffer.animate({ "height": "-=20px" }, "slow");
			// Kacheln verschieben	
			for(i = 0; i < Rooms_to_render.length; i++) {
				Rooms_to_render[i].Room_Div.animate({ "top": "-=20px" }, "slow");
			}
			if( $("#Room_plus").length !== 0) {
				$("#Room_plus").animate({ "top": "-=20px" }, "slow");
				$(".room_minus").animate({ "top": "-=20px" }, "slow");
			}
		}
	});	
	
	$("#Top_FHEM_Haus_img").click(function() {
		var Breite = $( window ).width();
	
		if( $("#User_control_panel").length !== 0 ) {
			$("#User_control_panel").css('display','none');
			for(i = 0; i < Rooms.length; i++) {	
				$("#" + Rooms[i].ID).css("display", "block" );
			}
			Room_renderer(Breite);
		}
		if( $("#Room_plus").length !== 0) {
			$("#Room_plus").remove();
			$(".room_minus").remove();	
			$("#Device_unmapped").remove();
			Breite_verringern = 0;
			for(i = 0; i < Rooms.length; i++) {
				if(Rooms[i].Name == 'nicht zugeordnet') {		
					$("#" + Rooms[i].ID).css("display", "block" );
					eval(JSEVENTS); // ANHÄNGEN EVENTS DER GERÄTE
					JSEVENTS='';
					break;
				}
			}
			Room_renderer(Breite);
		}
		//window.location.href='index.php'; // Ich weiß, das ändere ich noch :P
	});
	/*
    $(":range").rangeinput({
		progress: true,

		change: function(e, i) {
			// Tooltip HTML wieder loeschen
			// Befehl absetzen
			
			
			var wraper_id = "";
			if(wraper_id === e.target.offsetParent.id) {
				wraper_id = '#' + e.target.offsetParent.offsetParent.id;
			} else {
				wraper_id = '#' + e.target.offsetParent.id;
			}
						
			$('#Tool_wrap').remove();
			Command_dim(e,i,wraper_id.replace(/slider_/g, ""));
			
		},
		onSlide: function(ev, step)  {
			var wraper_id = "";
			var css_punkt;
			
			if(wraper_id === ev.target.offsetParent.id) {
				wraper_id = '#' + ev.target.offsetParent.offsetParent.id;
			} else {
				wraper_id = '#' + ev.target.offsetParent.id;
			}			

			if($('#Tool_wrap div').length == 0) {	
				// ToolTip einfuegen			
				$(wraper_id).append('<div id="Tool_wrap"><div id="Dim_Huelle"><span id="Dim_Inhalt"></span></div><div id="Balse_wrap"><div id="Blase"></div></div></div>');							
				// Position vor der Anzeige aendern
				css_punkt = $(wraper_id + ' .slider .handle').css( "left" );
				$('#Tool_wrap').css("left", css_punkt);
				$('#Tool_wrap').css("display", "block");
			} else {				
				css_punkt = $(wraper_id + ' .slider .handle').css( "left" );			
				$('#Tool_wrap').css("left", css_punkt);					
			}
			
			Command_dim(ev,step,wraper_id.replace(/slider_/g, ""));
		}
	});
*/
	


	// eine Variable all_Devices einfuehren
	$(function() {
		var i = 0;		
		
		for(i = 0; i < FS20_Devices.length; i++){
			if(FS20_Devices[i].webCmd === "dim") {
				slider_aufbau(i);
				//$(".ui-slider .ui-slider-horizontal .ui-widget .ui-widget-content .ui-corner-all").attr('id', FS20_Devices[i].Name + 'fullslider');
			}
		}
		
		// Erstmaliges setzen des Slider wertes 
		//$( "#amount" ).val( "$" + $( "#slider-range-min" ).slider( "value" ) );
	});

	  
	$('.ui-slider-handle').draggable();  
	  
//	$('body').append('<script type="text/javascript" src="jquery-ui-1.10.3.custom.drag.min.js" ></script>');
	$("#logout").click(function() { 
		window.location.href = location.pathname + "?action=logout" 
	});	
	
});

