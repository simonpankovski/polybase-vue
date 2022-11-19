FROM node:12-alpine

# Transfering files and moving workdir
COPY . /srv/app
WORKDIR /srv/app

# Building project
RUN npm install
RUN npm run build

# Changing permissions
RUN chown -R node:node .
USER node


CMD ["npm","run","serve"]