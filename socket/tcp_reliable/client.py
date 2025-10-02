# Cliente para TCP 'confiable' (framing + reintentos simples)
import socket, struct, time

HOST, PORT = "127.0.0.1", 6100
RETRIES = 3

def send_framed(sock, payload: bytes):
    sock.sendall(struct.pack("!I", len(payload)) + payload)

def recv_exact(sock, n):
    buf=b""
    while len(buf)<n:
        chunk=sock.recv(n-len(buf))
        if not chunk:
            raise ConnectionError("peer cerró")
        buf+=chunk
    return buf

def recv_framed(sock):
    raw_len = recv_exact(sock, 4)
    (length,) = struct.unpack("!I", raw_len)
    return recv_exact(sock, length)

for attempt in range(1, RETRIES+1):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as c:
            c.settimeout(5.0)
            c.connect((HOST, PORT))
            for msg in ["hola", "mundo", "desde cliente"]:
                send_framed(c, msg.encode())
                resp = recv_framed(c).decode()
                print("[cli] resp:", resp)
            break
    except (socket.timeout, ConnectionError) as e:
        print(f"[cli] intento {attempt} fallo:", e)
        time.sleep(0.5)
