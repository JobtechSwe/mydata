# #!/bin/bash
echo '**** Running script for e2e & integration tests ****'

TESTS_ONLY=0

if [ $TESTS_ONLY -eq 0 ]
then
  # # Tear down containers
  docker-compose down

  # # Start temporary databases, operator & cv (and run migrations), and start app-server
  docker-compose up -d
  echo 'Docker containers are up'

  # TODO: Create a while loop that checks app-server and cv health routes if ready
  echo 'Waiting for /examples/cv (15 s)'
  sleep 15
fi

# Run jest integration tests
echo 'Running jest integration tests'
OPERATOR_URL='http://localhost:3001' npm run jest

# Run cypress e2e tests for /examples
# echo 'Running cypress e2e tests for /examples'
# npm run cypress

if [ $TESTS_ONLY -eq 0 ]
then
  # # Tear down
  docker-compose down
  echo 'Docker containers are down'
fi