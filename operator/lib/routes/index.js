const { Router } = require('express')
const api = require('./api')
const health = require('./health')
const signed = require('../middleware/signed')

const router = Router()

router.use('/api', api)
router.use('/health', health)

/* GET home page. */
router.get('/', (req, res, next) => {
  res.send({ name: 'Smooth Operator' })
})

router.post('/services', signed('SERVICE_REGISTRATION'), () => {

})

router.post('/accounts', signed('ACCOUNT_REGISTRATION'), () => {

})

router.post('/?', signed('REGISTRATION', 'LOGIN'), () => {

})

router.get('/data/:domain?/:area?', signed('ACCESS_TOKEN'), () => {

})

router.post('/data/:domain?/:area?', signed('ACCESS_TOKEN'), () => {

})

module.exports = router
