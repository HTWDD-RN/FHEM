##############################################
package main;

use strict;
use warnings;
use IO::Socket; 
#use HttpUtils;

# Verbindungsinformationen zum CoAP-Client; depricated; wird nicht mehr verwendet
#~ my $coap_cl_port = "50009";
#~ my $coap_cl_ip   = "localhost";

###############################################################
# WSN_Initialize
#
# Wird von FHEM gerufen, sobald das Modul geladen wird (einmalig)
# Die Modul-Funktionen werden FHEM bekannt gegeben und es wird
# die Konfigurationsdatei geladen (IP und Port zum CoAP-Client)
###############################################################
sub
WSN_Initialize($)
{
  my ($hash) = @_;
  $hash->{Match}     = "^WSN.*";  # TODO besseren Match String (regex) erarbeiten
  $hash->{DefFn}     = "WSN_Define";
  $hash->{GetFn}     = "WSN_Get";
  $hash->{SetFn}     = "WSN_Set";
  $hash->{IODev}	 = "WSNPHD"; #hw-modul
  $hash->{AttrList}  = "loglevel:0,1,2,3,4,5,6 setList";
  $hash->{ParseFn}   = "WSN_Parse";

  # Konfigurationsdatei einlesen und Verbindungsdaten setzen
  # wegen Umstrukturierug fehlt die Funktionalität eines Standartpfades des CoAP-Client
  #~ $hash->{CONFIGFILEPATH} = "/var/log/fhem/wsn.conf"; #default file path is /var/log/fhem/wsn.conf

  #~ my %config = WSN_GetConfiguration($hash);
  #~ if (%config) 
  #~ {
    #~ $coap_cl_ip = $config{ip}  if (defined($config{ip}));
    #~ $coap_cl_port = $config{port} if (defined($config{port}));
  #~ } 
  #~ else 
  #~ {
    #~ Log 3, "WSN: Configuration could not be read. Trying default values...\n";
  #~ }

  #~ Log 3, "WSN_Initialize, IP=$coap_cl_ip PORT=$coap_cl_port";
}

###############################################################
# WSN_Parse
#
# get messages from fhem dispatcher and parse them to the
# correct device
###############################################################
sub
WSN_Parse($$)
{
	my ($hash, $msg) = @_;
	
	# Zustand des Geraets setzen
	my @v = split('\|', $msg, 3);
	
	Log 3, "WSN_Parse, Code: $v[0], Uri: $v[1], Value: $v[2]";
	
	# search for device
	my $def = $modules{WSN}{defptr}{$v[1]};
	if($def) 
	{	
		if ($v[0] == 0)
		{	
			Log 3, "WSN " . $def->{NAME} ." state changed from " . $def->{STATE} . " to $v[2]";
		}
	}
    elsif ($v[0] eq "WSN1")  # discover response from coap client
    {
      my $regex = "<\/([a-z0-9_-]+\/?)+>";  # detect uri tags
      my $serveraddr = $v[1];
      my $string = $v[2];
      while ($string =~ m/$regex/g) {
        my $uri = $&;
        $uri =~ s/(^\<\/|\>)//g;  # replace '</' and '>' charseqs 
        # get usable fhem name
        my $devname = WSN_GetDeviceName($uri, $serveraddr);
        Log 3, "CommandDefine: " . "define $devname WSN $serveraddr/$uri";
        # global definition of current device 
        my $retval = CommandDefine(undef, "$devname WSN $serveraddr/$uri");
        Log 3, "return value of CommandDefine: " . $retval if($retval);
        # TODO save new device in fhem.cfg
      }      
    }
	else  # error 
	{
			Log 3, "WSN " . $def->{NAME} ." error: " . $v[2];
			$v[2] = "error";
	}
		
		# set new device state
		$def->{STATE} = $v[2];
		$def->{READINGS}{state}{TIME} = TimeNow();
		#$def->{READINGS}{state}{VAL} = $sockst;
	
}

###############################################################
# WSN_Set
#
# FHEM ruft diese Funktion, wenn ein set-Kommando ausgeführt
# wird z. B. beim Schalten eines Aktors.
###############################################################
sub
WSN_Set($@)
{
  my ($hash, @a) = @_;
  my $name = shift @a;

  # pruefen der uebergebenen Parameter
  return "no set value specified" if(int(@a) < 1);
  my $setList = AttrVal($name, "setList", "*");
  return "Unknown argument ?, choose one of $setList" if($a[0] eq "?");

  my $v = join(" ", @a);
  Log GetLogLevel($name,2), "WSN set $name $v";

  my $cmd = "set|$hash->{URI}=$v";
  
  IOWrite($hash, $cmd);
  Log 3, "WSN set $hash->{NAME}";


  # neue Geraetezustandsdaten setzen
  $hash->{CHANGED}[0] = $v;
  #$hash->{STATE} = $v;
  #$hash->{RESOURCE} = "test";
  $hash->{READINGS}{state}{TIME} = TimeNow();
  $hash->{READINGS}{state}{VAL} = $v;
  
  return "";
}

###############################################################
# WSN_Get
#
# FHEM ruft diese Funktion, wenn ein Geraet des Moduls abgefragt
# wird. Die Funktion baut eine get-Nachricht zusammen und verschickt
# sie über die Request-Funktion.
###############################################################
sub
WSN_Get($@)
{
	my ($hash, @a) = @_;
	
	if(@a < 2) {
		# Nachricht fuer CoAP-Client zusammensetzen
		my $cmd = "get|$hash->{URI}"."\n";
    # Nachricht an CoAP-Client senden
		IOWrite($hash, $cmd);		
	}
  
	Log 3, "WSN get $hash->{NAME}";

	return "Current value for $hash->{NAME} requested.";	
}

###############################################################
# WSN_Request
#
# depricated, kann geloescht werden
# Baut eine Socketverbindung zum CoAP-Client auf und uebermittelt
# die Anfrage der get- oder set-Funktion. Kehrt anschliessend
# mit der Anwtort des Client zurueck.
###############################################################
#~ sub
#~ WSN_Request($@)
#~ {
	#~ my ($hash, $cmd, $list) = @_;
	#~ my $parm='l';
	#~ my $response = "";
#~ 
	#~ if($cmd eq "set") {
	  #~ $parm = $list;
	#~ }
	#~ 
	#~ Log 3, "WSN Request $cmd";
	#~ 
	#~ my ($sock, $answer);
#~ 
	#~ # neuen Socket erstellen
	#~ $sock = new IO::Socket::INET ( 
			#~ PeerAddr => $coap_cl_ip, 
			#~ PeerPort => $coap_cl_port, 
			#~ Proto => 'tcp', 6 
	#~ ); 
	#~ unless ($sock)
	#~ {
		#~ #Log 3, "Could not create socket";
		#~ return "1|Could not create socket"
	#~ }
	#~ #die "Could not create socket: $!\n" unless $sock; 
	#~ # Nachricht uebertragen
	#~ print $sock "$cmd";
	#~ # auf Antwort warten
	#~ while ($answer=<$sock>)
	#~ {
		#~ #print "$answer\n";
		#~ $response = $answer;
	#~ }
	#~ close($sock);
	#~ #Log 3, "WSN Response $response";
	#~ 
	#~ # Zustand des Geraets setzen
	#~ my @v = split('\|', $response);
#~ 
	#~ if ($v[0] == 0)
	#~ {
		#~ $hash->{STATE} = $v[1];
	#~ }
	#~ else
	#~ {
		#~ $hash->{STATE} = "unknown";
	#~ }
#~ 
    #~ return $v[1];
#~ }

###############################################################
# WSN_Define
#
# wird von FHEM gerufen, sobald ein neues Geraet angelegt wurde.
# Es wird geprueft, ob die Anahl der Parameter stimmt. Ausserdem
# werden die Eigenschaften des neuen FHEM-Geraetes gesetzt.
###############################################################
sub
WSN_Define($$)
{
  my ($hash, $def) = @_;
  my @a = split("[ \t][ \t]*", $def);


  # Standard define (normales Geraet)  
  # speichert die URI des Geraetes
  my $uri = $a[2];

  $hash->{URI} = $uri;
  
  $modules{WSN}{defptr}{$uri}  = $hash;
  # physical Device Modul zuordnen - hier WSNPHD 
  AssignIoPort($hash);

  return "Wrong syntax: use define <name> dummy" if(int(@a) != 3);
  # the good case
  return undef;
}

###############################################################
# WSN_GetConfiguration
# 
# Wenn FHEM das WSN-Modul lädt, wird diese Funktion aufgerufen.
# Die Funktion prueft ob die Konfigurationsdatei existiert und
# laedt diese entsprechend. Die Datei enthaelt die IP und
# den Port zum CoAP-Client
#
# depricated
###############################################################
#~ sub
#~ WSN_GetConfiguration($)
#~ {
	#~ my ($hash)= @_;
	#~ my $configfilename = $hash->{CONFIGFILEPATH};
#~ 
	#~ # versucht die Datei zu oeffnen
	#~ if(!open(CONFIGFILE, $configfilename))
	#~ {
		#~ Log 3, "WSN: Cannot open settings file '$configfilename'.";
		#~ return ();
	#~ }
	 #~ 
	#~ # daten der Datei einlesen
	#~ my @configfile=<CONFIGFILE>;
	#~ close(CONFIGFILE);
#~ 
	#~ my %config;
	#~ eval join("", @configfile);
#~ 
	#~ return %config;
#~ }

###############################################################
# WSN_GetDeviceName
#
# Zur Verwaltung eines Geraetes in FHEM ist ein eindeutiger 
# Geraete-Name notwendig. Diese Funktion generiert anhand
# der uebergebenen URI und der Serveradresse diesen Namen und
# gibt diesen zurueck. 
# Die Serveradresse kann als IPv4, IPv6 oder beispielsweise
# in Form einer Domain auftreten. Die IPv4-Adresse und die 
# Domain werden bis auf nicht erlaubte Zeichen direkt uebernommen.
# Von einer gegebenen IPv6-Adresse werden die letzten beiden Bloecke
# als Teilname verwendet.
###############################################################
sub
WSN_GetDeviceName($$)
{
    my ($uri, $addr) = @_;
    Log 3, " uri = ". $uri;
    my $prefix;
    # check type of host address: ipv4/6 or domain
    my $IPv6_re = WSN_GetIPv6Regex();
    my $IPv4_re = "(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
    if( $addr =~ m/$IPv4_re/i){    # found Ipv4
      $prefix = $&;
      $prefix =~ s/\./_/g;
    }
    elsif( $addr =~ m/$IPv6_re/i)   # found Ipv6 test passed
    {
      $prefix = $&;
      # cut last two blocks from ipv6-address
      my @blocks = split(/::|:/, $prefix);
      $prefix = $blocks[@blocks-2] . "_". $blocks[@blocks-1];
      
    }
    else  # found domain or something else
    { 
      $prefix = $&;  
      # TODO shorten domain ?
      $prefix =~ s/(\.|\/|:)/_/g;
    }
    
    $uri =~ s/\//_/g;  # replace all slash symbols with underscore
    my $time = time();
    my $name = $prefix . "_" .  $uri;
    
    return $name;
}

###############################################################
# WSN_GetIPv6Regex
# 
# The code was taken from:
#   http://search.cpan.org/~salva/Regexp-IPv6-0.03/lib/Regexp/IPv6.pm
# 
# License:
# This library is free software; you can redistribute it and/or modify
# it under the same terms as Perl itself, either Perl version 5.10.0 
# or, at your option, any later version of Perl 5 you may have available.
###############################################################
sub
WSN_GetIPv6Regex()
{
    my $IPv6_re;
    my $IPv4 = "((25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})[.](25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})[.](25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2})[.](25[0-5]|2[0-4][0-9]|[0-1]?[0-9]{1,2}))";
    my $G = "[0-9a-fA-F]{1,4}";

    my @tail = ( ":",
           "(:($G)?|$IPv4)",
                 ":($IPv4|$G(:$G)?|)",
                 "(:$IPv4|:$G(:$IPv4|(:$G){0,2})|:)",
           "((:$G){0,2}(:$IPv4|(:$G){1,2})|:)",
           "((:$G){0,3}(:$IPv4|(:$G){1,2})|:)",
           "((:$G){0,4}(:$IPv4|(:$G){1,2})|:)" );

    $IPv6_re = $G;
    $IPv6_re = "$G:($IPv6_re|$_)" for @tail;
    $IPv6_re = qq/:(:$G){0,5}((:$G){1,2}|:$IPv4)|$IPv6_re/;
    $IPv6_re =~ s/\(/(?:/g;
    $IPv6_re = qr/$IPv6_re/;
    
    return $IPv6_re;
}

1; # warum???


