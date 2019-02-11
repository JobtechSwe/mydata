const { Router } = require('express')
const accounts = require('./accounts')
const consents = require('./consents')
const clients = require('./clients')
const data = require('./data')

const router = Router()
router.use('/accounts', accounts)
router.use('/consents', consents)
router.use('/clients', clients)
router.use('/data', data)

/* GET home page. */
router.get('/', (req, res, next) => {
  res.send({})
})

module.exports = router
