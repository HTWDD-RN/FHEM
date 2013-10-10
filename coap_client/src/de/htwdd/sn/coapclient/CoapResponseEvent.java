package de.htwdd.sn.coapclient;

import ch.ethz.inf.vs.californium.coap.Response;

public interface CoapResponseEvent {
	void response(Response response, String method);
}
