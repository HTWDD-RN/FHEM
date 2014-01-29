
<?php


	// config für das Standardmäßige ausfahren der Kommandozeile nachreichen 
	// config sollen die nicht zugeordneten Geräte vorn mit Angezeigt werden? 
	$fhem = 'localhost';
//	$fhem = 'iltis.informatik.htw-dresden.de';
	$fhemport = 7072;
	$default_FS20_img = 'icoLicht';					// Wenn model nicht angegeben 
	$default_FS20_img_Lampe_no_dim = 'icoLicht'; 	// Model: fs20as1,fs20as4, fs20sm4, fs20sm8, fs20su, fs20ws1
	$default_FS20_img_Lampe_dim = 'icoDim_Lampe';   // Model: fs20di, fs20di10, fs20du
	$default_FS20_img_Rollo = 'icoRollo';			// Model: fs20ms2, fs20rst, fs20rsu
	$default_FS20_img_Steckdose = 'icoSteckdose';	// Model: fs20st, fs20st2
	$default_FS20_img_Fenster = 'icoFenster';		// Model: fs20tfk	
	
	$default_FHT_img = 'icoHeizung';
	$default_dim =	"icoDim_Lampe" ;
	
	$default_HM_img = 'icoLicht'; 					// Wenn model nicht angegeben 
	$default_HM_img_Tempsensor = 'icoTemp'; 		// Model: THSensor
	$default_HM_img_Switch = 'icoLicht'; 		// Model: Switch
	
	$default_WSN_img = 'icoLicht'; 					// Wenn model nicht angegeben 

	$FS20_models = array();
	// Schalter
	$FS20_models[ ] = array('model' => "fs20as1",'icon' => $default_FS20_img_Lampe_no_dim, 'sensor_or_aktor' => 'aktor');
	$FS20_models[ ] = array('model' => "fs20as4",'icon' => $default_FS20_img_Lampe_no_dim, 'sensor_or_aktor' => 'aktor');
	$FS20_models[ ] = array('model' => "fs20sm4",'icon' => $default_FS20_img_Lampe_no_dim, 'sensor_or_aktor' => 'aktor');
	$FS20_models[ ] = array('model' => "fs20sm8",'icon' => $default_FS20_img_Lampe_no_dim, 'sensor_or_aktor' => 'aktor');
	$FS20_models[ ] = array('model' => "fs20su",'icon' => $default_FS20_img_Lampe_no_dim, 'sensor_or_aktor' => 'aktor');
	$FS20_models[ ] = array('model' => "fs20ws1",'icon' => $default_FS20_img_Lampe_no_dim, 'sensor_or_aktor' => 'aktor');	
	// Dimschalter
	$FS20_models[ ] = array('model' => "fs20di",'icon' => $default_FS20_img_Lampe_dim, 'sensor_or_aktor' => 'aktor');
	$FS20_models[ ] = array('model' => "fs20di10",'icon' => $default_FS20_img_Lampe_dim, 'sensor_or_aktor' => 'aktor');
	$FS20_models[ ] = array('model' => "fs20du",'icon' => $default_FS20_img_Lampe_dim, 'sensor_or_aktor' => 'aktor');
	// Rollos
	$FS20_models[ ] = array('model' => "fs20ms2",'icon' => $default_FS20_img_Rollo, 'sensor_or_aktor' => 'aktor');
	$FS20_models[ ] = array('model' => "fs20rst",'icon' => $default_FS20_img_Rollo, 'sensor_or_aktor' => 'aktor');
	$FS20_models[ ] = array('model' => "fs20rsu",'icon' => $default_FS20_img_Rollo, 'sensor_or_aktor' => 'aktor');
	// Steckdosen
	$FS20_models[ ] = array('model' => "fs20st",'icon' => $default_FS20_img_Steckdose, 'sensor_or_aktor' => 'aktor');
	$FS20_models[ ] = array('model' => "fs20st2",'icon' => $default_FS20_img_Steckdose, 'sensor_or_aktor' => 'aktor');
	// Fensterkontakt
	$FS20_models[ ] = array('model' => "fs20tfk",'icon' => $default_FS20_img_Fenster, 'sensor_or_aktor' => 'aktor');
	
	$HM_models = array();
	// Temperatursensor
	$HM_models[ ] = array('model' => "THSensor",'icon' => $default_HM_img_Tempsensor, 'sensor_or_aktor' => 'sensor');
	$HM_models[ ] = array('model' => "switch",'icon' => $default_HM_img_Switch, 'sensor_or_aktor' => 'aktor');		
	
	$WSN_models = array();
	$WSN_models[ ] = array('model' => "temperature",'icon' => $default_HM_img_Tempsensor, 'sensor_or_aktor' => 'sensor');
	$WSN_models[ ] = array('model' => "humidity",'icon' => $default_HM_img_Tempsensor, 'sensor_or_aktor' => 'sensor');	
	
	abstract class Device {
		protected $name;
		protected $state;
		protected $state_on_off = null;
		protected $state_sets = array();
		protected $type;	// ob homematic oder FS20...
		protected $rooms = array();
		protected $webCmd = null;
		protected $default_icon;
		protected $model;
		protected $alias;
		protected $sensor_or_aktor;
		
		protected $icon;		// _on.png oder _off.png folgt spaeter
		protected $Device_HTML;
		protected $Device_js;
		protected $Grundattr = array();
		protected $Readings = array();
		protected $Attr = array();
		protected $Messwerte = array();
		
		function __construct() {
			$this->rooms[0] = "nicht zugeordnet";		
			$this->state_on_off = array('on' => "on",'off' => "off");						
		}
		
		public function set_name( $name = null ) {
			$this->name = $name;
		}
		public function set_state( $state = null ) {
			$this->state = $state;
		}		
		abstract protected function set_state_sets();	
		public function set_type( $type = null ) {
			$this->type = $type;
		}		
		public function set_rooms( $rooms = null ) {			
			$this->rooms = explode(",", $rooms);
			for($i = 0; $i < count($this->rooms); $i++ ) {
				$this->rooms[$i] = trim($this->rooms[$i]);  // Leerzeichen entfernen bei mehrfacher Raumzuordnung
			}
		}		
		public function set_webCmd( $webCmd = null ) {
			global $default_dim;
			
			$this->webCmd = $webCmd;
			if($this->webCmd == "dim") {
				if($this->state_on_off['on'] == 'on' ) {
					$this->state_on_off['on'] = 'dim100%';
				}
				if($this->icon == $this->default_icon) {
					$this->icon = $default_dim;				
				}
			}
		}	
		public function set_icon( $icon = null ) {
			$this->icon = $icon;
		}	
		public function set_state_on_off( $state_on_off = null ) {
			$this->state_on_off = $state_on_off;
		}	
		public function set_alias( $alias = null ) {
			$this->alias = $alias;
		}
		public function Grundattr_array_erweitern($Key = null, $value = null) {
			$this->Grundattr[$Key] = $value;	
		}		
		public function Readings_array_erweitern($Key = null, $value = null) {
			$this->Readings[$Key] = $value;	
		}
		public function Attr_array_erweitern($Key = null, $value = null) {
			$this->Attr[$Key] = $value;	
		}
		public function get_name() {
			return $this->name;
		}
		public function get_state() {
			return $this->state;
		}	
		public function get_state_sets() {
			return $this->state_sets;
		}			
		public function get_type() {
			return $this->type;
		}		
		public function get_rooms() {
			return $this->rooms;
		}	
		public function get_webCmd() {
			return $this->webCmd;
		}
		public function get_icon() {
			return $this->icon;
		}
		public function get_state_on_off() {
			return $this->state_on_off;
		}
		public function get_alias() {
			return $this->alias;
		}
		public function get_sensor_or_aktor() {
			return $this->sensor_or_aktor;
		}
		
		public function ausgabe_abstract() {
			echo "<br><br>";
			echo "Name:  ".$this->name."<br>";
			echo "State: ".$this->state."<br>";
			echo "State_on_off: ".print_r($this->state_on_off)."<br>";
			echo "State_Sets: ".print_r($this->state_sets)."<br>";
			echo "Messwerte: ".print_r($this->Messwerte)."<br>";
			echo "Rooms: ".print_r($this->rooms)."<br>";
			echo "Type:  ".$this->type."<br>";
			echo "webCmd:  ".$this->webCmd."<br>";
			echo "icon:  ".$this->icon."<br>";
			echo "model:  ".$this->model."<br>";
			echo "alias: ".$this->alias."<br>";
			echo "sensor_or_aktor: ".$this->sensor_or_aktor."<br>";
			echo "Grund Attribute (allgemein)<br>";
			foreach($this->Grundattr as $key => $value){ 
				echo $key.": ".$value."<br>";
			}
			echo "Readings<br>";
			foreach($this->Readings as $key => $value){ 
				echo $key.": ".$value."<br>";
			}
			echo "Attribute<br>";
			foreach($this->Attr as $key => $value){ 
				echo $key.": ".$value."<br>";
			}
			$this->ausgabe();
		}		
		
		abstract protected function ausgabe();

	
		protected function base_HTML_generieren($Room_ID = null) {

			$this->Device_HTML = $this->Device_HTML.'<div id="'.$this->name.'_'.$Room_ID.'" class="room_device" draggable="true" ondragstart="room_drag(event)" ondragend="room_dragend(event)" >'." \n";
			
			/* Generierung des Geraeteicons */
			$this->Device_HTML = $this->Device_HTML.'<div id="'.$this->name.'_device_icon" class="device_icon" >'." \n";
			if($this->webCmd == "dim") {
				// 0 ist off und 100 ist on
				// oder Bilder 0 und 100 nennen 				
				if(($this->state) == "off") {
					$this->Device_HTML = $this->Device_HTML.'<img id="'.$this->name.'_img" class="'.$this->name.'_img" draggable="false" src="img/'.$this->icon.'_off.png" alt="'.$this->name.'_'.$this->state.'.png" height="48" width="48">'." \n";
				} elseif ((( $this->state) == "on") || (( $this->state) == "dim100%")) {					
					$this->Device_HTML = $this->Device_HTML.'<img id="'.$this->name.'_img" class="'.$this->name.'_img" draggable="false" src="img/'.$this->icon.'_on.png" alt="'.$this->name.'_'.$this->state.'.png" height="48" width="48">'." \n";
				} else { 
					$this->Device_HTML = $this->Device_HTML.'<img id="'.$this->name.'_img" class="'.$this->name.'_img" draggable="false" src="img/'.$this->icon.'_'.str_replace("%","",$this->state).'.png" alt="'.$this->name.'_'.$this->state.'.png" height="48" width="48">'." \n";
				}
			} elseif($this->sensor_or_aktor == 'sensor') {
				$this->Device_HTML = $this->Device_HTML.'<img id="'.$this->name.'_img" class="'.$this->name.'_img" draggable="false" src="img/'.$this->icon.'.png" alt="'.$this->icon.'.png" height="48" width="48">'." \n";
			} elseif($this->state == "???") {
				$this->Device_HTML = $this->Device_HTML.'<img id="'.$this->name.'_img" class="'.$this->name.'_img" draggable="false" src="img/'.$this->icon.'_off.png" alt="'.$this->name.'_'.$this->state.'.png" height="48" width="48">'." \n";
			} else {
				$this->Device_HTML = $this->Device_HTML.'<img id="'.$this->name.'_img" class="'.$this->name.'_img" draggable="false" src="img/'.$this->icon.'_'.$this->state.'.png" alt="'.$this->name.'_'.$this->state.'.png" height="48" width="48">'." \n";
			}
			$this->Device_HTML = $this->Device_HTML."</div> \n";
						
			/* Generierung des Geraetenames */
			$this->Device_HTML = $this->Device_HTML.'<div id="'.$this->name.'_name" class="Device_name">'." \n";
			if($this->alias != null) {
				$this->Device_HTML = $this->Device_HTML.$this->alias;
			} else {
				$this->Device_HTML = $this->Device_HTML.$this->name; 
			}
			$this->Device_HTML = $this->Device_HTML."</div> \n";			
			
			
			/* Generierung des Geraetestatus und evtl. spezifischer Controls */
			if($this->sensor_or_aktor  == 'sensor') {
				if(count($this->Messwerte) == 2) {
					$this->Device_HTML = $this->Device_HTML.'<div id="'.$this->name.'_Device_state" class="Device_state">'." \n";
					$this->Device_HTML = $this->Device_HTML.$this->Messwerte[0].': '.$this->Messwerte[1];
					$this->Device_HTML = $this->Device_HTML."</div> \n";
				} elseif(count($this->Messwerte) == 4) {
					$this->Device_HTML = $this->Device_HTML.'<div id="'.$this->name.'_Device_state1" class="Device_state Device_state_1">';
					$this->Device_HTML = $this->Device_HTML.$this->Messwerte[0].': '.$this->Messwerte[1];
					$this->Device_HTML = $this->Device_HTML."</div> \n";
					
					$this->Device_HTML = $this->Device_HTML.'<div id="'.$this->name.'_Device_state2" class="Device_state Device_state_2">';
					$this->Device_HTML = $this->Device_HTML.$this->Messwerte[2].': '.$this->Messwerte[3];
					$this->Device_HTML = $this->Device_HTML."</div> \n";
				}
			} elseif($this->webCmd == "dim") { 
				$this->Device_HTML = $this->Device_HTML.'<div id="slider_'.$this->name.'" class="Device_state Device_state_dim">'." \n";	
				$this->Device_HTML = $this->Device_HTML.'<div id="'.$this->name.'_slider-range-min" class="'.$this->name.'_slider-range-min"></div>';
				$this->Device_HTML = $this->Device_HTML."</div> \n";
			} elseif($this->webCmd == "select") {
			
				$this->Device_HTML = $this->Device_HTML.'<div id="'.$this->name.'_Device_state" class="Device_state Device_state_select">'." \n";
				$this->Device_HTML = $this->Device_HTML.'<select id="'.$this->name.'" class="select_dropdown" size="1">'." \n";
				foreach($this->state_sets as $temp) {
					$this->Device_HTML = $this->Device_HTML.'<option>'.$temp.' &#176;C</option> ';
				}			
				$this->Device_HTML = $this->Device_HTML."</select> \n </div> \n";
			} else {	// normaler Aktor ohne besondere Steuerung 
				$this->Device_HTML = $this->Device_HTML.'<div id="'.$this->name.'_Device_state" class="Device_state">'." \n";
				$this->Device_HTML = $this->Device_HTML."status: ".$this->state;				
				$this->Device_HTML = $this->Device_HTML."</div> \n";
			}
			
			$this->Device_HTML = $this->Device_HTML.'<div id="'.$this->name.'_attr_klapp" class="attr_klapp">';
			$this->Device_HTML = $this->Device_HTML.'<img class="attr_klapp_img"  draggable="false" src="img/arrow_3_down_attr2.png" height="10" width="10">';
			$this->Device_HTML = $this->Device_HTML.'</div>';
			
			$this->Device_HTML = $this->Device_HTML."</div> \n";
		}

	}	

	class Device_FS20 extends Device {				
		private static $counter;
		private $BTN;
		private $XMIT;	
		
		function __construct() {
			parent::__construct();
			$this->type = "FS20";
			self::$counter = 0;
			
			global $default_FS20_img;
			$this->icon = $default_FS20_img;
			$this->default_icon = $default_FS20_img;
			$this->sensor_or_aktor = 'aktor'; // default Einstufung 
		}
		
		public function set_state_sets( $state_sets = null ) {
			$this->state_sets = explode(" ", $state_sets);
		}		
		
		protected function ausgabe() {
			echo "<br>";
			echo "State_Sets: ".print_r($this->state_sets)."<br>";
			echo "model: ".$this->model."<br>";
		}	
		
		public function set_model( $model = null ) {
			global $FS20_models;
			
			$this->model = $model;
			// Aenderung des Icons, wenn Model angegeben ist und kein spezielles Icon gesetzt wurde 
			foreach($FS20_models as $FS20_model) {
				if($FS20_model['model'] == $this->model) {
					if($this->icon == $this->default_icon) {
						$this->icon = $FS20_model['icon'];
					}
					$this->sensor_or_aktor = $FS20_model['sensor_or_aktor']; // bestimmen ob Sensor oder Aktor verwendet wird
				}
			}		
		}
		public function get_model() {
			return $this->model;
		}
		
		public function HTML_generieren($Room_ID = null) {
		
			$this->base_HTML_generieren($Room_ID);
			return $this->Device_HTML;
		}
		
		public function JS_generieren($Room_ID = null) {	
			$i = 0; $zwischenspeicher = 'FS20_Devices['.self::$counter.'].rooms = ["';
			
			$Grundattr_objekt = json_encode($this->Grundattr);
			$Readings_objekt = json_encode($this->Readings);
			$Attr_objekt = json_encode($this->Attr);
			$Device_js = '';
			$Device_js = 'FS20_Devices.push(new FS20_Device("'.$this->name.'","'.$this->alias.'","'.$this->icon.'","'.$this->model.'","'.$this->webCmd.'","'.$this->state."\", new Array(\"".$this->state_on_off['on']."\", \"".$this->state_on_off['off'].'"),"'.$this->sensor_or_aktor.'",'.$Grundattr_objekt.','.$Readings_objekt.','.$Attr_objekt.")); \n";
			$Device_js = $Device_js.'$( "#'.$this->name.'_img").css("cursor","pointer");'." \n";
			$Device_js = $Device_js.'$( "#'.$this->name.'_img").click(FS20_Devices['.self::$counter.'].Command_on_off); ';
			
			
			for($i = 0; $i < count($this->rooms); $i++) {
				$zwischenspeicher = $zwischenspeicher.$this->rooms[$i];
				if($i < (count($this->rooms)-1)) {
					$zwischenspeicher = $zwischenspeicher.'","';
				} else {
					$zwischenspeicher = $zwischenspeicher.'"];';
				}
			}			
			$Device_js = $Device_js.$zwischenspeicher;
			self::$counter = self::$counter + 1;
			return $Device_js;
		}
	}
	
	class Device_FHT extends Device {
		private static $counter;
		
		function __construct() {
			parent::__construct();
			
			self::$counter = 0;
			$this->type = "FHT";
			global $default_FHT_img;
			$this->icon = $default_FHT_img;		
			$this->sensor_or_aktor = 'aktor';
			$this->webCmd = "select";
		}
		
		public function set_state_sets( $state_sets = null ) {
			$state_temps = array();
			// vorerst nur die moeglichen Temps ausgelesen
			// eigentlich muesste hier die Einheit schon mit angehangen werden 
			$zwischen = explode(",", $state_sets);
			$state_temps = array_slice($zwischen, 2, 49);			
			$zwischen = explode(" ", $state_temps[48]);
			$state_temps[48] = $zwischen[0];
			$this->state_sets = $state_temps;
		}
		
		protected function ausgabe() {
			echo "<br>";
			echo "State_Sets: ".print_r($this->state_sets)."<br>";
		}		
		
		public function HTML_generieren($Room_ID = null) {		
			
			$this->base_HTML_generieren($Room_ID);	
			return $this->Device_HTML;
		}
		
		public function JS_generieren() {		
			$i = 0; $zwischenspeicher = 'FHT_Devices['.self::$counter.'].rooms = ["';
		
		
			$Grundattr_objekt = json_encode($this->Grundattr);
			$Readings_objekt = json_encode($this->Readings);
			$Attr_objekt = json_encode($this->Attr);
		
			$Device_js = '';
			$Device_js = 'FHT_Devices.push(new FHT_Device("'.$this->name.'","'.$this->alias.'","'.$this->icon.'","'.$this->model."\",\"".$this->sensor_or_aktor.'",'.$Grundattr_objekt.','.$Readings_objekt.','.$Attr_objekt.")); \n";

			for($i = 0; $i < count($this->rooms); $i++) {
				$zwischenspeicher = $zwischenspeicher.$this->rooms[$i];
				if($i < (count($this->rooms)-1)) {
					$zwischenspeicher = $zwischenspeicher.'","';
				} else {
					$zwischenspeicher = $zwischenspeicher.'"];';
				}
			}			
			$Device_js = $Device_js.$zwischenspeicher;
			self::$counter = self::$counter + 1;
			return $Device_js;
		}
	}
	
	class Device_HM extends Device {
		private static $counter;
		private $humidity;
		private $temperature;
		
		function __construct() {
			parent::__construct();
			$this->type = "HM";
			self::$counter = 0;
			
			global $default_HM_img;
			$this->icon = $default_HM_img;
			$this->default_icon = $default_HM_img;
//			$this->sensor_or_aktor = 'aktor';
		}
		
		public function set_model( $model = null ) {
			global $HM_models;
			
			$this->model = $model;
			
			// Aenderung des Icons, wenn Model angegeben ist und kein spezielles Icon gesetzt wurde 
			foreach($HM_models as $HM_model) {
				if($HM_model['model'] == $this->model) {
					if($this->icon == $this->default_icon) {
						$this->icon = $HM_model['icon'];						
					}
					$this->sensor_or_aktor = $HM_model['sensor_or_aktor'];
				}
			}			
		}
		
		public function get_model() {
			return $this->model;
		}		
		
		public function ausgabe() {		
		}
		
		public function set_state_sets() {
		}
		
		private function set_Messwerte() {
		
			if($this->model  == 'THSensor') {			
				$zwischen = explode(" ", $this->state);
				if(isset($zwischen[3])) {
					array_push($this->Messwerte, "Temperatur");	
					array_push($this->Messwerte, $zwischen[1]."&#176;C");			
					array_push($this->Messwerte, "Feuchtigkeit");	
					array_push($this->Messwerte, $zwischen[3].'%');			
				}
			}
		}
		
		public function HTML_generieren($Room_ID = null) {			
			// hier nur eine Ausgabe, wenn auch ein unterstützter Subtype verwendet wird

			if($this->sensor_or_aktor  == 'sensor') {
				$this->set_Messwerte();
			}			
			if(($this->model == 'THSensor') || ($this->model == 'switch')) {

				$this->base_HTML_generieren($Room_ID);
			}		
			return $this->Device_HTML;											
		}
		
		public function JS_generieren() {		
			$i = 0; $zwischenspeicher = 'HM_Devices['.self::$counter.'].rooms = ["';
		
			$Grundattr_objekt = json_encode($this->Grundattr);
			$Readings_objekt = json_encode($this->Readings);
			$Attr_objekt = json_encode($this->Attr);
		
			$Device_js = '';
			$Device_js = 'HM_Devices.push(new HM_Device("'.$this->name.'","'.$this->alias.'","'.$this->icon.'","'.$this->model."\",\"".$this->state."\", new Array(\"".$this->state_on_off['on']."\", \"".$this->state_on_off['off']."\"),\"".$this->sensor_or_aktor.'",'.$Grundattr_objekt.','.$Readings_objekt.','.$Attr_objekt.")); \n";
			if($this->sensor_or_aktor == 'aktor') {
				$Device_js = $Device_js.'$( "#'.$this->name.'_img").css("cursor","pointer");'." \n";
				$Device_js = $Device_js.'$( "#'.$this->name.'_img").click(HM_Devices['.self::$counter.'].Command_on_off); ';
			}
			
			for($i = 0; $i < count($this->rooms); $i++) {
				$zwischenspeicher = $zwischenspeicher.$this->rooms[$i];
				if($i < (count($this->rooms)-1)) {
					$zwischenspeicher = $zwischenspeicher.'","';
				} else {
					$zwischenspeicher = $zwischenspeicher.'"];';
				}
			}			
			$Device_js = $Device_js.$zwischenspeicher;
			self::$counter = self::$counter + 1;
			return $Device_js;
			
		}
	}
		
	class Device_WSN extends Device {
		private static $counter;
		
		function __construct() {
			parent::__construct();
			$this->type = "WSN";
			self::$counter = 0;
			
			global $default_WSN_img;
			$this->icon = $default_WSN_img;
			$this->default_icon = $default_WSN_img;
//			$this->sensor_or_aktor = 'aktor';
		}
		
		public function set_model( $model = null ) {
			global $WSN_models;
			
			$this->model = $model;
			
			// Aenderung des Icons, wenn Model angegeben ist und kein spezielles Icon gesetzt wurde 
			foreach($WSN_models as $WSN_model) {
				if($WSN_model['model'] == $this->model) {
					if($this->icon == $this->default_icon) {
						$this->icon = $WSN_model['icon'];						
					}
					$this->sensor_or_aktor = $WSN_model['sensor_or_aktor'];
				}
			}			
		}
		
		public function get_model() {
			return $this->model;
		}		
		
		public function ausgabe() {		
		}
		
		public function set_state_sets() {
		}
		
		private function set_Messwerte() {
		
			if($this->model  == 'humidity') {			
				$zwischen = explode("[", $this->state);
				array_push($this->Messwerte, "Feuchtigkeit");	
				array_push($this->Messwerte, $zwischen[0].'%');					
			}
			if($this->model  == 'temperature') {			
				$zwischen = explode("[", $this->state);
				array_push($this->Messwerte, "Temperatur");	
				array_push($this->Messwerte, $zwischen[0]."&#176;C");					
			}
		}
		
		public function HTML_generieren($Room_ID = null) {			

			if($this->sensor_or_aktor  == 'sensor') {
				$this->set_Messwerte();
			}
			if(($this->model == 'humidity') || ($this->model == 'temperature')) {
				$this->base_HTML_generieren($Room_ID);
			}	
			return $this->Device_HTML;											
		}
		
		public function JS_generieren() {		
			$i = 0; $zwischenspeicher = 'WSN_Devices['.self::$counter.'].rooms = ["';
		
			$Grundattr_objekt = json_encode($this->Grundattr);
			$Readings_objekt = json_encode($this->Readings);
			$Attr_objekt = json_encode($this->Attr);
		
			$Device_js = '';
			$Device_js = 'WSN_Devices.push(new WSN_Device("'.$this->name.'","'.$this->alias.'","'.$this->icon.'","'.$this->model."\",\"".$this->state."\", new Array(\"".$this->state_on_off['on']."\", \"".$this->state_on_off['off']."\"),\"".$this->sensor_or_aktor.'",'.$Grundattr_objekt.','.$Readings_objekt.','.$Attr_objekt.")); \n";
			if($this->sensor_or_aktor == 'aktor') {
				$Device_js = $Device_js.'$( "#'.$this->name.'_img").css("cursor","pointer");'." \n";
				$Device_js = $Device_js.'$( "#'.$this->name.'_img").click(WSN_Devices['.self::$counter.'].Command_on_off); ';
			}
			
			for($i = 0; $i < count($this->rooms); $i++) {
				$zwischenspeicher = $zwischenspeicher.$this->rooms[$i];
				if($i < (count($this->rooms)-1)) {
					$zwischenspeicher = $zwischenspeicher.'","';
				} else {
					$zwischenspeicher = $zwischenspeicher.'"];';
				}
			}			
			$Device_js = $Device_js.$zwischenspeicher;
			self::$counter = self::$counter + 1;
			return $Device_js;
			
		}
	}
	
	class Room {
		private $name;
		private $Devices_aktor = array();
		private $Devices_sensor = array();
		
		public function __construct($name) {
			$this->name = $name;
		}
		
		public function add_Device($Device) {
		
			// Unterscheidung ob Aktor oder Sensor
			if($Device->get_sensor_or_aktor() == 'aktor') {				
				array_push($this->Devices_aktor, $Device);
			} else if($Device->get_sensor_or_aktor() == 'sensor') {
				array_push($this->Devices_sensor, $Device);
			}		
		}
		
		public function get_Devices_aktor() {
			return $this->Devices_aktor;
		}
		
		public function get_Devices_sensor() {
			return $this->Devices_sensor;
		}
		
		public function get_name() {
			return $this->name;
		}
	}
	
	
	class FHEM_XML_Paser {
		protected $fhem;
		protected $fhemport;
		protected $SAX_Parser;
		protected $xmllist = ' ';
		protected $Devices_ALL = array();
		protected $Devices_COUNT = 0;
		protected $Zustand_im_DeviceTag = 0; 
		protected $ElementStack = array();
		protected $RoomnameArray = array();
		protected $RoomArray = array();
		protected $HTML_Output = ' ';	
		protected $js_output = '';
		protected $HTML_menue_Output = '';
		
		public function __construct($fhem, $fhemport) {
			$this->fhem = $fhem;
			$this->fhemport = $fhemport;						
		}
		
		public function init_parser() {
			$this->SAX_Parser = xml_parser_create();
			xml_set_object($this->SAX_Parser, $this);
			xml_parser_set_option($this->SAX_Parser, XML_OPTION_TARGET_ENCODING, "UTF-8");
			xml_set_element_handler($this->SAX_Parser, "startElement", "endElement");
		}
		
		public function FHEM_XML_parsen() {
			$fp = stream_socket_client("tcp://$this->fhem:$this->fhemport", $errno, $errstr, 30);
			if (!$fp) {
			   echo "$errstr ($errno)<br />\n";
			} else {
			   fwrite($fp, "xmllist;quit\n");
			   $this->xmllist = stream_get_contents($fp);			 
			   fclose($fp);
			}
		
			xml_parse($this->SAX_Parser, $this->xmllist, TRUE);
			return $this->Devices_ALL;
		}
		
		public function RoomnameArray_generieren() {
			$Temp_Array = array();
			$i = 0;
			foreach ($this->Devices_ALL as $Device) { 
				foreach ($Device->get_rooms() as $room) {
					$Temp_Array[$i] = $room;
					$i++;
				}
			}	
			$i = 0;
			foreach(array_unique($Temp_Array) as $Temp) { // Damit der Index des Arrays nicht besoffen ist...
				$this->RoomnameArray[$i] = $Temp;
				$i++;
			}
			
			return $this->RoomnameArray; // vllt noch irgendwie Sortieren 
		}
		
		public function RoomArray_generieren() {
			$i = 0;
			foreach($this->RoomnameArray as $Roomname) {
				$this->RoomArray[$i] = new Room($Roomname);									
//				echo $this->RoomArray[$i]->get_name();
				foreach($this->Devices_ALL as $Device) {
//					echo $Device->get_name()."<br>";
					if(in_array ($Roomname, $Device->get_rooms())) {   
//						$Device->ausgabe_abstract();
//						echo $Roomname;
						$this->RoomArray[$i]->add_Device($Device);						
//						echo $Device->get_name()."<br>";
					}
				}
				$i++;
			}
			return $this->RoomArray;
		}			
		
		public function HTML_menu_ausgabe($Aufruf_parameter = null) {
			$Left_menu_Titel_neu = '';
		
			/* Menue generierung */
			$this->HTML_menue1_Output = '
			</head> <body>';
			if(isset($_SESSION['user_role'])) {
				$this->HTML_menue1_Output =	$this->HTML_menue1_Output.'<div id="Top_menu_1" >	
					<div id="Top_menu_2" >';
				if($_SESSION['user_role'] == 'Administrator') {
					$this->HTML_menue1_Output =	$this->HTML_menue1_Output.'<div id="Kommandozeile" class="Top_menu_item" >	
								Kommandozeile
							</div>';
				}	
				$this->HTML_menue1_Output =	$this->HTML_menue1_Output.'<div class="Top_menu_item" >	
							Floorplan
						</div>';
				if($_SESSION['user_role'] == 'Administrator') {		
					$this->HTML_menue1_Output =	$this->HTML_menue1_Output.'<div id="Top_menu_gap">	
								<img id="Top_FHEM_Haus_img" src="img/FHEM_Haus_2.png" alt="FHEM" height="30" width="30">
							</div>
							<div class="Top_menu_item" >	
								Steuerung (A)
							</div>
							<div id="fhem_expert" class="Top_menu_item" >	
								A/E-Mode (A)
							</div>';
				}
				$this->HTML_menue1_Output =	$this->HTML_menue1_Output.'</div>
					<div id="Top_arrow">
						<img id="Top_arrow_img" src="img/arrow_3_down.png" alt="FHEM" height="20" width="35">
					</div>
				</div>';
			};
			$this->HTML_menue_Output2 = '<div id="Left_menu_1" >
				<div id="Left_menu_2" >';
			if(isset($_SESSION['user_role'])) {		
				$this->HTML_menue_Output2 = $this->HTML_menue_Output2.'<div id="User_hello">
					Hallo! '.$_SESSION['user_name'].'</div>';
				$Left_menu_Titel_neu = "margin-top: 26px;";	
					
			}	
//			if(!isset($_SESSION['user_role'])) {		
				$this->HTML_menue_Output2 = $this->HTML_menue_Output2.'<div class="Left_menu_Titel" style="'.$Left_menu_Titel_neu.'">  <!-- mit css Vererbung machen: nur margin-top ändern -->	
						Menü
					</div>';
//			}
			if(!isset($_SESSION['user_role'])) {					
				$this->HTML_menue_Output2 = $this->HTML_menue_Output2.'<form action='.$_SERVER['PHP_SELF'].' method="post" id="Left_Login_Form" name="Formular" > 
						<div id="Left_menu_Login">
							<div class="Left_Login_Text">
								Nutzername:
							</div>
							<input type="text" id="login_input_username" class="Left_Login_Feld" name="user_name" />
							<div class="Left_Login_Text">
								Passwort:
							</div>
							<input type="password" id="login_input_password" class="Left_Login_Feld" name="user_password" />													
						</div>
					</form>';
			} elseif($_SESSION['user_role'] == 'User') {
				$this->HTML_menue_Output2 = $this->HTML_menue_Output2.'<div id="logout" class="Left_menu_item">Logout</div>';
			} elseif($_SESSION['user_role'] == 'Administrator') {
//				$this->HTML_menue_Output2 = $this->HTML_menue_Output2.'<div class="Left_menu_item"><a class="Links" href="' . $_SERVER['PHP_SELF'] . '?action=logout">Logout</a></div>';
				$this->HTML_menue_Output2 = $this->HTML_menue_Output2.'<div id="Device_mapping" class="Left_menu_item">Gerätezuordnung</div>';
				$this->HTML_menue_Output2 = $this->HTML_menue_Output2.'<div id="User_control" class="Left_menu_item">Benutzersteuerung</div>';
				$this->HTML_menue_Output2 = $this->HTML_menue_Output2.'<div id="logout" class="Left_menu_item">Logout</div>';				
			}
					
			$this->HTML_menue_Output2 = $this->HTML_menue_Output2.'<img id="Left_FHEM_Haus" src="img/left_FHEM_haus.png" alt="FHEM" height="115" width="90">
					
					<p id="Fusszeile">Powered by Rick/Frank</p>
				</div>
				<div id="Left_arrow" >
					<img id="Left_arrow_img" src="img/arrow_4_down.png" alt="FHEM" height="35" width="20">
				</div>
			</div>
			<div id="wrap">
				<div id="suggest">
				<form action="' . $_SERVER['PHP_SELF'] . '" method="post">
				<div id="Kommandozeile_puffer">
				</div>
				<div id="Kommandozeile_div">
					<input type="text" id="Kommandozeile_input" class="Left_Login_Feld Kommo_input" name="Kommandozeile" size="120" onkeyup="suggest(this.value);" onblur="fill();"
					onKeyPress="enterpressalert(event, this)"/>
					<input type="checkbox" id="savefhem" style="display:none" checked="checked" name="savefhem" value="save"></input>
				</div>
				<div class="suggestionsBox" id="suggestions" style="display: none;"> 
					<div class="suggestionList" id="suggestionsList"> &nbsp; </div>
				</div>
				</div>
				</form>
				<div id="Wrap_inhalt">';
				
			
				
				
			// generierung nur wenn login erfolgt ist	
			if(isset($_SESSION['user_role'])) {
				$this->HTML_js_generieren();
			
				return $this->js_output.$this->HTML_menue1_Output.$this->HTML_menue_Output2.$this->HTML_Output;
			} else {
				return $this->HTML_menue_Output2;
			}
		}		
		
/*		private function Left_Menu_Js() {
			$Menu_JS = '';
			if($_SESSION['user_role'] == 'User') {
//				$Menu_JS = $Menu_JS.' $("#logout").click(function() { window.location.href = location.pathname + "?action=logout" }); ';
			} elseif($_SESSION['user_role'] == 'Administrator') {
//				$Menu_JS = $Menu_JS.' $("#logout").click(function() { window.location.href = location.pathname + "?action=logout" }); ';
			}
			return $Menu_JS;
		}
*/		
		private function HTML_js_generieren() {
			
			$this->js_output = '<script type="text/javascript"> '."\n";
//			foreach($this->Devices_ALL as $Device) {
//				$js_output = $js_output.'var '.$Device->get_name()."; \n";
//			}
			$this->js_output = $this->js_output.'$().ready(function() {'."\n";									
			
								
			$i = 1;
			foreach($this->RoomArray as $room) {
				$this->HTML_Output = $this->HTML_Output."<div id=\"room".$i."\" class=\"room\" >\n"; 
				$this->HTML_Output = $this->HTML_Output."\t<div id=\"titel_room".$i."\" class=\"titel_room\"> \n";
				$this->HTML_Output = $this->HTML_Output."\t\t<div class=\"titel_align\" >".$room->get_name()."</div> \n </div> \n";
				$this->HTML_Output = $this->HTML_Output."<div id=\"room".$i."_content\" class=\"content_room\" ondrop=\"room_drop(event)\" ondragover=\"room_allowDrop(event)\" > \n";
				// Uebergabe der Room informationen an das JS	
				$this->js_output = $this->js_output.'Rooms.push(new Room("room'.$i.'","'.$room->get_name().'",'.count($room->get_Devices_aktor()).','.count($room->get_Devices_sensor()).'));';
				
				foreach($room->get_Devices_aktor() as $Device) {
					$this->HTML_Output = $this->HTML_Output.$Device->HTML_generieren("room".$i);
					$this->js_output = $this->js_output.$Device->js_generieren("room".$i)." \n";	
					
				}
				if ($room->get_Devices_sensor() != null) {
					$this->HTML_Output = $this->HTML_Output.'<div id="sensor_gap_room'.$i.'" style="border-top: 3px ridge silver; width:400px; height: 6px; top: 10px; position: relative; float: left;"> </div>';
				}
				foreach($room->get_Devices_sensor() as $Device) {
					$this->HTML_Output = $this->HTML_Output.$Device->HTML_generieren("room".$i);
					$this->js_output = $this->js_output.$Device->js_generieren("room".$i)." \n";
				}
				$i++;
				$this->HTML_Output = $this->HTML_Output."\t</div> \n</div> \n";
			}
			
//			$this->js_output = $this->js_output.$this->Left_Menu_Js();
			
		//	if(!isset($_SESSION['user_role'])) {	// Fenster ausklappen wenn noch kein Login erfolgt ist.
				
		//	}
			$this->js_output = $this->js_output."}); \n </script> 
			<script type=\"text/javascript\" src=\"scripts_nachher.js\"></script> 
			\n";
//			return $this->js_output.$this->HTML_Output;
//			return $this->HTML_Output.$js_output;
		}
		
		protected function startElement($parser, $element, $attributes) {
		
			array_push($this->ElementStack, $element);

			if ($this->Zustand_im_DeviceTag == 1) {
			
				/* GRUND ATTRIBUTE */
				if ($element == 'INT') {
					if ($attributes['KEY'] == 'NAME') {
	//					echo "Name: ".$attributes['VALUE']."<br>";
						$this->Devices_ALL[$this->Devices_COUNT-1]->set_name($attributes['VALUE']);
					} 
					$this->Devices_ALL[$this->Devices_COUNT-1]->Grundattr_array_erweitern($attributes['KEY'],$attributes['VALUE']);	
				}
				/* READINGS */
				if ($element == 'STATE') {
					$this->Devices_ALL[$this->Devices_COUNT-1]->Readings_array_erweitern($attributes['KEY'],$attributes['VALUE']);
				}
				/* ATTRIBUTE */ 
				if ($element == 'ATTR') {
					if ($attributes['KEY'] == 'room') {
	//					echo "Raum: ".$attributes['VALUE']."<br>";
						$this->Devices_ALL[$this->Devices_COUNT-1]->set_rooms($attributes['VALUE']);
						// zusätzlich in ein Raumarray packen das nur jeden Raum einmal enthält
					} elseif ($attributes['KEY'] == 'alias') {
						$this->Devices_ALL[$this->Devices_COUNT-1]->set_alias($attributes['VALUE']);
					}
	// alte Version (nimmt nicht die selbst gewaehlten Bezeichnungen, sondern nur die standard FHEM)
	/*				if ($attributes['KEY'] == 'STATE') {
	//					echo "State: ".$attributes['VALUE']."<br>";
						$this->Devices_ALL[$this->Devices_COUNT-1]->set_state($attributes['VALUE']);
					}
	*/				elseif ($attributes['KEY'] == 'webCmd') {
	//					echo "Name: ".$attributes['VALUE']."<br>";
						$this->Devices_ALL[$this->Devices_COUNT-1]->set_webCmd($attributes['VALUE']);
					} elseif ($attributes['KEY'] == 'icon') {
	//					echo "Name: ".$attributes['VALUE']."<br>";
						$this->Devices_ALL[$this->Devices_COUNT-1]->set_icon($attributes['VALUE']);
					} elseif ($attributes['KEY'] == 'model') {
	//					echo "Name: ".$attributes['VALUE']."<br>";
						$this->Devices_ALL[$this->Devices_COUNT-1]->set_model($attributes['VALUE']);
					} elseif ($attributes['KEY'] == 'subType') {
	//					echo "Name: ".$attributes['VALUE']."<br>";
						$this->Devices_ALL[$this->Devices_COUNT-1]->set_model($attributes['VALUE']);
					} elseif ($attributes['KEY'] == 'eventMap') {
	//					echo "Name: ".$attributes['VALUE']."<br>";
						$Events = array('on' => "on",'off' => "off");	// init.
						$states_array = explode(" ", $attributes['VALUE']);
						// Eventnamen fuer "on" und "off" heraus filtern 
						// alle anderen werden noch nicht beachtet
						foreach ($states_array as $event_state) {
							$zwischen = explode(":", $event_state);
							if ($zwischen[0] == "on") {
								$Events['on'] = $zwischen[1];
							} elseif ($zwischen[0] == "off") {
								$Events['off'] = $zwischen[1];
							}
						}
						$this->Devices_ALL[$this->Devices_COUNT-1]->set_state_on_off($Events);
					}
					$this->Devices_ALL[$this->Devices_COUNT-1]->Attr_array_erweitern($attributes['KEY'],$attributes['VALUE']);
				}
			}
		
			/* Geraete instanziieren */
			if ($element == 'FS20') {
				$this->Devices_ALL[$this->Devices_COUNT] = new Device_FS20();							
			} elseif ($element == 'FHT') {
				$this->Devices_ALL[$this->Devices_COUNT] = new Device_FHT();
			} elseif ($element == 'CUL_HM') {
				$this->Devices_ALL[$this->Devices_COUNT] = new Device_HM();
			} elseif ($element == 'WSN') {
				$this->Devices_ALL[$this->Devices_COUNT] = new Device_WSN();
			}	

			if (($element == 'FS20') || ($element == 'FHT') || ($element == 'CUL_HM') || ($element == 'WSN')) {
				$this->Devices_ALL[$this->Devices_COUNT]->set_state($attributes['STATE']);		// Status setzen
				$this->Devices_ALL[$this->Devices_COUNT]->set_state_sets($attributes['SETS']);	// moegliche Stadien auslesen
				$this->Zustand_im_DeviceTag = 1;	
				$this->Devices_COUNT++;			
			}
			
		}
		
		protected function endElement($parser, $element) {
		
			array_pop($this->ElementStack);
			if (($element == 'FS20') || ($element == 'FHT') || ($element == 'CUL_HM') || ($element == 'WSN')) {
				$this->Zustand_im_DeviceTag = 0;
				
				// überprüfung 
				
//				echo "Zustand_im_DeviceTag: ".$this->Zustand_im_DeviceTag."<br><br>";
			}
		}
	}
		
?>		