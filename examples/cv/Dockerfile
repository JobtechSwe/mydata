FROM node:alpine

# Setup user
ENV USER=cv-user
RUN adduser --disabled-password --gecos "" $USER

# Create app dir
WORKDIR /app

# Install app dependencies
COPY package.json /app
COPY package-lock.json /app
RUN npm ci

# Bundle app source
COPY . /app

RUN npm run build

RUN chown -R $USER:$(id -gn $USER) /app
RUN chmod -R 777 /app

USER $USER
CMD [ "npm", "start" ]
