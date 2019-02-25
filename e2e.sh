#!/bin/bash

# 1. Start temporary databases
docker-compose -f docker-compose-e2e.yml up -d

# const config = {
#   host: process.env.PGHOST || 'localhost',
#   port: process.env.PGPORT || '5432',
#   user: process.env.PGUSER || 'postgresuser',
#   password: process.env.PGPASSWORD || 'postgrespassword',
#   database: process.env.PGDATABASE || 'mydata'
# }

# 2. Start operator with env
# Run migrations
# (DATABASE_URL=postgres://postgresuser:postgrespassword@localhost:5434/mydata npm --prefix ./operator run migrate:e2e up
# PGPORT=5434 PORT=3001 REDIS=redis://:fubar@localhost:6381/ NODE_ENV=e2e npm --prefix ./operator start)

# 3. Start cv with env
# Run migrations
# DATABASE_URL=postgres://postgresuser:postgrespassword@localhost:5435/cv npm --prefix ./examples/cv run migrate:e2e up
# PGPORT=5435 REDIS=redis://:fubar@localhost:6382/ npm --prefix ./examples/cv start

# 4. Start app:e2e

# 5. Run e2e-tests

# 6. Stop app:e2e
# 7. Stop cv
# 8. Stop operator

# 9. Stop and remove temporary databases
docker-compose -f docker-compose-e2e.yml down