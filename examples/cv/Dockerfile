FROM node:10-alpine

# Setup user
ENV USER=cv-user
RUN adduser --disabled-password --gecos "" $USER

ADD ./client /app/client

# Create app dir
WORKDIR /app/examples/cv

# Install app dependencies
COPY ./examples/cv/package.json /app/examples/cv
COPY ./examples/cv/package-lock.json /app/examples/cv
RUN npm ci

# Bundle app source
COPY ./examples/cv/ /app/examples/cv

RUN npm run build

RUN chown -R $USER:$(id -gn $USER) /app/examples/cv
RUN chmod -R 777 /app/examples/cv

USER $USER
CMD [ "npm", "start" ]
