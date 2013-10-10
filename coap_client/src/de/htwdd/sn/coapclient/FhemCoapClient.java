package de.htwdd.sn.coapclient;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;

import org.apache.http.ParseException;

import ch.ethz.inf.vs.californium.coap.Request;
import ch.ethz.inf.vs.californium.coap.Response;

public class FhemCoapClient implements CoapResponseEvent {

	private Socket socket;
	
	private static final String protocol = "coap://";
	
	public FhemCoapClient() {
	}
	
	public FhemCoapClient(Socket socket) {
		this.socket = socket;
	}
	
	/**
	 * @param args
	 * syntax: <command>|"<uri>"|<attr> [ '=' <value>] [ | <attr> [ '=' <value>] ]*
	 * example: "get|[aaaa:0:0:0:221:2eff:ff00:1962]:5683/sensors/sht21_temperature"
	 */
	public static void main(String[] args) {
		
		if (args.length != 1) {
			System.out.println("Incorrect number of params!");
			System.exit(-1);
		}

		new FhemCoapClient().request(args[0]);
		System.exit(0);
	}
	
	/**
	 * Send coap request to coap Server
	 * @param FHEM request
	 * syntax: <command>|"<uri>"|<attr> [ '=' <value>] [ | <attr> [ '=' <value>] ]*
	 * example: "get|[aaaa:0:0:0:221:2eff:ff00:1962]:5683/sensors/sht21_temperature"
	 */
	public void request(String request) {
		
		System.out.println("Execute request: " + request);			
		try {
			
			String[] args = request.split("\\|");
			
			if (args.length < 2)
				throw new ParseException("Request has incorrect syntax!");
			
			String method = args[0].toUpperCase();
			String uri = protocol + args[1];
			
			CoapClient client = new CoapClient();
			client.addCoapResponseEventListener(this);
			client.process(new String[]{ method, uri });
		
		} catch (Exception e) {
			System.err.println("Error: " + e.getMessage());
		}		
	}
	
	/**
	 * @param Send coap response to Fhem
	 * syntax: <returnCode>|"<uri>"|<payload>
	 * example: "2|[aaaa:0:0:0:221:2eff:ff00:1962]:5683/sensors/sht21_temperature|22,5°"
	 */
	@Override
	public void response(Response coapResponse, String method) {
		
		String responseFormat = "%s|%s|%s";
		Request request = coapResponse.getRequest();
		String uri = protocol + request.getUriHost() + request.getUriPath();
		String returnCode = "10";
		
		if (method.equals(CoapClient.DISCOVER)) 			
			returnCode = "1";
		
		else if (method.equals(CoapClient.GET))
			returnCode = "2";
		
		else if (method.equals(CoapClient.PUT))
			returnCode = "3";
		
		else if (method.equals(CoapClient.OBSERVE))
			returnCode = "4";
		
		String response = String.format(responseFormat, returnCode, uri, coapResponse.getPayloadString());
		
		if (socket != null) {
			// Die Rückgabe in einen Ausgabestream schreiben:			
			PrintWriter out = null;
			try {
				out = new PrintWriter(socket.getOutputStream(), true);
			} catch (IOException e) {
				System.err.println(e.getMessage());	
			}
			
			// Antwort an FHEM Modul senden		
			System.out.println("Antwort an FHEM senden");	
			out.println(response);
		}
		
		System.out.println("Response received from CoAP Server: " + response);	
	}
}
