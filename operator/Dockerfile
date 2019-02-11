FROM node:11

# Setup normal user.
ENV USER=operator-user
RUN adduser --disabled-password --gecos "" $USER

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
RUN npm install --production

COPY /migrations /app/migrations
COPY /lib /app/lib

# Use normal user.
USER $USER

CMD npm start
