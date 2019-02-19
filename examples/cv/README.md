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

# Client keys
PUBLIC_KEY="-----BEGIN RSA PUBLIC KEY-----\nMIGJAoGBAMcq3gQT5ZpoDr73G5HrQpsvuB+fsgQqdKtfIM5kJLB7mmoOUwxoD+bG\nIrvC+bIHBmtQE+SudYjLtYOjEX3HnoPw2oE7+zNhIlRFOBB2aGlMozWzssJqqfhA\nvDdkZGeS8SfJjo1VjozxA+iQVjjMmU2+Wnw1Z0cY1p3+OZchkqOnAgMBAAE=\n-----END RSA PUBLIC KEY-----\n"
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIICXAIBAAKBgQDHKt4EE+WaaA6+9xuR60KbL7gfn7IEKnSrXyDOZCSwe5pqDlMM\naA/mxiK7wvmyBwZrUBPkrnWIy7WDoxF9x56D8NqBO/szYSJURTgQdmhpTKM1s7LC\naqn4QLw3ZGRnkvEnyY6NVY6M8QPokFY4zJlNvlp8NWdHGNad/jmXIZKjpwIDAQAB\nAoGAZSKYcJul6N1UN5aFcnhzbxgxOCXAoKrqaac5onRpyRBK3fX+J/ujr30HYC7m\n2ocEtHOKVoJcfqVqu7iPhj5aeCD9iKl9vtspMF3El4PDsq4i3R7pM+gajOWk6vhV\nooFtXD/EwbscwmcVwxS19JHE1q/QDNKuPOMcAmjzYmIfVeECQQD4AZ9otmTcPUoI\nMO+RZztC2V+HqV+W7lL6b7S1sfUJmWj/nqdWEeNrSMGqPd59j0Li2dsssd1RNuSR\nGsiOBLcxAkEAzZZCfVEgoz/E+aBK3rfZ5A1l8IpCs1/pfZQxSSSo5jFWwvmt83+K\n/ez7oeCeQFndSCVt2ZVsWqb3eX3UjqoCVwJABgwUFPuNjgk4iuaWkNcRjNm8CJTK\nreV1xIGAyIVkUi2Zb9Iwhlq9TtphToNfr3QUz288duSHXvmVrSwYA859oQJBAKsr\n3nREpe4GXFSTF4NUhECSvzuFgn+i7d83Ecoakd4HWnvAMws4OFuvgtuHD3v41nsJ\nXur4tFzOA+LN17po5sUCQFJbubbpJDp70dyJ8XlJTbXvFMJtTbs3dy8n5dmzXwCa\nU1/LgYCwvPycA5NAPzE42fHWjbZkNvRamMQRlBX8Nl0=\n-----END RSA PRIVATE KEY-----\n"
```

- `CLIENT_ID` is the URL where the phone app can reach this service (with protocol, http/https).
- `OPERATOR_URL` is the URL where this service can reach the operator (with protocol, http/https)
- `APM_SERVER` and `APM_TOKEN` is so that this service can reach [APM](https://www.npmjs.com/package/elastic-apm-node) for logging requests and errors

Good luck.
