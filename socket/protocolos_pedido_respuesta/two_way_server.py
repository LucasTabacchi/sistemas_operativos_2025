# Protocolo petición-respuesta de 2 vías (REQ -> RESP) sobre TCP
# Mensajes: 1) Cliente: REQ; 2) Servidor: RESP
import socket

HOST, PORT = "127.0.0.1", 6001

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, PORT))
    s.listen(1)
    print(f"[2-way] Servidor escuchando en {HOST}:{PORT}")
    conn, addr = s.accept()
    with conn:
        print("[2-way] Conexión:", addr)
        req = conn.recv(1024).decode()
        print("[2-way] Recibí REQ:", req)
        conn.sendall(b"RESP: ok (2-way)")
        print("[2-way] Envié RESP y cierro.")
