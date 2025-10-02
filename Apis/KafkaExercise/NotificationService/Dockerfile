FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm i --omit=dev
COPY . .
CMD ["node", "index.js"]
