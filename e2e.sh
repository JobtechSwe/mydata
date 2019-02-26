#!/bin/bash

# Tear down containers
docker-compose -f docker-compose-e2e.yml down

# Start temporary databases, operator & cv (and run migrations), and start app-server
docker-compose -f docker-compose-e2e.yml up -d
echo 'Docker containers are up'

# Wait
# TODO: Create a while loop that checks app-server and cv health routes if ready
echo 'waiting 20 s'
sleep 20

# Run e2e tests
echo 'running tests'
npm --prefix ./e2e run test

# Tear down
docker-compose -f docker-compose-e2e.yml down
echo 'Docker containers are down'