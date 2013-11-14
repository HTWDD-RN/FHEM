package de.htwdd.sn.coapclient;

import ch.ethz.inf.vs.californium.coap.Response;

public interface CoapResponseListener {
	void notify(Response response, String method);
}
