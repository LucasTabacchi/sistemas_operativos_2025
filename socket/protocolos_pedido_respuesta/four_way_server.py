# Protocolo de 4 vías (REQ -> ACK_REQ -> RESP -> ACK_RESP)
# 1) Cliente: REQ, 2) Servidor: ACK_REQ, 3) Servidor: RESP, 4) Cliente: ACK_RESP
import socket, time
HOST, PORT = "127.0.0.1", 6003
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, PORT))
    s.listen(1)
    print(f"[4-way] Servidor en {HOST}:{PORT}")
    conn, addr = s.accept()
    with conn:
        req = conn.recv(1024).decode()
        print("[4-way] REQ:", req)
        conn.sendall(b"ACK_REQ")
        time.sleep(0.2)
        conn.sendall(b"RESP: ok (4-way)")
        ack_resp = conn.recv(1024).decode()
        print("[4-way] Recibí:", ack_resp, "-> cierre ordenado.")
