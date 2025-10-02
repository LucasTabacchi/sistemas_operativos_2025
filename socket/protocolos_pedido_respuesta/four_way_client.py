# Cliente 4 vías
import socket
HOST, PORT = "127.0.0.1", 6003
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as c:
    c.connect((HOST, PORT))
    c.sendall(b"REQ: dame_recurso")
    ack_req = c.recv(1024).decode()
    print("[4-way Cliente] Recibí:", ack_req)
    resp = c.recv(1024).decode()
    print("[4-way Cliente] Recibí:", resp)
    c.sendall(b"ACK_RESP")
