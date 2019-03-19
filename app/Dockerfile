FROM node:10

WORKDIR /app

COPY package.json /app/
COPY package-lock.json /app/

RUN npm ci

COPY __e2e__/webpack.config.js /app/__e2e__/
COPY __e2e__/src /app/__e2e__/src
COPY lib /app/lib

RUN npm run e2e:build

CMD node /app/__e2e__/dist
