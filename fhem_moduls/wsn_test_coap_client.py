from collections import deque
import re
import socket
import random

wsndevs = {
	'dummy' : 'on',
}
	
gwport = 50009
	
# open a socket for incoming gateway commands
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server_socket.setblocking(0)
server_socket.settimeout(5)
server_socket.bind(('', gwport))
server_socket.listen(5)
print "Listening on port " + str(gwport)
	
run = True
run2 = True

# load coAP-resources from file
f = open('resources.res', 'r')

for line in f:
	m = re.match("(.*):(.*)", line)
	if m != None:			
		uri, val  = m.group(1,2)
		wsndevs[uri] = val
	#print uri + "::" + val

f.close()

data = None
	
# main loop for incoming connections
while run == True:
	try:
		komm, addr = server_socket.accept()
		komm.setblocking(0)
		komm.settimeout(5)
		run2 = True
	except Exception,e:		
		print "Hier1"
		run2 = False
	while run2:
		#print "Hier2"
		# receive data
		#data = komm.recv(1024)
		#print "Hier3"
		data = None		

		#while not data:
		#	data = komm.recv(1024)
		#	print "Hier3"
			
			
		try:
			data = komm.recv(1024)
		except Exception,e:
			print "Hier3"
			data = "timeout"
		#if not data or data == 'quit': 
		#	print "Hier4"
		#	komm.close()
		#	#run = False 
		#	#break
		
		if data == "timeout":
			wkt = random.randint(1, 100)
			
			if (wkt <= 25):
				uri = "/wohnzimmer/temp2"
				temp = random.randint(15, 30)
				msg = "0|"+uri+"|"+str(temp)
				msg += "\n"
				print msg
				komm.send(msg)
			
		else:
			print "Received data:" + data
				
			# parse received message
			#m = re.match("(...)=(.*)=(.*)", data)
			m = re.match("(.*)\|(.*)", data)				
			
			if m != None:			
				cmd, val  = m.group(1,2)
			else:
				komm.close() 
				break 
			
			#print "Received Data from" + addr
					
			#---------------
			
			ret = "fail"
			print cmd
			print val
			
			if cmd == "set":
				m = re.match("(.*)=(.*)", val)
				uri, val  = m.group(1,2)
				if uri in wsndevs:
					wsndevs[uri] = val
					print "SET " + uri +" " + val
					ret = "0|"+uri+"|"+val
				else:
					ret = "1|no such device"			
			elif cmd == "get":
				uri = val
				if uri in wsndevs:
					print "GET" + uri + " " + wsndevs[uri]
					ret = "0|"+uri+"|"+wsndevs[uri]
				else:
					ret = "1|no such device"
			print ret		
			# answer the gateway
			ret += "\n"
			komm.send(ret) 
				
			#komm.close()
			#break;
