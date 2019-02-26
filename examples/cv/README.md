# mydata-cv

A Data Source/Data Sink offering a searchable CV

## Configuration

Create a file named `.env` in the project directory containing URLs needed for the services to find each other, example for a developers machine:

```bash
# Environment: development, test or production
NODE_ENV=development

CLIENT_ID=http://192.168.1.42:4000
OPERATOR_URL=http://192.168.1.42:3000

# APM_SERVER is optional, apm will not be used if APM_SERVER is not set
APM_SERVER=http://localhost:8200
# APM_TOKEN is optional, defaults to ''
APM_TOKEN=abc

# Db url for migrations in npm script
DATABASE_URL=postgres://postgresuser:postgrespassword@localhost:5433/cv
```

- `CLIENT_ID` is the URL where the phone app can reach this service (with protocol, http/https).
- `OPERATOR_URL` is the URL where this service can reach the operator (with protocol, http/https)
- `APM_SERVER` and `APM_TOKEN` is so that this service can reach [APM](https://www.npmjs.com/package/elastic-apm-node) for logging requests and errors

Good luck.
