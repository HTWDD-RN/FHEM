<!DOCTYPE HTML>
<html>
	<head>
		<link href="http://fonts.googleapis.com/css?family=Droid+Sans" rel="stylesheet" type="text/css">
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
		<link href="pctabletstyle.css" type="text/css" rel="stylesheet">
		<script src="script.js"></script>
		<title>Web Frontend HTW Dresden (Frank Effenberger, Rick Belitz)</title>
	</head>
	<body>
		<nav id="mainnavtop">
			<li class="first current">
					<a href="#">Home</a>
			</li>
			<li>	
				<a href="#">Floorplan (Mit Dropdown!)</a>
				<ul>
				<li class="first"><a href="#" title="Unterpunkt 1">Unterpunkt 1</a></li>
				<li class="current"><a href="#" title="Unterpunkt 2">Unterpunkt 2</a></li>
				<li class="last"><a href="#" title="Unterpunkt 3">Unterpunkt 3</a></li>
				</ul>
			</li>
			<li>
				<a href="#">Steuerung(A) (Mit Dropdown!)</a> 
				<ul>
				<li class="first"><a href="#" title="Unterpunkt 1">Unterpunkt 1</a></li>
				<li><a href="#" title="Unterpunkt 2">Unterpunkt 2</a></li>
				<li class="last"><a href="#" title="Unterpunkt 3">Unterpunkt 3</a></li>
				</ul>
			</li>
			<li class="last">
				<a href="#">(...)</a> 
			</li>
		</nav>
		
		
		<nav id="mainnavleft">
			<li>
			<input type="text" value="Username"></input>
			</li>
			<li>
			<input type="password" value="Password"></input>
			</li>
			<li>
			<a href="#">Login</a>
			</li>
			<li>
			(...)
			</li>
			<li>
			<a href="#">Einstellungen</a>
			</li>
			<li>
			<a href="#">Logout</a>
			</li>
		
		
		</nav>
		

		<div id="room" ondrop="room_drop(event)" ondragover="room_allowDrop(event)">
		<p>Raum 1:</p>
		<p>Hinweis: Ziehen sie den Sensor in den Raum!</p>
		</div>
		<br>
		<div id="room" ondrop="room_drop(event)" ondragover="room_allowDrop(event)">
			<p>Nicht zugeordnete Geräte:</p>		
			<img id="drag1" src="../img/folder-owncloud.png" draggable="true" ondragstart="room_drag(event)" >
		</div>
		<br>

</body>

</html>