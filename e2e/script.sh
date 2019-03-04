# #!/bin/bash
echo '**** Running script for e2e & integration tests ****'

# TODO: Lint, Test

# Tear down containers
docker-compose down

# Start temporary databases, operator & cv (and run migrations), and start app-server
docker-compose up -d
echo 'Docker containers are up'

# TODO: Create a while loop that checks app-server and cv health routes if ready
echo 'Waiting for /examples/cv (/health route should return status code 200)'
sh wait-for-cv.sh

# Run jest integration tests
echo 'Running jest integration tests'
npm run jest

# Run cypress e2e tests for /examples
echo 'Running cypress e2e tests for /examples'
npm run cypress

# Tear down
docker-compose down
echo 'Docker containers are down'
