const { Router } = require('express')
const connect = require('./connect')
const account = require('./account')
const { v4 } = require('uuid')

module.exports = client => {
  const router = Router()

  router.use((req, res, next) => {
    if (req.path !== '/' && !req.cookies.sessionId) {
      return res.redirect('/')
    }
    next()
  })

  router.use('/connect', connect(client))
  router.use('/account', account(client))

  router.get('/', (req, res, next) => {
    if (!req.cookies.sessionId) {
      res.cookie('sessionId', v4(), { maxAge: 1000 * 3600 })
    }
    res.render('index', {
      onIndexPage: true
    })
  })

  return router
}
