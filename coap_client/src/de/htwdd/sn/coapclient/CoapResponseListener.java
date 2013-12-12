package de.htwdd.sn.coapclient;

public interface CoapResponseListener {
	void notify(String uri, String method, String msg);
}
