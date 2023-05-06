FROM node:18-alpine

ARG RECIPE_PROMPT
ARG OPENAI_API_KEY
ENV RECIPE_PROMPT=${RECIPE_PROMPT}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci

COPY backend .

RUN npm install -g pm2

EXPOSE 4000

CMD ["pm2-runtime", "server.js"]
