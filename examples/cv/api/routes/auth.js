const { Router } = require('express')
const router = Router()
// const { createDefaultRequest } = require('../services/consents')

module.exports = operator => {
  router.post('/', async (req, res, next) => {
    try {
      const { id, url } = await operator.initializeAuthentication()
      res.send({
        id,
        url
      })
    } catch (error) {
      console.error('Error when initializing authentication request', error)
      next(error)
    }
  })

  router.get('/:id', async (req, res, next) => {
    const authentication = await operator.getAuthentication(req.params.id)

    if (authentication) {
      res.send({ accessToken: authentication.accessToken })
    } else {
      res.sendStatus(404)
    }
  })

  return router
}
