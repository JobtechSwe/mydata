#!/bin/sh
echo '**** Running script for e2e & integration tests ****'

# TODO: Lint, Test

export DC_U=`id -u`
export DC_G=`id -g`

# Setup npm link for client package (cv)
cd ../examples/cv
npm install file:../../client
cd -
ls -la ../examples/cv/node_modules/\@mydata/

# Tear down containers
docker-compose down

# Start temporary databases, operator & cv (and run migrations), and start app-server
docker-compose up -d
echo 'Docker containers are up'

# Wait for operator and app-server
sh wait-for.sh http://localhost:3001/health
sh wait-for.sh http://localhost:1337/health

# TODO: Create a while loop that checks app-server and cv health routes if ready
echo 'Waiting for /examples/cv (/health route should return status code 200)'
sh wait-for.sh http://localhost:4001/health

# Run cypress e2e tests for /examples
echo 'Running cypress e2e tests for /examples'
npm run cypress

# Run jest integration tests
# (has to be run _after_ cypress tests, since jest test suite will clean operator db including 'cv' client registration)
echo 'Running jest integration tests'
npm run jest

# Tear down
docker-compose down
echo 'Docker containers are down'

# Restore cv package(s)
cd ../examples/cv
git checkout package.json
git checkout package-lock.json
npm ci
cd -