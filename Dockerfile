FROM node:16.13.0-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV VUE_APP_BACKEND_SERVICE_URL "http://localhost"
RUN npm run build

FROM nginx:stable-alpine as production

COPY --from=build /app/dist /usr/share/nginx/html
ENV VUE_APP_BACKEND_SERVICE_URL "http://localhost"
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]