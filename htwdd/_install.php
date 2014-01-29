<?php

/**
 * This is the installation file for the 0-one-file version of the php-login script.
 * It simply creates a new and empty database.
 */

error_reporting(E_ALL);


  function performMinimumRequirementsCheck()
    {
        if (version_compare(PHP_VERSION, '5.3.7', '<')) {
            echo "Sorry, Simple PHP Login does not run on a PHP version older than 5.3.7 !";
            return false;
        } elseif (version_compare(PHP_VERSION, '5.5.0', '<')) {
            require_once("libraries/password_compatibility_library.php");
            return true;
        } elseif (version_compare(PHP_VERSION, '5.5.0', '>=')) {
            return true;
        }
    }


echo 'Prüfe Kompatibilität...';
performMinimumRequirementsCheck();
echo 'erfolgreich!<br>';

echo 'Erstelle Datenbank...';

$db_type = "sqlite";
$db_sqlite_path = "database/fhem.db";
$db_connection = new PDO($db_type . ':' . $db_sqlite_path);

echo 'fertig!<br>';
echo 'Erstelle Tabelle \'users\'...';

$sql = 'CREATE TABLE IF NOT EXISTS `users` (
        `user_id` INTEGER PRIMARY KEY,
        `user_name` varchar(64),
        `user_password_hash` varchar(255),
        `user_email` varchar(64),
		`user_role` varchar(64));
        CREATE UNIQUE INDEX `user_name_UNIQUE` ON `users` (`user_name` ASC);';

$query = $db_connection->prepare($sql);
$query->execute();

echo 'fertig!<br>';

echo 'Erstelle Adminprofil ... PW = Test123 -> Unbedingt in Einstellungen ändern! ...';

$user_password_hash = password_hash('Test123', PASSWORD_DEFAULT);
$user_name='Admin';
$user_email='Test123@web.de';
$user_role='Administrator';

$sql= 'INSERT INTO users (user_name, user_password_hash, user_email, user_role) VALUES(:user_name, :user_password_hash, :user_email, :user_role)';
		
$query = $db_connection->prepare($sql);		
$query->bindValue(':user_name', $user_name);
$query->bindValue(':user_password_hash', $user_password_hash);
$query->bindValue(':user_email', $user_email );
$query->bindValue(':user_role', $user_role);

$query->execute();		

echo 'fertig!<br>';

echo 'Erstelle Tabelle \'commands\'...';

/*$sql = 'CREATE TABLE IF NOT EXISTS `commands` (
        `command_id` INTEGER PRIMARY KEY,
        `command_name` varchar(255));
        CREATE UNIQUE INDEX `command_id_UNIQUE` ON `commands` (`command_id` ASC);';
*/
$sql = 'CREATE VIRTUAL TABLE `commands` USING FTS4 (`id`, `command_name` TEXT);';

$query = $db_connection->prepare($sql);
$query->execute();	

echo 'fertig!<br>';	


echo 'Fülle Tabelle \'commands\'...';
include 'config.php';
$i=0;

foreach($ARRCOMMANDS as $command_name) {
$i++;
//echo htmlentities($command_name).", <br/>";
$sql = 'INSERT INTO commands (command_name) VALUES(:command_name)';
$query = $db_connection->prepare($sql);
$query->bindValue(':command_name', $command_name);
$query->execute();	
}

echo 'fertig ('.$i.' Datensätze eingefügt)!<br/>';	



