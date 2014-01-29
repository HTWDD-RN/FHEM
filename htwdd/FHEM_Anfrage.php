
<?php
	// später globale Konfig reinladen
	$fhem = 'localhost';
	$fhemport = 7072;
//	$fhem = 'iltis.informatik.htw-dresden.de';	// 'iltis.informatik.htw-dresden.de' oder 'localhost' für Testzwecke
	
	if( isset($_POST['BF'])          ) {
		$Befehl = $_POST['BF'];
		$Save = 'false';	
			if ( isset($_POST['SAVE']) ){
				$Save=$_POST['SAVE'];
			}
		//echo "SAVE =$Save";
		$fp = stream_socket_client("tcp://$fhem:$fhemport", $errno, $errstr, 30);
		if (!$fp) {
		   echo "$errstr ($errno)<br />\n";
		} else {
		
			if ($Save=='true') {
		   fwrite($fp, "$Befehl;save;quit\n");
		   $outputvar=stream_get_contents($fp);
		   }
		   else {
		   //echo "SAVE =$Save";
		   fwrite($fp, "$Befehl;quit\n");
		   $outputvar=stream_get_contents($fp);
		   
		   }
		  // $datei = fopen("xmllist".date("Y-m-d H:i:s").".xml","w+");
		  // fwrite($datei, $outputvar);
		   
		   echo 1;		   
		   fclose($fp);
		}
	}
?>	