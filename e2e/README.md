# E2E / System wide integration tests for Egendata

## All
Run `script.sh`

## Cypress
-

## How to run Jest tests locally (not in docker)

Setup:

- In `/` run `docker-compose up -d`
- In `/operator`run `npm run dev`
- In `/app` run `OPERATOR_URL=http://localhost:3000/api npm run e2e:watch`
- In `/e2e` run `npm run jest:local` OR `npm run jest:local:watch`
