# Cliente 2 vías: envía REQ y espera RESP
import socket, time
HOST, PORT = "127.0.0.1", 6001
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as c:
    c.connect((HOST, PORT))
    c.sendall(b"REQ: dame_recurso")
    resp = c.recv(1024).decode()
    print("[2-way Cliente] Servidor respondió:", resp)
