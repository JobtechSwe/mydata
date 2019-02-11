# mydata-operator-client
Client library for mydata operator

## Install
`npm install @mydata/operator-client`

## Create client
```javascript
const { readFileSync } = require('fs')
const operator = require('@mydata/operator-client')

const config = {
  displayName: 'The name of your service',
  description: 'A nice description of your fantastic service'
  clientId: 'https://mycv.work', // Application domain with protocol
  operatorUrl: 'https://smoothoperator.work', // URL of Operator
  clientKeys: {
    publicKey: '',
    privateKey: ''
  }
  jwksUrl: '/jwks',     // endpoint for keys in jwks format
  eventsUrl: '/events'  // endpoint for events - webhook style
}
const client = operator(config)
```

## Provide routes
```javascript
const express = require('express')
const app = express()

// Routes used by the operator
app.use(client.routes)
```

## Subscribe to events
```javascript
client.events.on('CONSENT_APPROVED', consent => {
  // store your consent here and take action (eg. redirect user)
})
```

### Consent format
```javascript
{
  id: '78c2b714-222f-42fa-8ffa-ff0d6366c856', // uuid for consent
  scope: ['something']
}
```
