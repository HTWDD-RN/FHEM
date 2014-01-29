#include "contiki.h"

#include "net/rime.h"
//#include "net/rime/unicast.h"
//#include "net/rime/broadcast.h"

#include "dev/button-sensor.h"
#include "dev/leds.h"

#include <stdio.h>
#include <string.h>

/*---------------------------------------------------------------------------*/
PROCESS(pairing_server_process, "Pairing server process");
AUTOSTART_PROCESSES(&pairing_server_process);
/*---------------------------------------------------------------------------*/
static struct unicast_conn unicast;
static struct broadcast_conn broadcast;

static void
unicast_recv(struct unicast_conn *c, const rimeaddr_t *from)
{
  // server shouldn't receive unicast packets in this case
}

static const struct unicast_callbacks unicast_callbacks = {unicast_recv};

static void
broadcast_recv(struct broadcast_conn *c, const rimeaddr_t *from)
{
  printf("broadcast message received from client with rime-address %d.%d: '%s'\n",
         from->u8[0], from->u8[1], (char *)packetbuf_dataptr());

  // Todo: transit a free ip-address from the local network
  uip_lladdr_t new_address = {{0x00,0x06,0x98,0x00,0x02,0x32}}; // example

  unicast_open(&unicast, 26, &unicast_callbacks); 
  packetbuf_copyfrom(printf("Welcome new node, your IP-address is:%d.%d.%d.%d.%d", new_address.addr[0], new_address.addr[1], new_address.addr[2], new_address.addr[3], new_address.addr[4], new_address.addr[5]), 47);
  unicast_send(&unicast, &from);
  unicast_close(&unicast); // Todo: Receive an ACK
  broadcast_close(&broadcast);
}

static const struct broadcast_callbacks broadcast_callbacks = {broadcast_recv};
/*---------------------------------------------------------------------------*/
PROCESS_THREAD(pairing_server_process, ev, data)
{
  PROCESS_EXITHANDLER(goto exit)

  PROCESS_BEGIN();

  printf("Server: pairing preparation\n");

#if PLATFORM_HAS_BUTTON
  SENSORS_ACTIVATE(button_sensor);
  printf("Press a button to start pairing-mode on Server\n");
#endif
#if PLATFORM_HAS_LEDS
  leds_off(LEDS_ALL);
  printf("LED will blink, if button pressed\n");
#endif

  while(1) {

    static uint32_t pairing_mode_period = 120;
    static uint32_t broadcast_period = 5;
    static struct etimer et_pairing_mode; // Define the timer

    PROCESS_WAIT_EVENT();

    if(ev == sensors_event) {  // If the event it's provoked by the user button, then...
      if(data == &button_sensor) {		
        leds_toggle(LEDS_GREEN);
        SENSORS_DEACTIVATE(button_sensor);
	unicast_open(&unicast, 26, &unicast_callbacks);
	broadcast_open(&broadcast, 26, &broadcast_callbacks);
        printf("Turning on Pairing-mode( green LED ;) ) on server for 120 seconds.\n");

	etimer_set(&et_pairing_mode, CLOCK_SECOND*pairing_mode_period);  // Set the timer
      }
    }

    if(etimer_expired(&et_pairing_mode)) {  // If the event it's provoked by the timer expiration, then...
      leds_toggle(LEDS_GREEN);
      SENSORS_ACTIVATE(button_sensor);
      broadcast_close(&broadcast);
      unicast_close(&unicast);
      printf("Turning off Pairing-mode( green LED ;) ) on client.\n");
    }
  }

  exit:
  leds_off(LEDS_ALL);
  PROCESS_END();
}
/*---------------------------------------------------------------------------*/
