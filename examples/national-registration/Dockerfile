FROM node:10-alpine

# Setup user
ENV USER=natreg-user
RUN adduser --disabled-password --gecos "" $USER

# Create app dir
WORKDIR /app

# Install app dependencies
COPY package.json /app
COPY package-lock.json /app
RUN npm ci

# Bundle app source
COPY . /app

USER $USER
CMD [ "node", "server.js" ]
