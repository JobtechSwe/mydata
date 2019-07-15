const { Router } = require('express')
const router = Router()
const auth = require('./auth')
const data = require('./data')

module.exports = operator => {
  router.use('/auth', auth(operator))
  router.use('/data', data(operator))

  return router
}
