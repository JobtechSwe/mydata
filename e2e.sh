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
docker run \
  --mount type=bind,source=$PWD/e2e,destination=/e2e \
  --mount type=bind,source=$PWD/client,destination=/client \
  --workdir=/e2e \
  --env OPERATOR_URL='http://operator-e2e:3000' \
  --name jest \
  --network=mydata_default \
  node:11-alpine \
  npm run test:jest

docker rm jest

# # Tear down
docker-compose -f docker-compose-e2e.yml down
echo 'Docker containers are down'