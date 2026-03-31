FROM node:20-alpine as build
WORKDIR /usr/src/app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY ssl /etc/nginx/ssl
COPY nginx.conf /etc/nginx/conf.d/default.conf

