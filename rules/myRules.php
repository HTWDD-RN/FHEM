<!-- erstellte Regeln ansehen, Variablennamen usw. auslesen -->
<html>
  <head>
    <title>Regelverarbeitung</title>
    <script>
      function onEvent() {
        var f = document.forms[0]
        if (f.event[0].checked) {
          f.variable.disabled=false;
          for (var i = 0; i < f.trigger.length; i++) f.trigger[i].disabled=false;
          f.value.disabled=false;
          for (var i = 0; i < f.pattern.length; i++) f.pattern[i].disabled=true;
          f.time.disabled=true;
          f.monday.disabled=true;
          f.tuesday.disabled=true;
          f.wednesday.disabled=true;
          f.thursday.disabled=true;
          f.friday.disabled=true;
          f.saturday.disabled=true;
          f.sunday.disabled=true;
          f.hours.disabled=true;
          f.amount.disabled=true;
          f.limitation.disabled=true;
          f.condition.disabled=false;
        }
        else {
          f.variable.disabled=true;
          for (var i = 0; i < f.trigger.length; i++) f.trigger[i].disabled=true;
          f.value.disabled=true;
          for (var i = 0; i < f.pattern.length; i++) f.pattern[i].disabled=false;
          f.time.disabled=false;
          f.monday.disabled=false;
          f.tuesday.disabled=false;
          f.wednesday.disabled=false;
          f.thursday.disabled=false;
          f.friday.disabled=false;
          f.saturday.disabled=false;
          f.sunday.disabled=false;
          f.hours.disabled=false;
          f.amount.disabled=false;
          f.limitation.disabled=false;
          f.condition.disabled=true;
          onPattern()
        }
      }
      function onPattern() {
        var f = document.forms[0]
        if (f.pattern[2].checked) {
          f.time.disabled=false;
          f.monday.disabled=false;
          f.tuesday.disabled=false;
          f.wednesday.disabled=false;
          f.thursday.disabled=false;
          f.friday.disabled=false;
          f.saturday.disabled=false;
          f.sunday.disabled=false;
          f.hours.disabled=true;
          f.amount.disabled=true;
          f.limitation.disabled=true;
        }
        else if (f.pattern[3].checked) {
          f.time.disabled=true;
          f.monday.disabled=true;
          f.tuesday.disabled=true;
          f.wednesday.disabled=true;
          f.thursday.disabled=true;
          f.friday.disabled=true;
          f.saturday.disabled=true;
          f.sunday.disabled=true;
          f.hours.disabled=false;
          f.amount.disabled=false;
          f.limitation.disabled=false;
        }
        else {
          f.time.disabled=false;
          f.monday.disabled=true;
          f.tuesday.disabled=true;
          f.wednesday.disabled=true;
          f.thursday.disabled=true;
          f.friday.disabled=true;
          f.saturday.disabled=true;
          f.sunday.disabled=true;
          f.hours.disabled=true;
          f.amount.disabled=true;
          f.limitation.disabled=true;
        }
      }
    </script>
  </head>
  <body>
    <form action="myRules.php" method="post">
      <h3>Ereignis hinzuf&uuml;gen</h3>
      Name: <input type="text" name="name" value="Schalter1Notify">
      <input type="radio" name="event" value="ausgeloest" onClick="onEvent()" checked> Ausgel&ouml;stes Ereignis
      <input type="radio" name="event" value="zyklisch" onClick="onEvent()"> Zyklisches Ereignis<p>
      <table border="1" cellpadding="10" bgcolor="#FFFF99">
        <td>
          Variable: <select name="variable">
          <?php
            $file = file("../Downloads/fhem-5.4-fb7270/fhem/fhem.cfg");
            foreach ($file AS $line) {
              $words = explode(" ", $line);
              if ($words[0] == "define" && $words[2] == "FS20")
                echo '<option value="' . $words[1] . '">' . $words[1] . '</option>';
          }?>
          </select><p>
          Ausl&ouml;ser: <br>
          <input type="radio" name="trigger" value="Variablenaenderung" checked> Bei Variablen&auml;nderung<br>
          <input type="radio" name="trigger" value="Grenzunterschreitung"> Bei Grenzunterschreitung<br>
          <input type="radio" name="trigger" value="Grenzueberschreitung"> Bei Grenz&uuml;berschreitung<br>
          <input type="radio" name="trigger" value="Wert"> Bei bestimmtem Wert<p>
          Wert: <input type="text" name="value" size="10" value="0"><p>
        </td>
        <td>
          <table cellpadding="5">
            <td>
              Zeitmuster: <br>
              <input type="radio" name="pattern" value="Einmalig" onClick="onPattern()" checked disabled> Einmalig<br>
              <input type="radio" name="pattern" value="Taeglich" onClick="onPattern()" disabled> T&auml;glich<br>
              <input type="radio" name="pattern" value="Woechentlich" onClick="onPattern()" disabled> W&ouml;chentlich<br>
              <input type="radio" name="pattern" value="Regelmaessig" onClick="onPattern()" disabled> Regelm&auml;&szlig;ig<p>
              Zeit: <input type="text" name="time" value="00:00:00" size="10" disabled><p>
            </td>
            <td>
              <input type="checkbox" name="monday" disabled> Montag<br>
              <input type="checkbox" name="tuesday" disabled> Dienstag<br>
              <input type="checkbox" name="wednesday" disabled> Mittwoch<br>
              <input type="checkbox" name="thursday" disabled> Donnerstag<br>
              <input type="checkbox" name="friday" disabled> Freitag<br>
              <input type="checkbox" name="saturday" disabled> Samstag<br>
              <input type="checkbox" name="sunday" disabled> Sonntag<p>
            </td>
          </table>
        </td>
        <tr>
          <td>
            Alle <input type="text" name="hours" size="10" value="00:00:00" disabled> Stunden<p>
            Anzahl: <input type="text" name="amount" value="0" size="6" disabled><br>
            <input type="checkbox" name="limitation" disabled> Ohne Begrenzung
          </td>
          <td align="right">
            Befehl: <select name="command">
            <option value="set wz_Media off">set wz_Media off</option>
            <option value="set lamp on">set lamp on</option>
            </select><p>
            Alternative: <select name="alternative">
            <option value="">keine</option>
            <option value="set wz_Media off">set wz_Media off</option>
            <option value="set lamp on">set lamp on</option>
            </select><p>
            <input type="submit" name="condition" value="Neue Bedingung">
            <input type="submit" name="rule" value="Regel erstellen">
          </td>
        </tr>
      </table>
    </form>
  </body>
</html>
<?php
  session_start();
  $define;
  $_SESSION["condition"];
  $action;
  $result;
  $name = $_POST["name"];
  $variable = $_POST["variable"];
  $trigger = $_POST["trigger"];
  $command = $_POST["command"];
  $alternative = $_POST["alternative"];
  $value = $_POST["value"];
  $pattern = $_POST["pattern"];
  $time = $_POST["time"];
  $hours = $_POST["hours"];
  if ($_POST["event"] == "ausgeloest") {
    $define = 'define ' . $name . ' notify ' . $variable;
    if ($trigger == "Variablenaenderung") {
      $result = $define . ' ' . $command;
    }
    else {
      if ($trigger == "Grenzunterschreitung") $operator = "lt";
      else if ($trigger == "Grenzueberschreitung") $operator = "gt";
      else $operator = "eq";
      if ($alternative) $alternative = ' else {fhem("' . $alternative . '")}';
      if ($_SESSION["condition"])
        $_SESSION["condition"] = $_SESSION["condition"] . ' && Value("' . $variable . '") ' . $operator . ' "' . $value . '"';
      else
        $_SESSION["condition"] = $_SESSION["condition"] . 'Value("' . $variable . '") ' . $operator . ' "' . $value . '"';
      $result = $define . ' { if (' . $_SESSION["condition"] . ') {fhem("' . $command . '")}' . $alternative . ' }';
    }
  }
  else {
    $define = 'define ' . $name . ' at ';
    if ($alternative) $alternative = ' else {fhem("' . $alternative . '")}';
    if ($pattern == "Einmalig") {
      $define = $define . $time;
    }
    else if ($pattern == "Taeglich") {
      $define = $define . '*' . $time;
    }
    else if ($pattern == "Woechentlich") {
      $list = '(';
      if ($_POST["monday"]) $list = $list . '1, ';
      if ($_POST["tuesday"]) $list = $list . '2, ';
      if ($_POST["wednesday"]) $list = $list . '3, ';
      if ($_POST["thursday"]) $list = $list . '4, ';
      if ($_POST["friday"]) $list = $list . '5, ';
      if ($_POST["saturday"]) $list = $list . '6, ';
      if ($_POST["sunday"]) $list = $list . '0, ';
      $define = $define . '*' . $time;
      if ($_SESSION["condition"]) $_SESSION["condition"] = $_SESSION["condition"] . ' && (grep {$wday eq $_} ' . $list . ')';
      else $_SESSION["condition"] = ' && (grep {$wday eq $_} ' . $list . ')';
    }
    else {
      if ($_POST["limitation"]) {
        $define = $define . '+*' . $hours;
      }
      else {
        $define = $define . '+*{' . $_POST["amount"] . '}' . $hours;
      }
    }
    if ($_SESSION["condition"]) $result = $define . ' { if (' . $_SESSION["condition"] . ') {fhem("' . $command . '")}' . $alternative . ' }';
    else $result = $define . ' ' . $command;
  }
  echo $result;
  if($_POST["rule"]) {
    unset($_SESSION["condition"]);
    $file = fopen("../Downloads/fhem-5.4-fb7270/fhem/fhem.cfg", "a");
    fwrite($file, "\n" . $result);
    fclose(file);
    echo ("<script>window.location.href=\"http://localhost:8083/fhem?room=all\" </script>");
  }
?>