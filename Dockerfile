FROM node:16.13.0-alpine

# Transfering files and moving workdir
COPY . /srv/app
WORKDIR /srv/app

# Building project
RUN npm install
RUN npm run build

# Changing permissions
RUN chown -R node:node .
USER node


CMD ["vue-cli-service", "serve","--host=0.0.0.0","--port=8080"]