# mydata-client

Client library for mydata operator

## Install

`npm install @mydata/client`

## Create client

```javascript
const { create } = require('@mydata/client')

const config = {
  displayName: 'The name of your service',
  description: 'A nice description of your fantastic service',
  clientId: 'https://mycv.work', // Application domain with protocol
  operator: 'https://smoothoperator.work', // URL of Operator
  clientKeys: {
    publicKey: '-----BEGIN RSA PUBLIC KEY-----\nMIGJ...',
    privateKey: '-----BEGIN RSA PRIVATE KEY-----\nMIICX...'
  },
  jwksPath: '/jwks',     // endpoint for keys in jwks format
  eventsPath: '/events'  // endpoint for events - webhook style
}
const client = create(config)
```

## Provide routes

```javascript
const express = require('express')
const app = express()

// Routes used by the operator
app.use(client.routes)
```


## Connecting
```
await client.connect()
```


## Subscribe to events

```javascript
client.events.on('CONSENT_APPROVED', consent => {
  // take action (eg. log in and redirect user)
})

client.events.on('LOGIN_APPROVED', consent => {
  // log in and redirect the session which has the provided sessionId
})
```

### Consent format

```javascript
{
  id: '78c2b714-222f-42fa-8ffa-ff0d6366c856', // uuid for consent
  scope: [
    {
      domain: 'https://mycv.work', // Application domain with protocol
      area: 'work_experience', // Name of the subset of data covered by this consent, something which makes sense in your domain
      description: 'A list of your work experience with dates.', // Description of the contents of the data area
      permissions: [ 'write' ], // Can be read or write
      purpose: 'In order to create a CV using our website.',
      lawfulBasis: 'CONSENT' // One of 'CONSENT', 'CONTRACT', 'LEGAL_OBLIGATION', 'VITAL_INTERESTS', 'PUBLIC_TASK', 'LEGITIMATE_INTERESTS' 
    }
  ]
}
```

### Login request format
User logs in by scanning a QR-code containing:
`mydata://login/PAYLOAD`

where PAYLOAD is a base64url encoded (RFC4648) JSON string containing:
```javascript
{
  clientId: 'https://mycv.work',
  sessionId: '84845151884' // This is any string with which you can uniquely identify this user session
}
```
