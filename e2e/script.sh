# #!/bin/bash
echo '**** Running script for e2e & integration tests ****'

# TODO: Lint, Test

# Tear down containers
docker-compose down

# Start temporary databases, operator & cv (and run migrations), and start app-server
docker-compose up -d
echo 'Docker containers are up'

# Wait for operator and app-server
sh wait-for.sh http://localhost:3001/health
sh wait-for.sh http://localhost:1337/health

# Run jest integration tests
echo 'Running jest integration tests'
npm run jest

# TODO: Create a while loop that checks app-server and cv health routes if ready
echo 'Waiting for /examples/cv (/health route should return status code 200)'
sh wait-for.sh http://localhost:4001/health

# Run cypress e2e tests for /examples
echo 'Running cypress e2e tests for /examples'
npm run cypress

# Tear down
docker-compose down
echo 'Docker containers are down'
