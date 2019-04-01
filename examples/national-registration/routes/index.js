const { Router } = require('express')
const auth = require('./auth')

module.exports = client => {
  const router = Router()

  router.use('/auth', auth(client))
  router.get('/done', (req, res, next) => {
    res.write('thank you')
  })

  router.get('/', (req, res, next) => {
    res.render('index', {})
  })

  return router
}
