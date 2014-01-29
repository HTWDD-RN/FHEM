<?php

	error_reporting(E_ALL);

	$db_type = "sqlite";
	$db_sqlite_path = "database/fhem.db";
	$db_connection= new PDO($db_type . ':' . $db_sqlite_path);	
	
	if (version_compare(PHP_VERSION, '5.3.7', '<')) {
            echo "<div class='error'> <br/>Sorry, Simple PHP Login does not run on a PHP version older than 5.3.7 !</div>";
            //return false;
        } elseif (version_compare(PHP_VERSION, '5.5.0', '<')) {
            require_once("libraries/password_compatibility_library.php");
            //return true;
        } elseif (version_compare(PHP_VERSION, '5.5.0', '>=')) {
            //return true;
        }
	
			
		if(!$db_connection) {
			echo 'Could not connect to the database.';
		} else {
		
				if(isset($_POST['uc_name'])  && isset($_POST['uc_email'])  && isset($_POST['uc_pw']) && isset($_POST['uc_pwrepeat'])  && isset($_POST['uc_role'])
						&& isset($_POST['uc_action']) && $_POST['uc_action'] == 'register' ) {
				
				if ( $_POST['uc_pw'] !== $_POST['uc_pwrepeat']) {
				 echo "<div class='error'> <br/> Server: - Passwörter stimmen nicht überein! </div> "; 
		
				}
				else if (strlen($_POST['uc_pw']) < 6 ) {
						 echo "<div class='error'> <br/> Server: Passwort muss mindestens 6 Zeichen haben! </div> "; 
				}
				else if (strlen($_POST['uc_name']) > 64 || strlen($_POST['uc_name']) < 2 ) {
						 echo "<div class='error'> <br/>Server: Name muss zwischen 2 und 64 Zeichen haben! </div> "; 
				}
				else if (!preg_match('/^[a-z\d]{2,64}$/i', $_POST['uc_name'])) {
						echo "<div class='error'> <br/>Server: Name darf nur a-Z und Zahlen enthalten und zwischen 2 und 64 Zeichen haben</div> "; 
				}
				else if (strlen($_POST['uc_email']) > 64 || strlen($_POST['uc_email']) < 2  ) {
							echo "<div class='error'> <br/>Server: E-Mail muss zwischen 2 und 64 Zeichen haben!</div> "; 
				}
				else if ( ($_POST['uc_role']!== "User") && ($_POST['uc_role']!== "Administrator") ){
							echo "<div class='error'> <br/>Server: Fehler bei Rechtevergabe!</div> ";
				}				
				else if (!filter_var($_POST['uc_email'], FILTER_VALIDATE_EMAIL)) {
				echo "<div class='error'> <br/>Server: Email ist in keinem passendem Format angegeben!</div> "; 
				}
				
				else {		// User Anlegen
				
						
						
					$name = htmlentities($_POST['uc_name'], ENT_QUOTES);
					$mail = htmlentities($_POST['uc_email'], ENT_QUOTES);
					
					$name = mysql_real_escape_string($name); 
					$mail = mysql_real_escape_string($mail);
					
					$pw = mysql_real_escape_string($_POST['uc_pw']);
					$pwrepeat = mysql_real_escape_string($_POST['uc_pwrepeat']);
					$user_role=mysql_real_escape_string($_POST['uc_role']); // Noch als Auswahlmöglichkeit ggf. geben?
					
					 $user_password_hash = password_hash($pw, PASSWORD_DEFAULT);
					 $query = 'SELECT * FROM users WHERE user_name = :user_name';
					$query = $db_connection->prepare($query);
					$query->bindValue(':user_name', $name);
					$query->execute();
					 $result_row = $query->fetchObject();
					 if ($result_row) {
						echo "<div class='error'> <br/> Server: User existiert bereits! </div> ";
						return false;
					} else {
						$sql = 'INSERT INTO users (user_name, user_password_hash, user_email, user_role) VALUES(:user_name, :user_password_hash, :user_email, :user_role)';
						$query = $db_connection->prepare($sql);
						$query->bindValue(':user_name', $name);
						$query->bindValue(':user_password_hash', $user_password_hash);
						$query->bindValue(':user_email', $mail);
						$query->bindValue(':user_role', $user_role);
						// PDO's execute() gives back TRUE when successful, FALSE when not
						// @link http://stackoverflow.com/q/1661863/1114320
						$registration_success_state = $query->execute();

						if ($registration_success_state) {
							echo "<div class='error'> <br/> Server: User wurde erfolgreich angelegt! </div> ";
							return true;
						} else {
							echo "<div class='error'> <br/> Server: Die Registrierung war nicht erfolgreich! </div> ";
							return false;
						}
					}
					
					//echo "<div class='error'> <br/> Server-Datenuebertragung: Daten erfolgreich angekommen! </div> ";
				
				
				
				
				
				
				}
				
				
				}
						/* PASSWORT ÄNDERN */	
			if(isset($_POST['uc_name'])  && isset($_POST['uc_pwold'])  && isset($_POST['uc_pw']) && isset($_POST['uc_pwrepeat'])  
						&& isset($_POST['uc_action']) && $_POST['uc_action'] == 'pwchange' ) {
						
			if ( $_POST['uc_pw'] !== $_POST['uc_pwrepeat']) {
				 echo "<div class='error'> <br/> Server: - Passwoerter stimmen nicht überein! </div> "; 
		
				}
			else if (strlen($_POST['uc_pw']) < 6 ) {
						 echo "<div class='error'> <br/> Server: Neues Passwort muss mindestens 6 Zeichen haben! </div> "; 
				}		
			else {
					$name = mysql_real_escape_string($_POST['uc_name']);
					$pw = mysql_real_escape_string($_POST['uc_pw']);
					$pwold =mysql_real_escape_string($_POST['uc_pwold']);
					
					$sql = 'SELECT user_name, user_email, user_password_hash, user_role FROM users WHERE user_name = :user_name LIMIT 1';
					$query = $db_connection->prepare($sql);
					$query->bindValue(':user_name', $name);
					$query->execute();
					
					$result_row = $query->fetchObject();
					if ($result_row) {

						// using PHP 5.5's password_verify() function to check password
						if (password_verify($pwold, $result_row->user_password_hash)) {
						
							//echo 'Altes Passwort korrekt!<br>';
							
							$user_password_hash = password_hash($pw, PASSWORD_DEFAULT);
							$sql= 'UPDATE users SET user_password_hash = :user_password    WHERE user_name = :user_name ';
							$query = $db_connection->prepare($sql);
							$query->bindValue(':user_password', $user_password_hash);
							$query->bindValue(':user_name', $name);
							$query->execute();
							
							echo "<div class='error'> <br/> Server: Neues Passwort wurde gesetzt! </div> ";
							
						
						} else { echo "<div class='error'> <br/> Server: Fehler bei Passwortcheck! </div> "; }
					
					}
					
				}	
						
			}
			
			if(isset($_POST['uc_name'])  && isset($_POST['uc_email'])    
						&& isset($_POST['uc_action']) && $_POST['uc_action'] == 'mailchange' ) {
						
						if (strlen($_POST['uc_email']) > 64 || strlen($_POST['uc_email']) < 2  ) {
							echo "<div class='error'> <br/>Server: E-Mail muss zwischen 2 und 64 Zeichen haben!</div> "; 
						}
						else if (!filter_var($_POST['uc_email'], FILTER_VALIDATE_EMAIL)) {
							echo "<div class='error'> <br/>Server: Email ist in keinem passendem Format angegeben!</div> "; 
						}
						
						else {
						
							$name=mysql_real_escape_string($_POST['uc_name']);
							$emailnew=mysql_real_escape_string($_POST['uc_email']);
							
							$sql = 'SELECT user_name, user_email, user_password_hash, user_role FROM users WHERE user_name = :user_name LIMIT 1';
							$query = $db_connection->prepare($sql);
							$query->bindValue(':user_name', $name);
							$query->execute();
							
							$result_row = $query->fetchObject();
							if ($result_row) {
								
								$sql= 'UPDATE users SET user_email = :user_email    WHERE user_name = :user_name ';
								$query = $db_connection->prepare($sql);
								$query->bindValue(':user_email', $emailnew);
								$query->bindValue(':user_name', $name);
								$query->execute();
								echo "<div class='error'> <br/>Server: Neue Mailadresse wurde gesetzt!</div> ";
							}
											
							else {echo "<div class='error'> <br/>Server: User nicht vorhanden!</div> ";}
						
						}
						
						}
						
			if (isset($_POST['uc_action']) && $_POST['uc_action'] == 'overview' ) {
				$HTML_Output = "";
			/*
				$sql= 'SELECT * FROM users';
				$query = $db_connection->prepare($sql);
				$query->execute();
			*/
				$HTML_Output = '<table class="Tabellen_over" border="0" cellspacing="0" cellpadding="0" rules="none">
								<thead class="Tabellen_over_head">
									<tr>
										<th style="border-top-left-radius: 5px;padding-bottom: 2px;padding-top: 2px;">
											Nutzername
										</th>
										<th style="padding-bottom: 2px;padding-top: 2px;">
											Rolle
										</th>
										<th style="border-top-right-radius: 5px;padding-bottom: 2px;padding-top: 2px;">
											E-mail
										</th>
									</tr><thead><tbody>';
			
				foreach ($db_connection->query('SELECT user_name, user_role, user_email FROM users') as $row) {
					$HTML_Output = $HTML_Output.'<tr><td>'.$row['user_name'].'</td><td>'.$row['user_role'].'</td><td>'.$row['user_email'].'</td></tr>';
				}
				
				$HTML_Output = $HTML_Output.'</tbody></table>';
				echo $HTML_Output;
			}
			
			if(isset($_POST['uc_name'])  && isset($_POST['uc_pw'])  && isset($_POST['uc_pwrepeat'])   
						&& isset($_POST['uc_action']) && $_POST['uc_action'] == 'delete' ) {
						
					//echo "<div class='error'> <br/>Server: Bin bei Delete angekommen!</div> ";
				if ( $_POST['uc_pw'] !== $_POST['uc_pwrepeat']) {
				 echo "<div class='error'> <br/> Server: - Passwoerter stimmen nicht überein! </div> "; 
				}
			
				else { // Nutzer löschen!
				
					$name = mysql_real_escape_string($_POST['uc_name']);
					$pw = mysql_real_escape_string($_POST['uc_pw']);
					$pwrepeat = mysql_real_escape_string($_POST['uc_pwrepeat']);
					
					$sql = 'SELECT user_name, user_email, user_password_hash, user_role FROM users WHERE user_name = :user_name LIMIT 1';
					$query = $db_connection->prepare($sql);
					$query->bindValue(':user_name', $name);
					$query->execute();
					
					$result_row = $query->fetchObject();
					if ($result_row) {

						// using PHP 5.5's password_verify() function to check password
						if (password_verify($pwrepeat, $result_row->user_password_hash)) {
						
							$sql= 'DELETE FROM users WHERE user_name = :user_name';
								$query = $db_connection->prepare($sql);
								$query->bindValue(':user_name', $name);
								$query->execute();
							
							echo "<div class='error'> <br/> Server: Nutzer wurde entfernt! </div> ";
							
						
						} else { echo "<div class='error'> <br/> Server: - Passwoerter stimmen nicht ! </div> "; }
					
					}
				
				}
			
			}
			//else { echo "<div class='error'> <br/> Server: Nicht alle Felder angegeben! </div> "; }
			
	}
		
		
?>