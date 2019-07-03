const { Router } = require('express')
const router = Router()
const { getConsentRequest } = require('../services/db')
const auth = require('./auth')
const data = require('./data')

module.exports = operator => {
  router.use('/auth', auth(operator))
  router.use('/data', data(operator))

  // TODO: This is not very secure. Anyone with the id can race the GET-request and steal the secret token.
  // Instead, we should probably associate the consent request with a session and then log in that session once it's approved.
  router.get('/consentrequest/:id', async (req, res, next) => {
    const result = getConsentRequest(req.params.id)
    if (result) {
      res.send({ accessToken: result.accessToken })
    } else {
      res.sendStatus(404)
    }
  })

  return router
}
