# E2E / System wide integration tests for MyData

## All
Run `script.sh`

## Cypress
-

## How to run Jest tests locally (not in docker)

Setup:
- In `/operator`run `npm run dev`
- In `/app` run `OPERATOR_URL=http://localhost:3000/api npm run e2e:server`

Then: In this folder run `npm run test:local`
