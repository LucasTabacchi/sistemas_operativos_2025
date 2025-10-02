import socket

# Crear socket TCP
cliente = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Conectarse al servidor
cliente.connect(("127.0.0.1", 5000))

# Enviar mensaje
cliente.sendall("Hola servidor 👋".encode())

# Recibir respuesta
msg = cliente.recv(1024).decode()
print("Servidor dice:", msg)

cliente.close()
