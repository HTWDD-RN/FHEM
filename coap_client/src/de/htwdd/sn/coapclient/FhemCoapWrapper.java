package de.htwdd.sn.coapclient;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.net.URI;
import java.util.List;

import ch.ethz.inf.vs.californium.coap.Option;
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
		try {
			String[] parsedArguments = parseArguments(args);
			Socket socket = new Socket("localhost", 8083);
			FhemCoapWrapper wrapper = new FhemCoapWrapper(socket);
			wrapper.request(parsedArguments[0], (parsedArguments[1].equals("-l")));
			socket.close();
		} catch (IllegalArgumentException iaex) {
			System.out.println(iaex);
			System.exit(-1);
		} catch (ParseException pex) {
			System.out.println(pex);
			System.exit(-1);
		} catch (IOException ioex) {
			System.out.println("Socket Problem: " + ioex.getMessage());
			System.exit(-1);
		}

		System.exit(0);
	}
	
	/**
	 * Send coap request to coap Server
	 * @param FHEM request
	 * syntax: <command>|"<uri>"|<attr> [ '=' <value>] [ | <attr> [ '=' <value>] ]*
	 * example: "get|[aaaa:0:0:0:221:2eff:ff00:1962]:5683/sensors/sht21_temperature"
	 */
	public void request(String request, boolean waitForMultipleResponses) throws ParseException {
		
		if (coapClient == null) 
			coapClient = new CoapClient(this);
		
		System.out.println("Execute request: " + request);
		String[] requestParts = parseRequest(request);
		try {
			String method = parseMethod(requestParts[0]);
			URI uri = parseURI(requestParts[1]);
			List<Option> options = new ArrayList<Option>();
			String payload = "";
			if(requestParts.length > 2) {
				options = parseOptions(requestParts[2]);
				payload = parsePayload(requestParts[2]);
			}
			coapClient.process(method, uri, options, payload, waitForMultipleResponses);
		} catch (IllegalArgumentException iex) {
			sendResponse(errorCode, "", "Unknow CoAP Method", null);
		}
	}

	/**
	 * @param Send coap response to Fhem
	 * syntax: <returnCode>|"<uri>"|<payload>
	 * example: "2|[aaaa:0:0:0:221:2eff:ff00:1962]:5683/sensors/sht21_temperature|22,5�"
	 */
	@Override
	public void notify(String uri, String method, String msg, HashMap<String, String> options) {
			
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
			returnCode = "2";
		else if (method.equals(CoapClient.ERROR))
			returnCode = "10";
		
		sendResponse(returnCode, uri, msg, options);
	}

	private void sendResponse(String returnCode, String uri, String msg, HashMap<String, String> options) {
		try {
			PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
			StringBuilder builder = new StringBuilder();
			String responseFormat = "%s|%s|%s";
			builder.append(String.format(responseFormat, returnCode, uri, msg));
			if(options != null) {
				for (HashMap.Entry<String, String> entry : options.entrySet()) {
					if (entry.getKey().equals("Max-Age"))
						entry.setValue(entry.getValue().replaceAll("\\D+", ""));
					builder.append(String.format("|%s=%s", entry.getKey().toLowerCase(), entry.getValue()));
				}
			}
			String response = builder.toString();
			response = response.replace("\n", "").replace("\r", "");

			// Antwort an FHEM Modul senden
			System.out.println("Send to FHEM: " + response);
			// Die Rückgabe in einen Ausgabestream schreiben:
			out.println(response);
		} catch (IOException e) {
			System.err.println(e.getMessage());
		}
	}

	private static String[] parseArguments(String[] args) throws IllegalArgumentException {
		if ((args.length == 0) || (args.length > 2 )) {
			throw new IllegalArgumentException("Incorrect number of params!");
		}

		String[] parsedArguments = {"", ""};
		for (String arg : args) {
			if (arg.startsWith("-")) {
				if (arg.equals("-l")) {
					parsedArguments[1] += arg;
				} else {
					throw new IllegalArgumentException("Unrecognized option: " + arg);
				}
			} else {
				parsedArguments[0] += arg;
			}
		}
		return parsedArguments;
	}

	private String[] parseRequest(String request) throws ParseException {
		String[] parts = request.split("\\|");
		if (parts.length < 2)
			throw new ParseException("Request has incorrect syntax!");
		if(parts[0].toUpperCase().equals("SET")) parts[0] = "PUT";
		else parts[0] = parts[0].toUpperCase();
		parts[1] = protocol + parts[1];
		String keyvalues = new String();
		if(parts.length > 2){
			for(int i = 2; i < parts.length; i++) {
				if(parts[i].contains("=")){
					if(!keyvalues.isEmpty())
						keyvalues += "|";
					keyvalues += parts[i];
				}
			}
			parts[2] = keyvalues;
		}
		return parts;
	}

	private String parseMethod(String method) throws IllegalArgumentException {
		if (!(method.equals(CoapClient.GET) ||
			method.equals(CoapClient.DISCOVER) ||
			method.equals(CoapClient.PUT))) {
			throw new IllegalArgumentException("Unknow CoAP Method");
		}
		return method;
	}

	private URI parseURI(String uriString) throws IllegalArgumentException {
		try {
			return new URI(uriString);
		} catch (URISyntaxException usex) {
			throw new IllegalArgumentException("Failed to parse URI: " + usex.getMessage());
		}
	}

	private List<Option> parseOptions(String payload) {
		List<Option> options = new ArrayList<>();
		String[] optsString = payload.split("\\|");
		for(int i = 0; i < optsString.length; i++) {
			String[] keyval = optsString[i].split("\\=");
			if(keyval[0].contains("observe"))
				options.add(new Option(Integer.parseInt(keyval[1]), 6));
			if(keyval[0].contains("max-age"))
				options.add(new Option(Integer.parseInt(keyval[1]), 14));
		}
		return options;
	}

	private String parsePayload(String payload) {
		payload = payload.replaceAll("\\|*observe=([0-9])*", "");
		payload = payload.replaceAll("\\|*max-age=([0-9])*", "");
		return payload;
	}
}
