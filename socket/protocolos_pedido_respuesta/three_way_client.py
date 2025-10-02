# Cliente 3 vías
import socket
HOST, PORT = "127.0.0.1", 6002
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as c:
    c.connect((HOST, PORT))
    c.sendall(b"REQ: dame_recurso")
    ack = c.recv(1024).decode()
    print("[3-way Cliente] Recibí:", ack)
    resp = c.recv(1024).decode()
    print("[3-way Cliente] Recibí:", resp)
