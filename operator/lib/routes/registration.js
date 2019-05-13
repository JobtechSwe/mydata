const { signed } = require('@mydata/messaging/lib/middleware')
const { REGISTRATION } = require('@mydata/messaging/lib/schemas')

const { Router } = require('express')
const router = new Router()

router.post('/', signed(REGISTRATION, { jwk: true }), (req, res, next) => {

})

module.exports = router
