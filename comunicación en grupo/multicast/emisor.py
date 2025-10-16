import socket

MCAST_GRP = '224.1.1.1'
MCAST_PORT = 5007

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)

# Alcance de salto (TTL) y eco local para que receptores en la misma PC lo vean
sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 2)
sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_LOOP, 1)

mensaje = b'ID=1|Hola grupo (TP3)'
sock.sendto(mensaje, (MCAST_GRP, MCAST_PORT))
print(f"[EMISOR] Enviado {mensaje!r} a {MCAST_GRP}:{MCAST_PORT}")
