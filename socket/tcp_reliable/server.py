# TCP 'confiable' a nivel de aplicación: framing + timeouts + múltiples clientes
import socket, threading, struct

HOST, PORT = "127.0.0.1", 6100

def send_framed(conn, payload: bytes):
    # prefijo de longitud de 4 bytes (big-endian)
    conn.sendall(struct.pack("!I", len(payload)) + payload)

def recv_exact(conn, n):
    buf=b""
    while len(buf)<n:
        chunk=conn.recv(n-len(buf))
        if not chunk:
            raise ConnectionError("peer cerró")
        buf+=chunk
    return buf

def recv_framed(conn):
    raw_len = recv_exact(conn, 4)
    (length,) = struct.unpack("!I", raw_len)
    return recv_exact(conn, length)

def handle_client(conn, addr):
    conn.settimeout(10.0)
    try:
        while True:
            data = recv_framed(conn)
            msg = data.decode()
            print(f"[srv] {addr} -> {msg}")
            resp = msg.upper().encode()
            send_framed(conn, resp)
    except (ConnectionError, TimeoutError, socket.timeout) as e:
        print(f"[srv] cierre {addr}: {e}")
    finally:
        conn.close()

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    s.bind((HOST, PORT))
    s.listen(5)
    print(f"[srv] escuchando en {HOST}:{PORT}")
    while True:
        conn, addr = s.accept()
        threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
