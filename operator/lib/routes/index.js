const { Router } = require('express')
const api = require('./api')
const health = require('./health')

const router = Router()

router.use('/api', api)
router.use('/health', health)

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' })
})

module.exports = router
