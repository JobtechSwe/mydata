require('dotenv').config()
const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const client = require('./adapters/operator')

const routes = require('./routes')
const app = express()

if (process.env.APM_SERVER) {
  require('elastic-apm-node').start({
    serviceName: process.env.APP_NAME || 'mydata-national-registration', // Allowed characters: a-z, A-Z, 0-9, -, _, and space
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

app.set('port', process.env.PORT || 3999)
app.set('views', path.join(__dirname, '/views')) // critical to use path.join on windows
app.set('view engine', 'vash')
app.use(logger('dev'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(express.json())
app.use(client.routes)

app.use('/', routes(client))

app.listen(app.get('port'), function () {
  console.info('Express server listening on port ' + app.get('port'))

  client.connect().then(() => {
    console.info('Connected to operator!')
  }).catch(err => {
    console.error('Error when connecting to operator', err)
  })
})
