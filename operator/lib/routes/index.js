const { Router } = require('express')
const api = require('./api')

const router = Router()

router.use('/api', api)

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' })
})

module.exports = router
