FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --only=production || npm install
COPY index.js ./
ENTRYPOINT ["node", "index.js"]
