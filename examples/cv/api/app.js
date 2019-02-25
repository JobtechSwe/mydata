const express = require('express')
const routes = require('./routes')
const { saveConsent, saveConsentRequest } = require('./services/db')
const operator = require('./adapters/operator')
const logger = require('morgan')
const postgres = require('./adapters/postgres')
const redis = require('./adapters/redis')

operator.events.on('CONSENT_APPROVED', consent => {
  saveConsent(consent)
  saveConsentRequest(consent)
})

const app = express()
app.use(express.json())
app.use('/api', logger('dev'))
app.use('/api', routes(operator))
app.use('/health', (req, res, next) => {
  const status = {
    operator: '?'
  }

  operator.connect().then(() => {
    status.operator = 'OK'
  })
  .catch(error => {
    res.statusCode = 503
    status.operator = '!OK'
  })
  .then(() => {
    return postgres.connect()
  })
  .then(() => {
    status.postgres = 'OK'
  })
  .catch(error => {
    res.statusCode = 503
    status.postgres = '!OK'
  })
  .then(() => {
    if (redis.status === 'ready') {
      status.redis = 'OK'
    } else {
      res.statusCode = 503
      status.redis = '!OK'
    }
  })
  .finally(() => {
    res.send({
      status
    })
  
    return next()
  })
})

// Operator routes
app.use(operator.routes)

module.exports = app
