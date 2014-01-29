<!DOCTYPE HTML>
<html>
	<head>
		<title>Web Frontend HTWDD (Frank Effenberger, Rick Belitz)</title>
		<meta http-equiv="content-type" content="text/html;charset=utf-8" />
		<script type="text/javascript" src="libraries/jquery-1.10.1.js"></script> 
		
<!--		<script type="text/javascript" src="jquery-ui-1.10.3.custom.drag.min.js" ></script>
		<script type="text/javascript" src="jquery.tools.slider.min.js"></script> -->
		<script type="text/javascript" src="libraries/jquery.slimscroll.min.js"></script>  
		
		
<!--		<link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" /> -->
		<script type="text/javascript" src="libraries/jquery-ui.js"></script>

		
		<link href="style.css" type="text/css" rel="stylesheet">
<!--		<link href="jquery-ui-1.10.3.custom.min.drag.css" type="text/css" rel="stylesheet"> -->
<!--		<link rel="stylesheet" href="Slider_ui_test.css" /> -->
		<script src="libraries/jquery.ui.touch-punch.min.js"></script>
<?php 

include ("Auslesen.php");

/*--------------------------------------------------------------------------------------------- */


/**
 * Class Login
 * An entire php login script in one file, one class.
 *
 * TODO: POST & GET directly in methods ? would be cleaner to pass this into the methods, right ?
 * TODO: class properties or pass stuff from method to method ?
 * TODO: "don't use else" rule ?
 * TODO: max level intend == 1 ?
 * TODO: PHP_SELF ?
 * TODO: explain the horrible missing of rowCount() in SQLite PDO !
 */
class Login
{
    /**
     * @var string Type of used database (currently only SQLite, but feel free to expand this with mysql etc)
     */
    private $db_type = "sqlite"; //

    /**
     * @var string Path of the database file (create this with _install.php)
     */
    private $db_sqlite_path = "database/fhem.db";

    /**
     * @var null Database connection
     */
    private $db_connection = null;

    /**
     * @var bool Login status of user
     */
    private $user_is_logged_in = false;

    /**
     * @var string System messages, likes errors, notices, etc.
     */
    public $feedback = "";

	private $myParser = null;

/* EIGENE FUNKTIONEN */   








/* ---------------------------------------------- */


   /**
     * Does necessary checks for PHP version and PHP password compatibility library and runs the application
     */
    public function __construct()
    {
		global $fhem, $fhemport; 
        $this->myParser = new FHEM_XML_Paser($fhem, $fhemport);
		
		
		if ($this->performMinimumRequirementsCheck()) {
            $this->runApplication();
        }
    }

    /**
     * Performs a check for minimum requirements to run this application.
     * Does not run the further application when PHP version is lower than 5.3.7
     * Does include the PHP password compatibility library when PHP version lower than 5.5.0
     * (this library adds the PHP 5.5 password hashing functions to older versions of PHP)
     * TODO: failsafe method flow would be nice (default return)
     */
    private function performMinimumRequirementsCheck()
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

    /**
     * This is basically the Controller that handles the entire flow of the application.
     * TODO: get rid of 2 levels deep if/else ?
     */
    public function runApplication()
    {
        // check is user wants to see register page (etc.)
        if (isset($_GET["action"]) && $_GET["action"] == "register") {
            $this->doRegistration();
            $this->showPageRegistration();
        } else {
            // start the session, always needed!
            $this->doStartSession();
            // check for possible user interactions (login with session/post data or logout)
            $this->performUserLoginAction();
            // show "page", according to user's login status
            if ($this->getUserLoginStatus()) {
				
				$this->myParser->init_parser();
				$Geraete = $this->myParser->FHEM_XML_parsen();
				
/*				foreach ($Geraete as $Device) { 
					$Device->ausgabe_abstract();
				}
*/		
			//	print_r($myParser->RoomnameArray_generieren());
			//	echo "-.-";
			//	print_r($myParser->RoomArray_generieren());
				$this->myParser->RoomnameArray_generieren();
				$this->myParser->RoomArray_generieren();
				//echo $_SESSION['user_role'];
				// Admin oder normaler Nutzer?
				if($_SESSION['user_role'] == 'User') {
					echo '<script type="text/javascript" src="scripts_user.js"></script>';	
					echo $this->myParser->HTML_menu_ausgabe();
				} elseif($_SESSION['user_role'] == 'Administrator') {
					echo '<script type="text/javascript" src="scripts_user.js"></script>';
					echo '<script type="text/javascript" src="scripts_admin.js"></script>';		
					echo $this->myParser->HTML_menu_ausgabe();		

						//echo "GEKLAPPT!";
						if ( isset($_POST['Kommandozeile']) ) {
							echo "GEKLAPPT!";
							$Kommandozeile=$_POST['Kommandozeile'];
							sendfhem($Kommandozeile);
							echo 'Abgeschickter Befehl: '.$Kommandozeile;
							echo '<br/><br/>';
		
						} 
				}			
            } else {
				echo '<script type="text/javascript" src="scripts.js"></script>';
                echo $this->myParser->HTML_menu_ausgabe(false);
            }
        }
    }

    /**
     * Creates a PDO database connection (in this case to a SQLite flat-file database)
     * @return bool Database creation success status
     */
    private function createDatabaseConnection()
    {
        try {
            $this->db_connection = new PDO($this->db_type . ':' . $this->db_sqlite_path);
            return true;
        } catch (PDOException $e) {
            $this->feedback = "PDO database connection problem: " . $e->getMessage();
            return false;
        } catch (Exception $e) {
            $this->feedback = "General problem: " . $e->getMessage();
            return false;
        }
    }

    /**
     * Handles the flow of the login/logout process. According to the circumstances, a logout, a login with session
     * data or a login with post data will be performed
     */
    private function performUserLoginAction()
    {
        if (isset($_GET["action"]) && $_GET["action"] == "logout") {
            $this->doLogout();
        } elseif (!empty($_SESSION['user_name']) && ($_SESSION['user_is_logged_in'])) {
            $this->doLoginWithSessionData();
        } elseif (isset($_POST["user_name"])) {
            $this->doLoginWithPostData();
        }
    }

    /**
     * Simply starts the session.
     * It's cleaner to put this into a method than writing it directly into runApplication()
     */
    private function doStartSession()
    {
        session_start();
    }

    /**
     *
     */
    private function doLoginWithSessionData()
    {
        $this->user_is_logged_in = true; // ?
    }

    /**
     * TODO: split checkLoginFormDataPasswordCorrect into CHECK for login data and REALLY LOGGIN IN
     */
    private function doLoginWithPostData()
    {
        // TODO: how to fix 2 levels deep if structure
        // TODO: not intuitive what happens here
        if ($this->checkLoginFormDataNotEmpty()) {
            if ($this->createDatabaseConnection()) {
                $this->checkLoginFormDataPasswordCorrect(); // TODO: better name
            }
        }
    }

    /**
     * Logs the user out
     */
    private function doLogout()
    {
        $_SESSION = array();
        session_destroy();
        $this->user_is_logged_in = false;

        $this->feedback = "You were just logged out.";
    }
    
    /**
     * Simply returns the current status of the user's login
     * @return bool User's login status
     */
    public function getUserLoginStatus()
    {
        return $this->user_is_logged_in;
    }

	
	private function checkLoginFormDataNotEmpty()
    {
        if (!empty($_POST['user_name']) && !empty($_POST['user_password'])) {
            return true;
        } elseif (empty($_POST['user_name'])) {
            $this->feedback = "Username field was empty.";
        } elseif (empty($_POST['user_password'])) {
            $this->feedback = "Password field was empty.";
        }
        // default return
        return false;
    }

    /**
     * Checks if user exits, if so: check if provided password matches the one in the database
     * TODO: remove 2 levels deep if structure
     * @return bool User login status
     */
    private function checkLoginFormDataPasswordCorrect()
    {
        $sql = 'SELECT user_name, user_email, user_password_hash, user_role FROM users WHERE user_name = :user_name LIMIT 1';
        $query = $this->db_connection->prepare($sql);
        $query->bindValue(':user_name', $_POST['user_name']);
        $query->execute();

        // btw that's the weird way to get num_rows in PDO with SQLite. what a fucking bullshit! but that's the
        // way to get the rows. $result->numRows() works with SQLite pure, but not with SQLite PDO.
        // I think that PDO is a bad choice.
        //if (count($query->fetchAll(PDO::FETCH_NUM)) == 1) {

        // As there is no numRows() in SQLite/PDO (!!) we have to do it this way:
        // If you meet the inventor of PDO, punch him. Seriously.
        $result_row = $query->fetchObject();
        if ($result_row) {

            // using PHP 5.5's password_verify() function to check password
            if (password_verify($_POST['user_password'], $result_row->user_password_hash)) {

                // write user data into PHP SESSION [a file on your server]
                $_SESSION['user_name'] = $result_row->user_name;
                $_SESSION['user_email'] = $result_row->user_email;
                $_SESSION['user_is_logged_in'] = true;
				$_SESSION['user_role'] = $result_row->user_role;
                $this->user_is_logged_in = true;

            } else {
                $this->feedback = "Wrong password.";
            }
        } else {
            $this->feedback = "This user does not exist.";
        }
    }
	
	
}

// runs the app
$login = new Login();

?>
		</div>
	</body>
</html>
