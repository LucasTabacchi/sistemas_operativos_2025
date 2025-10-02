FROM node:20-alpine
WORKDIR /app

# Necesario para compilar sqlite3 en Alpine
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .
# Asegurar carpeta de datos (se mapeará volumen en compose)
RUN mkdir -p /app/data

EXPOSE 80
CMD ["npm", "start"]
