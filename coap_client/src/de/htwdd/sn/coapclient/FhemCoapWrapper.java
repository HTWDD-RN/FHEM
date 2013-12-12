package de.htwdd.sn.coapclient;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;

import org.apache.http.ParseException;

public class FhemCoapWrapper implements CoapResponseListener {

	private Socket socket;
	private CoapClient coapClient;
	private static final String protocol = "coap://";
	private static final String errorCode = "10";
	
	public FhemCoapWrapper(Socket socket) {
		this.socket = socket;
	}
	
	/**
	 * @param args
	 * syntax: <command>|"<uri>"|<attr> [ '=' <value>] [ | <attr> [ '=' <value>] ]*
	 * example ipv6: "get|[aaaa:0:0:0:221:2eff:ff00:1962]:5683/sensors/sht21_temperature"
	 * example ipv4: "get|vs0.inf.ethz.ch:5683/path/sub1"
	 */
	public static void main(String[] args) {
		
		if (args.length != 1) {
			System.out.println("Incorrect number of params!");
			System.exit(-1);
		}

		FhemCoapWrapper wrapper = new FhemCoapWrapper(null);
		wrapper.request(args[0]);
		System.exit(0);
	}
	
	/**
	 * Send coap request to coap Server
	 * @param FHEM request
	 * syntax: <command>|"<uri>"|<attr> [ '=' <value>] [ | <attr> [ '=' <value>] ]*
	 * example: "get|[aaaa:0:0:0:221:2eff:ff00:1962]:5683/sensors/sht21_temperature"
	 */
	public void request(String request) {
		
		if (coapClient == null) 
			coapClient = new CoapClient(this);
		
		System.out.println("Execute request: " + request);			
		try {
			
			String[] args = request.split("\\|");
			
			if (args.length < 2)
				throw new ParseException("Request has incorrect syntax!");
			
			String method = args[0];
			method = method.toUpperCase();
			
			if (method.equals("SET"))
				method = CoapClient.PUT;
			
			String uri = protocol + args[1];	
			if (args.length > 2)
				coapClient.process(new String[]{ method, uri, args[2] });
			else
				coapClient.process(new String[]{ method, uri });		
		
		} catch (Exception e) {
			String err = "unknow error while processing request";
			sendResponse(errorCode, "", err);
			System.err.println(err);
		}		
	}
	
	/**
	 * @param Send coap response to Fhem
	 * syntax: <returnCode>|"<uri>"|<payload>
	 * example: "2|[aaaa:0:0:0:221:2eff:ff00:1962]:5683/sensors/sht21_temperature|22,5�"
	 */
	@Override
	public void notify(String uri, String method, String msg) {
			
		String returnCode = "";
		
		if (method.equals(CoapClient.DISCOVER)) {	
			
			//Remove .well-known header from Discover address
			uri = uri.replace("/.well-known/core", "");
			returnCode = "1";
		}
		else if (method.equals(CoapClient.GET))
			returnCode = "2";		
		else if (method.equals(CoapClient.PUT))
			returnCode = "3";		
		else if (method.equals(CoapClient.OBSERVE))
			returnCode = "4";
		else if (method.equals(CoapClient.ERROR))
			returnCode = "10";
		
		sendResponse(returnCode, uri, msg);
	}

	private void sendResponse(String returnCode, String uri, String msg) {
		
		String responseFormat = "%s|%s|%s";
		String response = String.format(responseFormat, returnCode, uri, msg);
		
		if (socket != null) {
			
			// Die Rückgabe in einen Ausgabestream schreiben:			
			PrintWriter out = null;
			try {
				out = new PrintWriter(socket.getOutputStream(), true);
			} catch (IOException e) {
				System.err.println(e.getMessage());
			}
			
			// Antwort an FHEM Modul senden		
			response = response.replace("\n", "").replace("\r", "");
			System.out.println("Send to FHEM: " + response);	
			out.println(response);
		}
	}
}
