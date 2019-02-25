const express = require('express')
const routes = require('./routes/index')
const { saveConsent, saveConsentRequest } = require('./services/db')
const operator = require('./adapters/operator')
const logger = require('morgan')
const health = require('./routes/health')

operator.events.on('CONSENT_APPROVED', consent => {
  saveConsent(consent)
  saveConsentRequest(consent)
})

const app = express()
app.use(express.json())
app.use('/api', logger('dev'))
app.use('/api', routes(operator))
app.use('/health', health)

// Operator routes
app.use(operator.routes)

module.exports = app
