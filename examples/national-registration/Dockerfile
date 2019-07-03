FROM node:12-alpine

# Setup user
ENV USER=natreg-user
RUN adduser --disabled-password --gecos "" $USER

ADD ./client /app/client

# Create app dir
WORKDIR /app/examples/national-registration

# Install app dependencies
COPY ./examples/national-registration/package.json /app/examples/national-registration
COPY ./examples/national-registration/package-lock.json /app/examples/national-registration
RUN npm ci

# Bundle app source
COPY ./examples/national-registration/ /app/examples/national-registration

USER $USER
CMD [ "node", "server.js" ]
