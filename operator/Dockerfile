FROM node:12

# Setup normal user.
ENV USER=operator-user
RUN adduser --disabled-password --gecos "" $USER

WORKDIR /app

COPY ./messaging /app/messaging

# If a relative path is provided, it will be relative to the path of the previous WORKDIR instruction
WORKDIR operator

COPY ./operator/package.json .
COPY ./operator/package-lock.json .
RUN npm install --production

COPY ./operator/migrations ./migrations
COPY ./operator/lib ./lib

# Use normal user.
USER $USER

CMD npm start
