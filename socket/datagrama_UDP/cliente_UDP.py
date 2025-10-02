import socket

HOST = "127.0.0.1"
PORT = 5005

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

sock.sendto("Hola servidor UDP 👋".encode(), (HOST, PORT))

data, _ = sock.recvfrom(1024)
print("Respuesta:", data.decode())
