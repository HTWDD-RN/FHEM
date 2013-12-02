##############################################
package main;

use strict;
use warnings;
use IO::Socket; 

# TODO: Standard verwenden bzw definieren (aus FS20 übernehmen?)
my %models = (
    temperature  => 'sender',
    humadity     => 'sender'
);

###############################################################
# WSN_Initialize
#
# Wird von FHEM gerufen, sobald das Modul geladen wird (einmalig)
# Die Modul-Funktionen werden FHEM bekannt gegeben und es wird
# die Konfigurationsdatei geladen (IP und Port zum CoAP-Client)
###############################################################
sub WSN_Initialize($) {
	
	my ($hash) = @_;
	$hash->{Match}     = "^WSN.*";  # TODO besseren Match String (regex) erarbeiten
	$hash->{DefFn}     = "WSN_Define";
	$hash->{GetFn}     = "WSN_Get";
	$hash->{SetFn}     = "WSN_Set";
	$hash->{IODev}	 = "WSNPHD"; #hw-modul
	$hash->{AttrList}  = "loglevel:0,1,2,3,4,5,6 setList unit model:"
						.join(",", sort keys %models);
							
	$hash->{ParseFn}   = "WSN_Parse";
}

###############################################################
# WSN_Parse
#
# get messages from fhem dispatcher and parse them to the
# correct device (reponse from tcp client)
###############################################################
sub WSN_Parse($$) {
	
	Log(3, "WSN_Parse called");
	
	my ($hash, $msg) = @_;
	my @v = split('\|', $msg, 3);
	
	Log(3, "WSN_Parse, Code: $v[0], Uri: $v[1], Value: $v[2]");
	
	# search for device
	my $def = $modules{WSN}{defptr}{$v[1]};
	if($def) {			
		
		Log(3, "WSN " . $def->{NAME} ." state changed from " . $def->{STATE} . " to $v[2]");
	}
    elsif ($v[0] eq "WSN1") {
		    
		Log(3, "discover response received"); 
		  
		# Discover resources and save to current config
		DefineResources($v[1], $v[2]);
		CommandSave(undef, "");		
    }
    elsif($v[0] eq "WSN2") { 
    	
    	Log(3, "get response received");   
	   	 
	   	# set get response
		$def->{STATE} = $v[2];	   
    }
	else {
		Log(3, $v[0] . " is not a valid return code");			
		$v[2] = "error";
	}

	$def->{READINGS}{state}{TIME} = TimeNow();		
}

###############################################################
# Analysiert die CoAP-Discover Antwort und definiert WSN-Resourcen
# Parameter: 
# 0 = Adresse des CoAP Server
# 1 = CoAP-Discover Antwort
###############################################################
sub DefineResources {
	
	my $serveraddr = $_[0];
	my $response = $_[1];	
		
	# detect uri tags
	while ($response =~ m/<\/([a-zA-Z0-9_-]+\/?)+>/gc) {
			
		my $uri = $&;
		my $resource = $&;
		
		# replace '</' and '>' charseqs 
    	$resource =~ s/(^\<\/|\>)//g;  
		
		# get usable fhem name
        my $devname = WSN_GetDeviceName($resource, $serveraddr);
      
        # global definition of current device 
        my $ret = CommandDefine(undef, "$devname WSN $serveraddr/$resource");
        
		if ($ret) {
			Log (3, "Can't define $devname: " . $ret);
        }
        else {
        	Log (3, "$devname defined");
        		
			# define attributes
    		# \n to get attributes for last resource
    		$response = $response . "\n";
			my $attrRegex = "(?<=" . $uri . ")(.*?)(?=</|\n)";
	    		
    		if ($response =~ m/$attrRegex/gc) {
	    		    			
	    		# resource type as unit (e.g. Temperature-C Temperatur in °C)
	    		DefineAttribute($1, $devname, "rt", "unit");
	    		
	    		# title as comment
	    		DefineAttribute($1, $devname, "title", "comment");
    		}
        }
	}    
}

###############################################################
# Definiert Attribute für eine für eine WSN-Resource
# Parameter: 
# 0 = Alle gefundenen Attribute
# 1 = WSN-Name der Resource
# 2 = CoAP-Attributname
# 3 = WSN-Attributname
###############################################################
sub DefineAttribute {
	
	my $attributeString = $_[0];
	my $regex = "(?<=$_[2]=\")(.*?)(?=\")";

    if ($attributeString =~ m/$regex/gc) {
    	CommandAttr(undef, "$_[1] $_[3] $1");
    	Log(3, "$_[1]: attribute $_[3]=$1");       			
    }
}

###############################################################
# WSN_Set
#
# FHEM ruft diese Funktion, wenn ein set-Kommando ausgeführt
# wird z. B. beim Schalten eines Aktors.
###############################################################
sub WSN_Set($@) {
	
	Log(3, "WSN_Set called");
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
	Log(3, "WSN set $hash->{NAME}");


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
sub WSN_Get($@) {
	
	Log(3, "WSN_Get called");	
	my ($hash, @a) = @_;
	
	if(@a < 2) {
		# Nachricht fuer CoAP-Client zusammensetzen
		my $cmd = "get|$hash->{URI}"."\n";
    # Nachricht an CoAP-Client senden
		IOWrite($hash, $cmd);		
	}

	return "Current value for $hash->{NAME} requested.";	
}

###############################################################
# WSN_Define
#
# wird von FHEM gerufen, sobald ein neues Geraet angelegt wurde.
# Es wird geprueft, ob die Anahl der Parameter stimmt. Ausserdem
# werden die Eigenschaften des neuen FHEM-Geraetes gesetzt.
###############################################################
sub WSN_Define($$) {
 
	Log(3, "WSN_Define called");	 
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
sub WSN_GetDeviceName($$) {
	 	
    my ($uri, $addr) = @_;

    my $prefix = "";
    
    # check type of host address: ipv4/6 or domain
    my $IPv6_re = GetIPv6Regex();
    my $IPv4_re = "(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
    if($addr =~ m/$IPv4_re/i) {	# found Ipv4
      $prefix = $&;
      $prefix =~ s/\./_/g;
    }
    elsif($addr =~ m/$IPv6_re/i) {	# found Ipv6 test passed 
    	$prefix = $&;
    	# cut last two blocks from ipv6-address
    	my @blocks = split(/::|:/, $prefix);
    	$prefix = $blocks[@blocks-2] . "_". $blocks[@blocks-1];
    }
    else {	# found domain or something else, TODO shorten domain ?   
    }
    
	$uri =~ s/\//_/g;  # replace all slash symbols with underscore
	my $time = time();
	
  	return ($prefix eq "") ? $uri : $prefix . "_" .  $uri;
}

###############################################################
# GetIPv6Regex
# 
# The code was taken from:
#   http://search.cpan.org/~salva/Regexp-IPv6-0.03/lib/Regexp/IPv6.pm
# 
# License:
# This library is free software; you can redistribute it and/or modify
# it under the same terms as Perl itself, either Perl version 5.10.0 
# or, at your option, any later version of Perl 5 you may have available.
###############################################################
sub GetIPv6Regex() {
	
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


