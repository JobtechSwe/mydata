# #!/bin/bash

# # Tear down containers
docker-compose -f docker-compose-e2e.yml down

# # Start temporary databases, operator & cv (and run migrations), and start app-server
docker-compose -f docker-compose-e2e.yml up -d
echo 'Docker containers are up'

# # Wait
# # TODO: Create a while loop that checks app-server and cv health routes if ready
echo 'waiting 15 s'
sleep 15

# # Run cypress e2e tests
echo 'running cypress e2e tests'
npm --prefix ./e2e run test

# Run jest integration tests
echo 'running jest integration tests'
OPERATOR_URL='http://localhost:3001' npm --prefix ./e2e run test:jest

# # Tear down
docker-compose -f docker-compose-e2e.yml down
echo 'Docker containers are down'