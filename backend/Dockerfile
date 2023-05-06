FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci

COPY backend .

RUN npm install -g pm2

EXPOSE 4000

CMD ["pm2-runtime", "server.js"]
