#include "contiki.h"
#include "contiki-net.h"

#include "net/rime.h"

#include "dev/button-sensor.h"
#include "dev/leds.h"

#include <stdio.h>
#include <string.h>

/*---------------------------------------------------------------------------*/
PROCESS(pairing_client_process, "Pairing client process");
AUTOSTART_PROCESSES(&pairing_client_process);
/*---------------------------------------------------------------------------*/
static struct unicast_conn unicast;
static struct broadcast_conn broadcast;

static void
unicast_recv(struct unicast_conn *c, const rimeaddr_t *from)
{
  printf("unicast message received from server with rime-address %d.%d: '%s'\n",
         from->u8[0], from->u8[1], (char *)packetbuf_dataptr());

  // Todo: Adresse korrekt übergeben
  //memcpy(&uip_lladdr.addr, &from->u8, sizeof(uip_lladdr)); //example: uip_lladdr = {{0x00,0x06,0x98,0x00,0x02,0x32}};
  //memcpy(&uip_lladdr.addr, &from.u8, sizeof(rimeaddr_t));

  unicast_close(&unicast);
  broadcast_close(&broadcast);
}

static void
broadcast_recv(struct broadcast_conn *c, const rimeaddr_t *from)
{
  puts("broadcast received.");
  // clients shouldn't receive broadcast packets in this case
}

static const struct unicast_callbacks unicast_callbacks = {unicast_recv};
static const struct broadcast_callbacks broadcast_callbacks = {broadcast_recv};

static uint8_t pm_active;
static uint32_t pairing_mode_period = 10;
static uint32_t broadcast_period = 2;
static struct etimer et_pairing_mode; // Define the timer
static struct etimer et_broadcast; // Define the timer
/*---------------------------------------------------------------------------*/
PROCESS_THREAD(pairing_client_process, ev, data)
{
  PROCESS_EXITHANDLER(goto exit)

  PROCESS_BEGIN();

  puts("Client: pairing preparation");

#if PLATFORM_HAS_BUTTON
  SENSORS_ACTIVATE(button_sensor);
  puts("Press a button to start pairing-mode on client");
#endif
#if PLATFORM_HAS_LEDS
  leds_off(LEDS_ALL);
  leds_on(LEDS_RED);
  puts("LED will blink, if button pressed");
#endif

pm_active = 0;

  while(1) {
    //PROCESS_WAIT_EVENT();
	PROCESS_PAUSE();

    //if(ev == sensors_event) {  // If the event it's provoked by the user button, then...
      //if(data == &button_sensor) {
	if(button_sensor.value(0) == 1 && pm_active == 0) {		
        leds_on(LEDS_GREEN);
        SENSORS_DEACTIVATE(button_sensor);
	unicast_open(&unicast, 26, &unicast_callbacks);
	broadcast_open(&broadcast, 26, &broadcast_callbacks);
        puts("Turning on Pairing-mode( green LED ;) ) on client for 120 seconds.");

	pm_active = 1;
	etimer_set(&et_pairing_mode, CLOCK_SECOND*pairing_mode_period);  // Set the timer
	etimer_set(&et_broadcast, CLOCK_SECOND*broadcast_period);
      }
    //}

    if(etimer_expired(&et_broadcast) && pm_active == 1) {
	leds_on(LEDS_YELLOW);
	packetbuf_copyfrom("Hello, I'm a node and seeking a new home", 42); // 42 = length of characters + 1 
    	broadcast_send(&broadcast);
    	puts("broadcast message sent");
        etimer_reset(&et_broadcast);
	leds_off(LEDS_YELLOW);
    }

    if(etimer_expired(&et_pairing_mode) && pm_active == 1) {  // If the event it's provoked by the timer expiration, then...
      leds_off(LEDS_GREEN);
      SENSORS_ACTIVATE(button_sensor);
      unicast_close(&unicast);
      broadcast_close(&broadcast);
      puts("Turning off Pairing-mode( green LED ;) ) on client.");
      pm_active = 0;
      etimer_stop(&et_broadcast);
      etimer_stop(&et_pairing_mode);
    }
  }

  exit:
  leds_off(LEDS_ALL);
  PROCESS_END();
}
/*---------------------------------------------------------------------------*/
