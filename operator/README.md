# mydata-operator
Backend for managing consents and data flow

## Configuration
Create a file named `.env` in the project directory, example for a developers machine:
```
NODE_ENV=development                # development, test or production
PORT=3000                           # optional, defaults to 3000
APM_SERVER=http://localhost:8200    # optional, apm will not be used if APM_SERVER is not set
APM_TOKEN=abc                       # optional, defaults to ''

# For Postgres migrations
DATABASE_URL=postgres://postgresuser:postgrespassword@localhost:5432/mydata
```
- `PORT` is the port for this service
- `APM_SERVER` and `APM_TOKEN` is so that this service can reach [APM](https://www.npmjs.com/package/elastic-apm-node) for logging requests and errors

Good luck.

## What data is stored and where?
- Personal data is stored encrypted in the `PDS` (eg. Dropbox) specified by the user
- Metadata (consents, permissions, id:s) and client data are stored in `Postgres` (this will probably change)
- Temporary consent requests are stored in `Redis`
- Requests and errors are logged in `elasticsearch/APM` for debugging purposes in test/dev
