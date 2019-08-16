#!/bin/sh
echo '**** Running script for e2e & integration tests ****'
export DC_U=$(id -u)
export DC_G=$(id -g)

EXIT_CODE=0
cleanup() {
  echo "Killing processes $APP_SERVER_PID, $CV_PID and $OPERATOR_PID"
  kill -9 "$APP_SERVER_PID" "$CV_PID" "$OPERATOR_PID"

  sleep 5
  docker-compose down
  echo 'Docker containers are down'
  exit "$EXIT_CODE"
}
trap cleanup INT TERM

waitfor() {
  echo "Waiting for $1 to get ready..."

  while true; do
    STATUS_CODE=$(curl -sL -w "%{http_code}" -I "$1" -o /dev/null)
    printf .
    if [ "$STATUS_CODE" = "200" ]; then
      echo
      return 0
    fi

    sleep 1
  done
}

# Tear down containers and start up again
docker-compose down
docker-compose up -d
echo 'Docker containers are up'

echo 'Sleep 3 seconds'
sleep 3

echo 'Run migrations for operator postgres'
DATABASE_URL=postgres://postgresuser:postgrespassword@localhost:5435/mydata \
npm --prefix ../operator run migrate up

export PUBLIC_KEY="-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAqBSF/c7PshMQzyJrwIiRs1tBv9V2+GtM/b83hJrMw628aCEmc5Y7
eVo5kYKxcuV2EQvlZdGzbWYlySeCh/cjA6xv+mm1cnri3ENAsO1CTSmliNOfOO5W
uhj3LI+uwjMyZPo77uixHUOV164hgq2wX5AAQoDEeHMgiT0pjnYh+/AhL4Yyt/OO
b2C06fXC1/8S8mOd0FeFN+6zMw8chNkSpyLFidT92pCcpLphNEY5lABfDtN9ZbYr
k5AKdKfLNz+X+oStlROtk2fRJnWkw4h4749NCeKbaxCksNPKefzJqd7Q9eyeD7l8
P8pjtG3Pd810E6GY0IPYVv/mFhsUdDb3fwIDAQAB
-----END RSA PUBLIC KEY-----"

export PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAqBSF/c7PshMQzyJrwIiRs1tBv9V2+GtM/b83hJrMw628aCEm
c5Y7eVo5kYKxcuV2EQvlZdGzbWYlySeCh/cjA6xv+mm1cnri3ENAsO1CTSmliNOf
OO5Wuhj3LI+uwjMyZPo77uixHUOV164hgq2wX5AAQoDEeHMgiT0pjnYh+/AhL4Yy
t/OOb2C06fXC1/8S8mOd0FeFN+6zMw8chNkSpyLFidT92pCcpLphNEY5lABfDtN9
ZbYrk5AKdKfLNz+X+oStlROtk2fRJnWkw4h4749NCeKbaxCksNPKefzJqd7Q9eye
D7l8P8pjtG3Pd810E6GY0IPYVv/mFhsUdDb3fwIDAQABAoIBAGM7WrAx/WVA5Fem
Fr+g4YRmiDbdrFOV5eqZjgl36xRL6kP/7lenho1quzoxUtpmpoIB5/lpCOm5uO09
qk7jlYSBtcq9xiZEbtNj0TmjmdU8lUJmzkYqUIGmY6enXKHC4CnFosS2FHsWf8zK
PXaNXOfOeJjKtTP3pGnh9jrpe77lXYJLetaLjqm5E0dWfddrjCQZuZTBX1PbADpC
RmQLnitB4xqoK4Jb7edYkpRlcRmYotwhKze9uwzdalbcAFc9pUhIZd8qpdg+GH4O
qTvT0vlXNfnhFrk0C/gFz76fGzl/9IBYsnabmo6Ce0cxjalxIEnknbz1QZS0KPej
kHF6QqECgYEA0Iir8clWA+xmFR7f9vPug92wP44//DHVREWBw2Epv96MOH19JvAU
BUzMUkvSbfLYs26sKPfjPBREKxnxPR75KQyBnaV5gykMAGqB9B4a4OTuZlu84MWP
oBWl1WkayunK9M/4I4jG2vOi20PtnIqmo5jkC4ik7cgT6cUCjGESQ3UCgYEAzlaa
VQhMJuMn8+yUInJVZft+RHblug5eHEtojpWNYUtGIiaaA+P0FLBBTkKDlduvWwiI
dlM/FMvblcCQIe+IHfWR6IglPBoJWCFYtpWfCgv9ghP3TgRqx38/KU5KSHqcfNgj
g/raRjCEhUdrwxBOQ0r9p0/zCiUgxee7xQtRdKMCgYASTj0Rz4O+em0Ho5szeXxR
lQ9YtOsG/3TiNlvKw+e/URDsEJAA8AhB4tj4zHEfd7bwIWH5grEu3/SP+AoGPIbQ
xKlIJnOBQQQtsSvROydO4KnQ0HLHJHCUM/JHxp80est3LB5zOBmEtOhx6Qedu0of
iFdUb91ShkLBPasYmZjZ1QKBgEf/iBKrtobLNKG0p2vtoUbYnpKdOkPVx5jv5yf5
nz+X2H0KIyvAWubtKZx5MRkVcva834EKQzSqfZCfhKuSvVhW2/bbqsJyA1ixKhdr
1fbXgDnnZZ/fgrLh/9QV8W2g+wHFGX9wBMIBI/ytkziZc/WfMSs0hoW/ttPXrHlx
HZcpAoGBAJczhk3/f+tuEL2RLkLB/xtbh14dP774Tp2f/5L6s8aaHBjyWueaop3O
meQrVLTXGDKPC5TgynJ7YDq0MIrJQFYGug+ODGpuLc1cPp34F5Mory0EIJki/8Pg
C8QryBR3Wo6wHAXgIQBnvKTHBXIBCboDc0s1y9U/wXwcIVBp/sJJ
-----END RSA PRIVATE KEY-----"

# Start operator
cd ../operator || exit 2
PGPORT=5435 \
HOST=http://localhost:3001 \
PORT=3001 \
REDIS=redis://:fubar@localhost:6381/ \
NODE_ENV=development \
APM_SERVER='' \
node ../operator/lib/server.js &
OPERATOR_PID=$!
cd ../e2e || exit 2

# Build app server
npm --prefix ../app run e2e:build

# Start app server
cd ../app || exit 2
PORT=1338 \
OPERATOR_URL=http://localhost:3001/api \
NODE_ENV=development \
node __e2e__/dist/index.js &
APP_SERVER_PID=$!
cd ../e2e || exit 2

# Start CV
cd ../examples/cv || exit 2
REDIS=redis://:fubar@localhost:6382/ \
CLIENT_ID=http://localhost:4001 \
PORT=4001 \
OPERATOR_URL=http://localhost:3001 \
APM_SERVER='' \
node server.js &
CV_PID=$!
cd ../../e2e || exit 2

# Wait for operator, app-server and CV
waitfor http://localhost:3001/health
waitfor http://localhost:1338/health
waitfor http://localhost:4001/health

# Run e2e tests for /examples
echo 'Running e2e tests for /examples'
CYPRESS_baseUrl=http://localhost:4001 CYPRESS_APP_SERVER_URL=http://localhost:1338 npm run test-e2e
EXIT_CODE=$?

# Run integration tests
echo 'Running integration tests'
OPERATOR_PGPORT=5435 OPERATOR_URL=http://localhost:3001 APP_SERVER_URL=http://localhost:1338 npm run test-integration
if [ $EXIT_CODE = 0 ]; then
  EXIT_CODE=$?
fi

cleanup
