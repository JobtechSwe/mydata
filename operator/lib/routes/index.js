const { Router } = require('express')
const api = require('./api')

const router = Router()

router.use('/api', api)

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' })
})

router.get('/health', (req, res, next) => {
  // TODO: Check health of dependencies.
  res.send({
    status: {
      api: 'OK',
      redis: '?',
      postgres: '?'
    }
  })
  return next()
})

module.exports = router
