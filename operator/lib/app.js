const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const routes = require('./routes')

const app = express()
app.locals.name = 'Smooth Operator'

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use('/material', express.static(path.join(__dirname, '../node_modules/material-design-lite/dist/')))

app.use(cors())
app.use('/', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
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
