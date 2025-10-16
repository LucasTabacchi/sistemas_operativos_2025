import socket, struct

MCAST_GRP = '224.1.1.1'
MCAST_PORT = 5007
BUFFER = 4096

# Socket UDP
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)

# Permite abrir varios receptores en la misma PC/puerto
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# Asociar al puerto
sock.bind(('', MCAST_PORT))

# Unirse al grupo multicast (INADDR_ANY = cualquiera de tus interfaces)
mreq = struct.pack('4sl', socket.inet_aton(MCAST_GRP), socket.INADDR_ANY)
sock.setsockopt(socket.IPPROTO_IP, socket.IP_ADD_MEMBERSHIP, mreq)

print(f"[RECEPTOR] Escuchando {MCAST_GRP}:{MCAST_PORT}")
while True:
    data, addr = sock.recvfrom(BUFFER)
    print(f"[RECEPTOR] desde {addr} | len={len(data)} | msg={data.decode(errors='replace')}")
