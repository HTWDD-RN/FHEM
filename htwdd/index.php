<!DOCTYPE HTML>
<html>
	<head>
		<title>Web Frontend HTWDD (Frank Effenberger, Rick Belitz)</title>
		<script type="text/javascript" src="jquery-1.10.1.js"></script>
		<link href="style.css" type="text/css" rel="stylesheet">
		<script type="text/javascript" src="script.js"></script> 
		<?php include ("config.php");?>
	</head>
	<body>
		<?php
		$updatestring="<font color='white'>LETZTE ÄNDERUNG: FRANK : 24.06.2013 12:15</font>";
		$updatestring = str_replace($arrsearch, $arrreplace, $updatestring); // Umlaute rausfiltern via CONFIG.PHP
		echo $updatestring;
		?>
		<div id="wrap">
		 
		 <div id="room1" class="room">
			<div id="titel_room">
				<div id="titel_align" >&Uuml;bersicht Raum1 </div>
			</div>
			<div id="content_room">
				<div id="room1_device_row1">
					<div id="div_ON">
						<a href="#" id="ON">ON</a>
					</div>
					<div id="div_OFF">		
						<a href="#" id="OFF">OFF</a>
					</div>
					<div id="icon">
						<img id="Device1" src="img/on.png" alt="FHEM" height="19" width="32">
					</div>
				</div> <!-- Eine Lampe zum Test -->
				<div id="room1_device_row1"></div>
				<div id="room1_device_row1"></div>
				<div id="room1_device_row1"></div>
				<div id="room1_device_row1"></div>
			</div>
		  </div>
		  
		  <div id="room2" class="room">
			<div id="titel_room">
				<div id="titel_align" >&Uuml;bersicht Raum2 </div>
			</div>
			<div id="content_room">
				<div id="room1_device_row1"></div> <!-- Eine Lampe zum Test -->
				<div id="room1_device_row1"></div>
				<div id="room1_device_row1"></div>
			</div>
		  </div>
		  
		  <div id="room3" class="room">
			<div id="titel_room">
				<div id="titel_align" >&Uuml;bersicht Raum3 </div>
			</div>
			<div id="content_room">
				<div id="room1_device_row1"></div> <!-- Eine Lampe zum Test -->
				<div id="room1_device_row1"></div>
				<div id="room1_device_row1"></div>
			</div>
		  </div>

		</div>
	</body>
</html>