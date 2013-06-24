
<?php
	include("config.php");
	if(isset($_POST['BF'])) {
		$Befehl = $_POST['BF'];
		$fp = stream_socket_client("tcp://$FHEM:$FHEMPORT", $errno, $errstr, 30);
		if (!$fp) {
		   echo "$errstr ($errno)<br />\n";
		} else {
		   fwrite($fp, "$Befehl;quit\n");
		   $outputvar=stream_get_contents($fp);
		   
		   echo 1;
		   
		   fclose($fp);
		}
	}
?>	