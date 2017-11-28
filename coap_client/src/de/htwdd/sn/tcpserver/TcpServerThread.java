package de.htwdd.sn.tcpserver;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;

import de.htwdd.sn.coapclient.FhemCoapWrapper;

public class TcpServerThread implements Runnable {

	private int port;

	public TcpServerThread(int port) {
		this.port = port;
	}

	/**
	 * Thread wird ausgef�hrt, serversocket nach erfolgreicher Verbindung dem
	 * coap Client �bergeben, damit dieser auf Antworten des Coap Server
	 * reagieren kann
	 * 
	 */
	public void run() {

		while (true) {
			try {

				@SuppressWarnings("resource")
				ServerSocket socket = new ServerSocket(port);
				System.out.println("Binden von Socket an Port " + port
						+ " erfolgreich.");
				
				Socket clientSocket = socket.accept();
				System.out.println("Socketverbindung mit FHEM Modul an Port "
						+ port + " erfolgreich.");

				FhemCoapWrapper fhemClient = new FhemCoapWrapper(clientSocket);

				while (true) {

					// String, der vom FHEM-Modul uebergeben wurde auslesen
					BufferedReader in = new BufferedReader(
							new InputStreamReader(clientSocket.getInputStream()));

					// Reqeust an FHEM Coap Client absetzen und auf Antwort warten
					fhemClient.request(in.readLine().toString(), false);
				}
			} catch (IOException e) {
				System.out.println("Fehler bei binden von Socket an Port "
						+ port + " " + e.getMessage());
			} catch (Exception e) {
				System.out.println("Fehler im Thread:" + e.getMessage());
				break;
			}
		}
	}
}
