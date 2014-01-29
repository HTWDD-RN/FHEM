package de.htwdd.sn.tcpserver;

public class TcpServer {

	/**
	 * @param args
	 */
	public static void main(String[] args) {

		/**
		 * Erstellen des Sockets am unten definierten Port zum Empfangen von
		 * Anfragen des FHEM-Moduls.
		 */

		if (args.length != 1) {
			System.out.println("Port als Argument übergeben!");
			System.exit(-1);
		}
		
		try {
						
			Thread threadHandler = new Thread(new TcpServerThread(Integer.parseInt(args[0])));
			threadHandler.start();
			System.out.println("Starte Thread, der die eingehenden Verbindungen verarbeitet.");
		} 
		catch (Exception e) {
			System.exit(-1);
		}
	}
}
