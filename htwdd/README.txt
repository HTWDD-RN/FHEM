Vorgehen zum Arbeiten mit dem Web Frontend:

[Notwendige Schritte:]

- Das Projekt auf den Webserver packen, so dass man die Dateien aufrufen kann.
- In Auslesen.php die Variable:  "$fhem='localhost';" anpassen, wo der eigene Webserver steht.
- Dasselbe für FHEM_Anfrage.php machen. Die Variable muss in beiden Dateien gleich belegt sein.

(Erklärung: Für die eine Variable wollten wir noch keine config-Datei aufmachen.) 

[Optionale Schritte: Datenbank neu aufsetzen]:

- Beim Start im Ordner database einmal die fhem.db löschen
- im Browser die _install.php einmal ausführen (Standarduser 'Admin' mit Passwort 'Test123' wird angelegt)
- Es ist dringend empfohlen, danach die _install.php zu verschieben, wo sie kein Anderer aufrufen kann (zum Beispiel in den database-Ordner)

----------

- Genauere Doku ist im Forschungsbericht des Wintersemesters 2013/14 der HTW-Dresden zu finden (Teilgebiet Web Frontend, Sensornetze)
