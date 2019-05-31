#!/bin/sh
echo '**** Running script for e2e & integration tests ****'
export DC_U=`id -u`
export DC_G=`id -g`

cleanup() {
  echo "Killing processes $APP_SERVER_PID, $CV_PID and $OPERATOR_PID"
  kill "$APP_SERVER_PID"
  kill "$CV_PID"
  kill "$OPERATOR_PID"

  docker-compose down
  echo 'Docker containers are down'
}
trap cleanup ERR INT TERM

# Tear down containers and start up again
docker-compose down
docker-compose up -d
echo 'Docker containers are up'

echo 'Sleep 3 seconds'
sleep 3

echo 'Run migrations for operator postgres'
DATABASE_URL=postgres://postgresuser:postgrespassword@localhost:5435/mydata \
npm --prefix ../operator run migrate up

# Start operator
PGPORT=5435 \
HOST=http://localhost:3001 \
PORT=3001 \
REDIS=redis://:fubar@localhost:6381/ \
NODE_ENV=development \
APM_SERVER= \
npm --prefix ../operator start &
OPERATOR_PID=$!
echo "Started Operator with PID $!"

# Start app server and store PID
PORT=1338 \
OPERATOR_URL=http://localhost:3001/api \
npm --prefix ../app run e2e:start &
APP_SERVER_PID=$!
echo "Started App server with PID $!"

# Start CV and store PID
REDIS=redis://:fubar@localhost:6382/ \
CLIENT_ID=http://localhost:4001 \
PORT=4001 \
OPERATOR_URL=http://localhost:3001 \
APM_SERVER= \
npm --prefix ../examples/cv start &
CV_PID=$!

# Wait for operator and app-server
sh wait-for.sh http://localhost:3001/health
sh wait-for.sh http://localhost:1338/health

# TODO: Create a while loop that checks app-server and cv health routes if ready
# echo 'Waiting for /examples/cv (/health route should return status code 200)'
sh wait-for.sh http://localhost:4001/health

# Run cypress e2e tests for /examples
echo 'Running cypress e2e tests for /examples'
CYPRESS_baseUrl=http://localhost:4001 CYPRESS_APP_SERVER_URL=http://localhost:1338 npm run cypress

# Run jest integration tests
# (has to be run _after_ cypress tests, since jest test suite will clean operator db including 'cv' client registration)
echo 'Running jest integration tests'
OPERATOR_PGPORT=5435 OPERATOR_URL=http://localhost:3001 APP_SERVER_URL=http://localhost:1338 npm run jest

cleanup
