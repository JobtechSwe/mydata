const { Router } = require('express')
const { getPerson } = require('./../services/person')

module.exports = client => {
  const router = Router()

  router.get('/', async (req, res, next) => {
    const sessionId = req.cookies.sessionId
    const consentIdForSessionId = await client.keyProvider.keyValueStore.load(`sessionId/${sessionId}`)

    const model = {
      user: getPerson(sessionId),
      isConnected: !!consentIdForSessionId
    }
    res.render('account', model)
  })

  return router
}
