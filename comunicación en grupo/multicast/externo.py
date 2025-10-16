import socket, sys

COORD_IP = '127.0.0.1'  
COORD_PORT = 6000

msg = "Mensaje externo via coordinador"
if len(sys.argv) > 1:
    msg = " ".join(sys.argv[1:])

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.sendto(msg.encode(), (COORD_IP, COORD_PORT))
print(f"[EXTERNO] Enviado '{msg}' a {COORD_IP}:{COORD_PORT}")
