# egendata-operator
Backend for managing consents and data flow

## Configuration
Create a file named `.env` in the project directory, example for a developers machine:
```
HOST=http://localhost:3000
# development, test or production
NODE_ENV=development
# optional, defaults to 3000
PORT=3000
# optional, apm will not be used if APM_SERVER is not set
APM_SERVER=http://localhost:8200
# optional, defaults to ''
APM_TOKEN=abc

# For Postgres migrations
DATABASE_URL=postgres://postgresuser:postgrespassword@localhost:5432/mydata


# Client keys (generate your own or use these FOR TESTING ONLY)
PUBLIC_KEY="-----BEGIN RSA PUBLIC KEY-----\nMIGJAoGBAOBHQz1EEVPboCx5o1jL2Dlhf5hCFuyQVMCnRoI7qH/zE8A7OR3uw74u\nqvHguOzyK5RO/slRvHz6aX7sgwpiOkXHh4VDWRwRb0gvnFIopwe3Y7fn1zLkpsET\nGqPgWvYmSYIT5dwwlrkYY6ek0oH3amYm186SNUFVDbzSf+Pyy7ILAgMBAAE=\n-----END RSA PUBLIC KEY-----\n"
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIICXQIBAAKBgQDgR0M9RBFT26AseaNYy9g5YX+YQhbskFTAp0aCO6h/8xPAOzkd\n7sO+Lqrx4Ljs8iuUTv7JUbx8+ml+7IMKYjpFx4eFQ1kcEW9IL5xSKKcHt2O359cy\n5KbBExqj4Fr2JkmCE+XcMJa5GGOnpNKB92pmJtfOkjVBVQ280n/j8suyCwIDAQAB\nAoGBAMwGqBl86ZJy0nSDN2EZF5ujoXJ+dOJBrogP5CmnYfL7y3Ttq1kakwFY7PPb\nLf+HkrN5ZXj5HVJIb14ihFcW4tBR2EtABhuv2J6ZNx0KnDxUj+mJlb7GNgr5eayI\nUibIu8/eQh2+CGMilI/KR8zlRiHpD8BgttfBaRktGIrzklQJAkEA9C8JgnAGUbPp\n3rc3dEZR6pEcOGI5Fjo3uvhbOYO5oa4tJszNF1Fh1oUmn17J6yoMnh0qPG4snL2B\nOgSB8OCOnwJBAOshovf7obbVZFzQ7ikYImT/pqz7f7eV1+Uv1MRfGsXAc0EAXDrh\nAPiJ5icWkeRDCFxaTAy/8lrDGgDcL2CSoRUCQQCem4L4x91C6rMJaEbL7vU8gL8s\n3JgqGOykNLfElwxXubQ4VKUO9Vywo9JfiIlth+WkOlt53zJ5KRqsXcstdB8PAkAo\nw6IfYA6/Reuqc8Z2dWqxG+lnoAqaZ24Qm+RFTz+y/RR+NnPG+W9Tp4SxTiZo7n4q\nlLUOmNCJj72YXJQSKBmpAkAyDc4PrJ3nFt45BOEnRuXE60Lv3VzLPdWggOLcKTbW\nr6NAWQS0VNdXEmJVmdoKFhJAeUvLrXPtBGqPS7HO6A8A\n-----END RSA PRIVATE KEY-----\n"
```
- `PORT` is the port for this service
- `APM_SERVER` and `APM_TOKEN` is so that this service can reach [APM](https://www.npmjs.com/package/elastic-apm-node) for logging requests and errors

Good luck.

## What data is stored and where?
- Personal data is stored encrypted in the `PDS` (eg. Dropbox) specified by the user
- Metadata (consents, permissions, id:s) and client data are stored in `Postgres` (this will probably change)
- Temporary consent requests are stored in `Redis`
- Requests and errors are logged in `elasticsearch/APM` for debugging purposes in test/dev
