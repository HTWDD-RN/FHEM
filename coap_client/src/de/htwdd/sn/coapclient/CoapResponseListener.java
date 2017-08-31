package de.htwdd.sn.coapclient;

import java.util.HashMap;

public interface CoapResponseListener {
	void notify(String uri, String method, String msg, HashMap<String, String> options);
}

