import socket

MCAST_GRP = '224.1.1.1'
MCAST_PORT = 5007
EXTERNAL_PORT = 6000  # puerto donde escucha el coordinador

# Recibe externo (unicast)
rx = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
rx.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
rx.bind(('', EXTERNAL_PORT))

# Reenvía al grupo (multicast)
tx = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
tx.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 2)

print(f"[COORD] Escuchando externo en 0.0.0.0:{EXTERNAL_PORT} → {MCAST_GRP}:{MCAST_PORT}")
while True:
    data, addr = rx.recvfrom(4096)
    print(f"[COORD] recibido de {addr}: {data!r} → reenviando al grupo")
    tx.sendto(data, (MCAST_GRP, MCAST_PORT))
