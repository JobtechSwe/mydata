const createError = require('http-errors')
const express = require('express')
const cors = require('cors')
const routes = require('./routes')

const app = express()
app.locals.name = 'Smooth Operator'

app.use(express.json())

app.use(cors())
app.use('/', routes)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  if (req.app.get('env') === 'production') {
    err.stack = null
  }
  if (!err.status) {
    err = createError(500, err)
  }

  // render the error page
  res.status(err.status).send(err)
})

module.exports = app
