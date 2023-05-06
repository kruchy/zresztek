FROM node:18-alpine AS build

ARG REACT_APP_API_PATH
ENV REACT_APP_API_PATH=${REACT_APP_API_PATH}

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
