<?php

	error_reporting(E_ALL);

$db_type = "sqlite";
$db_sqlite_path = "database/fhem.db";
$db_connection= new PDO($db_type . ':' . $db_sqlite_path);	
		
	if(!$db_connection) {
		echo 'Could not connect to the database.';
	} else {
	
		if(isset($_POST['queryString'])) {

		$queryString = $_POST['queryString'];
			if(strlen($queryString) >2) {

			$query= "SELECT * FROM COMMANDS WHERE command_name MATCH '$queryString*'";
			//$query="SELECT command_name FROM commands WHERE command_name LIKE '%$queryString%'";
			$query = $db_connection->prepare($query);
			$query->execute();
				
			$result = $query->fetchObject();	
				if($query) {
				echo '<ul>';
					while ($result = $query->fetchObject()) {
	         			echo '<li onClick="fill(\''.addslashes($result->command_name).'\');">'.htmlentities($result->command_name).'</li>';
	         		}
				echo '</ul>';
					
				} else {
					echo 'OOPS we had a problem :(';
				}
				} else {
				// do nothing
			}
		} else {
			echo 'There should be no direct access to this script!';
		}
				
				
				
				
				
	}
?>