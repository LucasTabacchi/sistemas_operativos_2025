import socket

HOST = "127.0.0.1"
PORT = 5005

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((HOST, PORT))

print("Servidor UDP esperando mensajes...")

while True:
    data, addr = sock.recvfrom(1024)  # recibe datagrama
    print(f"Recibido desde {addr}: {data.decode()}")
    sock.sendto("Hola cliente UDP 👋".encode(), addr)
