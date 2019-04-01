const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const client = require('./adapters/mydata')

const routes = require('./routes')
const app = express()

app.set('port', process.env.PORT || 2999)
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
