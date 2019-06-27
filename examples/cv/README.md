# Egendata-cv

A Data Source/Data Sink offering a searchable CV

## Configuration

Create a file named `.env` in the project directory containing URLs needed for the services to find each other, example for a developers machine:

```bash
# Environment: development, test or production
NODE_ENV=development

# PORT is optional and defaults to 4000
PORT=4000

CLIENT_ID=http://192.168.1.42:4000
OPERATOR_URL=http://192.168.1.42:3000

# APM_SERVER is optional, apm will not be used if APM_SERVER is not set
APM_SERVER=http://localhost:8200
# APM_TOKEN is optional, defaults to ''
APM_TOKEN=abc

# Client keys (generate your own or use these FOR TESTING ONLY)
PUBLIC_KEY="-----BEGIN RSA PUBLIC KEY-----\nMIGJAoGBAMinl3TDhzy/hZr+2ZrUMwveG+1eawsHqxUXOsdqARKfsBHTRYFPr+GW\nff9iNezU5yBBORtc/jVnPwto/lBhn2+jLCtcPuK5od8AEeiWGJbfL2np8P0/qg0O\n80qhLrMU47uuoEdTe9mbnB8A+N4OrC2WhPBj3zd9yAp1zLNPOk6NAgMBAAE=\n-----END RSA PUBLIC KEY-----\n"
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIICXgIBAAKBgQDIp5d0w4c8v4Wa/tma1DML3hvtXmsLB6sVFzrHagESn7AR00WB\nT6/hln3/YjXs1OcgQTkbXP41Zz8LaP5QYZ9voywrXD7iuaHfABHolhiW3y9p6fD9\nP6oNDvNKoS6zFOO7rqBHU3vZm5wfAPjeDqwtloTwY983fcgKdcyzTzpOjQIDAQAB\nAoGBALGfGYV1KJvv9jdUbhCO03kn7pTbReqHqTyMSa4I+lYgId5FpXtorQsHCxYt\nPAsgFFELK6A7W5SuhrJ1CNri8Bxzh/7gYyj7njBTsjNfuoiK3cIkZBoTvY9K/OB+\nzinNKibWf3SZv9l1qFkaJvaC/+R5DMLb9RXUiWJbhOHqTThJAkEA5i5IOpmUmDl1\nHkYaf1cHbmCdnuQHI1YTlANAk/QsAdzfExK6tsTgIqSq5qd+Q38xtZJQrTvTT6p7\nJX+WQflunwJBAN8pdOrdr1tr1o8m958uLs33zjLk75ScnL+tqlCFEtZTVZWIXScB\n9YVZff5yYONfkuDK0kw631UMSxSA14vL71MCQQCbb+WWrN+LbEGKkAyUsVBzWQsX\noSSw2A+ghBG318tf9qctWhh8E7bHris6VyEMs3f+BTA1y5CG27kNOXteUfJBAkEA\n2QQDwvLaONlhycxnOdE7iujVCQFBSxASDwTff3Ypn2ti6wu1Kt3o2UjyEaNBPVwQ\nBbK3V5JY5OgTi1jQRA6KKQJAQiTQR1sA2xiUhYwF6K4hnojGW1Ew0ZBLND+APkej\nufcVAF5yh+ACYQPUMrgNwgcHFshCEJ9cpePZMotVy7zSFQ==\n-----END RSA PRIVATE KEY-----\n"
```

- `CLIENT_ID` is the URL where the phone app can reach this service (with protocol, http/https).
- `OPERATOR_URL` is the URL where this service can reach the operator (with protocol, http/https)
- `APM_SERVER` and `APM_TOKEN` is so that this service can reach [APM](https://www.npmjs.com/package/elastic-apm-node) for logging requests and errors

Good luck.

## Attributions

**Favicon**: Icons made by [Freepik](https://www.freepik.com/) from [Flaticon](https://www.flaticon.com/) is licensed by [CC 3.0 BY](http://creativecommons.org/licenses/by/3.0/)
