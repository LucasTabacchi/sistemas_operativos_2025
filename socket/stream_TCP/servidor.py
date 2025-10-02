import socket

# Crear socket TCP
servidor = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Asociar a IP y puerto
servidor.bind(("127.0.0.1", 5000))
servidor.listen(1)

print("Servidor escuchando en el puerto 5000...")

# Aceptar conexión
conn, addr = servidor.accept()
print("Conexión desde:", addr)

# Recibir mensaje
msg = conn.recv(1024).decode()
print("Cliente dice:", msg)

# Responder
conn.sendall("Hola cliente 👋".encode())

conn.close()
