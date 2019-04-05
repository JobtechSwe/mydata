const { Router } = require('express')
const { getPerson } = require('./../services/person')
const router = Router()

router.get('/', (req, res, next) => {
  const model = {
    user: getPerson(req.cookies.sessionId)
  }

  res.render('account', model)
})

module.exports = router
