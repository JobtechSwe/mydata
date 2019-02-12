require('dotenv').config()
if (process.env.APM_SERVER) {
  require('elastic-apm-node').start({
    serviceName: process.env.APP_NAME || 'mydata-cv api', // Allowed characters: a-z, A-Z, 0-9, -, _, and space
    secretToken: process.env.APM_TOKEN || '', // Use if APM Server requires a token
    serverUrl: process.env.APM_SERVER, // Set APM Server URL
    captureBody: (process.env.NODE_ENV === 'production') // Don't save request body in production
      ? 'off'
      : 'errors'
  })
  console.log('APM instrumentation done')
} else {
  console.log('No APM instrumentation configured')
}
console.log(`NODE_ENV: ${process.env.NODE_ENV}`)

const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const server = require('./api/app')

const operator = require('./api/adapters/operator')

app.prepare().then(() => {
  server.get('*', (req, res) => {
    handle(req, res)
  })
  server.listen(process.env.PORT || 4000, () => {
    operator.connect()
  })
})
