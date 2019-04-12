const express = require('express')
const routes = require('./routes/index')
const { saveConsentRequest, saveLoginApproval } = require('./services/db')
const operator = require('./adapters/operator')
const logger = require('morgan')
const health = require('./routes/health')

operator.events.on('CONSENT_APPROVED', consent => {
  saveConsentRequest(consent)
})

operator.events.on('LOGIN_APPROVED', approval => {
  saveLoginApproval(approval)
})

const app = express()
app.use(express.json())
app.use('/api', logger('dev'))
app.use('/api', routes(operator))
app.use('/health', health)

// Operator routes
app.use(operator.routes)

module.exports = app
